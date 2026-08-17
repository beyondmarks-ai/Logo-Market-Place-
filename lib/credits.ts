import { randomUUID } from "node:crypto";
import { TableTransaction, type TableEntityResult } from "@azure/data-tables";
import { getTableClient, storageStatus } from "./table-storage";

const CREDITS = process.env.AZURE_CREDITS_TABLE || "LogoCredits";

type Balance = { available: number; lifetimeGranted: number; lifetimeUsed: number; updatedAt: string };
type Lot = { remaining: number; granted: number; source: string; createdAt: string };

export type LedgerEntry = {
  id: string; type: "credit" | "debit" | "refund" | "adjustment"; amount: number;
  balanceAfter: number; description: string; createdAt: string; reference?: string;
};

async function balanceEntity(userId: string) {
  try { return await getTableClient(CREDITS).getEntity<Balance>(userId, "balance"); }
  catch (error) { if (storageStatus(error) === 404) return null; throw error; }
}

export async function getCreditBalance(userId: string) {
  return Number((await balanceEntity(userId))?.available || 0);
}

export async function grantCredits(userId: string, amount: number, source: string, reference: string, description: string) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Credit amount must be a positive integer.");
  const client = getTableClient(CREDITS);
  const markerKey = `grant_${reference}`.slice(0, 1024);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try { await client.getEntity(userId, markerKey); return { granted: false, balance: await getCreditBalance(userId) }; }
    catch (error) { if (storageStatus(error) !== 404) throw error; }
    const current = await balanceEntity(userId);
    const now = new Date().toISOString();
    const next = Number(current?.available || 0) + amount;
    const ledgerId = `ledger_${Date.now().toString().padStart(13, "0")}_${randomUUID()}`;
    const lotId = `lot_${Date.now().toString().padStart(13, "0")}_${randomUUID()}`;
    const transaction = new TableTransaction();
    if (current) transaction.updateEntity({ partitionKey: userId, rowKey: "balance", available: next, lifetimeGranted: Number(current.lifetimeGranted || 0) + amount, updatedAt: now }, "Merge", { etag: current.etag });
    else transaction.createEntity({ partitionKey: userId, rowKey: "balance", available: next, lifetimeGranted: amount, lifetimeUsed: 0, updatedAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: markerKey, source, amount, createdAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: lotId, remaining: amount, granted: amount, source, reference, createdAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: ledgerId, id: ledgerId, type: "credit", amount, balanceAfter: next, description, reference, createdAt: now });
    try { await client.submitTransaction(transaction.actions); return { granted: true, balance: next }; }
    catch (error) { if ([409, 412].includes(storageStatus(error))) continue; throw error; }
  }
  throw new Error("Unable to grant credits due to concurrent updates.");
}

export async function debitCredit(userId: string, reference: string, description = "API request") {
  const client = getTableClient(CREDITS);
  const debitMarker = `debit_${reference}`;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const prior = await client.getEntity<{ balanceAfter: number }>(userId, debitMarker);
      return { debited: false, balance: Number(prior.balanceAfter), reference };
    } catch (error) { if (storageStatus(error) !== 404) throw error; }
    const current = await balanceEntity(userId);
    if (!current || Number(current.available) < 1) return null;
    let chosen: TableEntityResult<Lot> | null = null;
    for await (const lot of client.listEntities<Lot>({ queryOptions: { filter: `PartitionKey eq '${userId}' and RowKey ge 'lot_' and RowKey lt 'lot\u0060'` } })) {
      if (Number(lot.remaining) > 0) { chosen = lot; break; }
    }
    if (!chosen) return null;
    const now = new Date().toISOString();
    const next = Number(current.available) - 1;
    const transaction = new TableTransaction();
    transaction.updateEntity({ partitionKey: userId, rowKey: "balance", available: next, lifetimeUsed: Number(current.lifetimeUsed || 0) + 1, updatedAt: now }, "Merge", { etag: current.etag });
    transaction.updateEntity({ partitionKey: userId, rowKey: chosen.rowKey!, remaining: Number(chosen.remaining) - 1 }, "Merge", { etag: chosen.etag });
    transaction.createEntity({ partitionKey: userId, rowKey: debitMarker, balanceAfter: next, lotId: chosen.rowKey, createdAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: `ledger_${Date.now().toString().padStart(13, "0")}_${randomUUID()}`, id: reference, type: "debit", amount: -1, balanceAfter: next, description, reference, createdAt: now });
    try { await client.submitTransaction(transaction.actions); return { debited: true, balance: next, reference }; }
    catch (error) { if ([409, 412].includes(storageStatus(error))) continue; throw error; }
  }
  throw new Error("Unable to debit credits due to concurrent updates.");
}

