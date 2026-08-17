import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin";
import { getCreditBalance } from "../../../../lib/credits";
import { getTableClient } from "../../../../lib/table-storage";
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request); if ("response" in auth) return auth.response;
  const users = [];
  for await (const entity of getTableClient(process.env.AZURE_ACCOUNTS_TABLE || "LogoAccounts").listEntities<{ userId: string; email: string; role: string; status: string; createdAt: string; verifiedAt?: string }>({ queryOptions: { filter: "PartitionKey eq 'user'", select: ["userId", "email", "role", "status", "createdAt", "verifiedAt"] } })) {
    users.push({ userId: entity.userId, email: entity.email, role: entity.role, status: entity.status, createdAt: entity.createdAt, verifiedAt: entity.verifiedAt, credits: await getCreditBalance(entity.userId) });
  }
  return NextResponse.json({ data: users.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}
