import { randomBytes, randomUUID } from "node:crypto";
import { getTableClient, storageStatus } from "./table-storage";
import { sha256 } from "./security";

const KEYS = process.env.AZURE_API_KEYS_TABLE || "LogoApiKeys";
export type AccountKey = { keyId: string; name: string; prefix: string; last4: string; status: string; createdAt: string; lastUsedAt?: string };

export async function listAccountKeys(userId: string) {
  const keys: AccountKey[] = [];
  for await (const entity of getTableClient(KEYS).listEntities<AccountKey>({ queryOptions: { filter: `userId eq '${userId}'`, select: ["keyId", "name", "prefix", "last4", "status", "createdAt", "lastUsedAt"] } })) keys.push(entity as unknown as AccountKey);
  return keys.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createAccountKey(userId: string, nameInput: string) {
  const active = (await listAccountKeys(userId)).filter((key) => key.status === "active");
  if (active.length >= 3) throw new Error("key_limit");
  const name = nameInput.trim().slice(0, 60) || "Default key";
  const secret = `lmp_live_${randomBytes(32).toString("base64url")}`;
  const keyId = randomUUID();
  const createdAt = new Date().toISOString();
  await getTableClient(KEYS).createEntity({ partitionKey: "key", rowKey: sha256(secret), keyId, userId, name, label: name, prefix: secret.slice(0, 13), last4: secret.slice(-4), status: "active", plan: "prepaid", perMinute: 60, createdAt });
  return { keyId, name, secret, prefix: secret.slice(0, 13), last4: secret.slice(-4), status: "active", createdAt };
}

export async function revokeAccountKey(userId: string, keyId: string) {
  const client = getTableClient(KEYS);
  for await (const key of client.listEntities<{ userId: string; keyId: string }>({ queryOptions: { filter: `userId eq '${userId}' and keyId eq '${keyId}'` } })) {
    if (!key.partitionKey || !key.rowKey) continue;
    await client.updateEntity({ partitionKey: key.partitionKey, rowKey: key.rowKey, status: "revoked", revokedAt: new Date().toISOString() }, "Merge");
    return true;
  }
  return false;
}

export async function revokeAllAccountKeys(userId: string) {
  const client = getTableClient(KEYS);
  for await (const key of client.listEntities<{ userId: string }>({ queryOptions: { filter: `userId eq '${userId}' and status eq 'active'` } })) {
    if (!key.partitionKey || !key.rowKey) continue;
    await client.updateEntity({ partitionKey: key.partitionKey, rowKey: key.rowKey, status: "revoked", revokedAt: new Date().toISOString() }, "Merge").catch((error) => { if (storageStatus(error) !== 404) throw error; });
  }
}
