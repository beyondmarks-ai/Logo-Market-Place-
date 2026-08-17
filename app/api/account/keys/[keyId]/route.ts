import { NextRequest, NextResponse } from "next/server";
import { revokeAccountKey } from "../../../../../lib/account-api-keys";
import { currentAccount } from "../../../../../lib/auth";
export async function DELETE(request: NextRequest, context: { params: Promise<{ keyId: string }> }) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
  const { keyId } = await context.params;
  const revoked = await revokeAccountKey(account.userId, keyId);
  return revoked ? NextResponse.json({ data: { revoked: true } }) : NextResponse.json({ error: { code: "not_found", message: "API key not found." } }, { status: 404 });
}