export async function refundCredit(userId: string, reference: string, description = "Automatic refund for failed API request") {
  const client = getTableClient(CREDITS);
  try { await client.getEntity(userId, `refund_${reference}`); return getCreditBalance(userId); }
  catch (error) { if (storageStatus(error) !== 404) throw error; }
  let debit: TableEntityResult<{ lotId: string }>;
  try { debit = await client.getEntity(userId, `debit_${reference}`); }
  catch (error) { if (storageStatus(error) === 404) return getCreditBalance(userId); throw error; }
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await balanceEntity(userId);
    if (!current) return 0;
    const lot = await client.getEntity<Lot>(userId, debit.lotId);
    const now = new Date().toISOString();
    const next = Number(current.available) + 1;
    const transaction = new TableTransaction();
    transaction.updateEntity({ partitionKey: userId, rowKey: "balance", available: next, lifetimeUsed: Math.max(0, Number(current.lifetimeUsed || 0) - 1), updatedAt: now }, "Merge", { etag: current.etag });
    transaction.updateEntity({ partitionKey: userId, rowKey: lot.rowKey!, remaining: Number(lot.remaining) + 1 }, "Merge", { etag: lot.etag });
    transaction.createEntity({ partitionKey: userId, rowKey: `refund_${reference}`, createdAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: `ledger_${Date.now().toString().padStart(13, "0")}_${randomUUID()}`, id: reference, type: "refund", amount: 1, balanceAfter: next, description, reference, createdAt: now });
    try { await client.submitTransaction(transaction.actions); return next; }
    catch (error) { if ([409, 412].includes(storageStatus(error))) continue; throw error; }
  }
  throw new Error("Unable to refund credits due to concurrent updates.");
}

export async function adjustCredits(userId: string, amount: number, reference: string, description: string) {
  if (!Number.isSafeInteger(amount) || amount === 0) throw new Error("invalid_amount");
  if (amount > 0) return grantCredits(userId, amount, "admin", reference, description);
  const deduction = Math.abs(amount);
  const client = getTableClient(CREDITS);
  const markerKey = `adjust_${reference}`;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try { const prior = await client.getEntity<{ balanceAfter: number }>(userId, markerKey); return { granted: false, balance: Number(prior.balanceAfter) }; }
    catch (error) { if (storageStatus(error) !== 404) throw error; }
    const current = await balanceEntity(userId);
    if (!current || Number(current.available) < deduction) throw new Error("insufficient_credits");
    let remaining = deduction;
    const lots: Array<{ entity: TableEntityResult<Lot>; take: number }> = [];
    for await (const lot of client.listEntities<Lot>({ queryOptions: { filter: `PartitionKey eq '${userId}' and RowKey ge 'lot_' and RowKey lt 'lot\u0060'` } })) {
      const available = Number(lot.remaining || 0); if (available < 1) continue;
      const take = Math.min(available, remaining); lots.push({ entity: lot, take }); remaining -= take; if (!remaining) break;
    }
    if (remaining || lots.length > 95) throw new Error("credit_lots_unavailable");
    const now = new Date().toISOString(); const next = Number(current.available) - deduction; const transaction = new TableTransaction();
    transaction.updateEntity({ partitionKey: userId, rowKey: "balance", available: next, lifetimeUsed: Number(current.lifetimeUsed || 0) + deduction, updatedAt: now }, "Merge", { etag: current.etag });
    for (const item of lots) transaction.updateEntity({ partitionKey: userId, rowKey: item.entity.rowKey!, remaining: Number(item.entity.remaining) - item.take }, "Merge", { etag: item.entity.etag });
    transaction.createEntity({ partitionKey: userId, rowKey: markerKey, balanceAfter: next, amount, createdAt: now });
    transaction.createEntity({ partitionKey: userId, rowKey: `ledger_${Date.now().toString().padStart(13, "0")}_${randomUUID()}`, id: reference, type: "adjustment", amount, balanceAfter: next, description, reference, createdAt: now });
    try { await client.submitTransaction(transaction.actions); return { granted: false, balance: next }; } catch (error) { if ([409, 412].includes(storageStatus(error))) continue; throw error; }
  }
  throw new Error("Unable to adjust credits due to concurrent updates.");
}
export async function listLedger(userId: string, limit = 50) {
  const entries: LedgerEntry[] = [];
  const iter = getTableClient(CREDITS).listEntities<LedgerEntry>({ queryOptions: { filter: `PartitionKey eq '${userId}' and RowKey ge 'ledger_' and RowKey lt 'ledger\u0060'`, select: ["rowKey", "id", "type", "amount", "balanceAfter", "description", "createdAt", "reference"] } });
  for await (const entity of iter) entries.push({ ...entity, id: entity.id || entity.rowKey } as LedgerEntry);
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Math.min(100, Math.max(1, limit)));
}
