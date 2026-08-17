import { NextRequest, NextResponse } from "next/server";
import { revokeAllAccountKeys } from "../../../../../lib/account-api-keys";
import { requireAdmin } from "../../../../../lib/admin";
import { getAccountById } from "../../../../../lib/auth";
import { getCreditBalance, listLedger } from "../../../../../lib/credits";
import { getTableClient } from "../../../../../lib/table-storage";
export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin(request); if ("response" in auth) return auth.response;
  const { userId } = await context.params; const account = await getAccountById(userId);
  if (!account) return NextResponse.json({ error: { code: "not_found", message: "User not found." } }, { status: 404 });
  const { passwordHash: _hidden, ...safe } = account;
  return NextResponse.json({ data: { account: safe, credits: await getCreditBalance(userId), ledger: await listLedger(userId, 100) } });
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin(request); if ("response" in auth) return auth.response;
  const { userId } = await context.params; const { status } = await request.json();
  if (!["active", "suspended"].includes(status)) return NextResponse.json({ error: { code: "invalid_status", message: "Status must be active or suspended." } }, { status: 400 });
  await getTableClient(process.env.AZURE_ACCOUNTS_TABLE || "LogoAccounts").updateEntity({ partitionKey: "user", rowKey: userId, status, updatedAt: new Date().toISOString() }, "Merge");
  if (status === "suspended") await revokeAllAccountKeys(userId);
  return NextResponse.json({ data: { userId, status } });
}
