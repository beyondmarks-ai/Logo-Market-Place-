import { NextRequest, NextResponse } from "next/server";
import { createAccountKey, listAccountKeys } from "../../../../lib/account-api-keys";
import { currentAccount } from "../../../../lib/auth";
export async function GET(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
  return NextResponse.json({ data: await listAccountKeys(account.userId) });
}
export async function POST(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
  try { const { name } = await request.json(); return NextResponse.json({ data: await createAccountKey(account.userId, String(name || "")) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: { code: error instanceof Error && error.message === "key_limit" ? "key_limit" : "key_creation_failed", message: error instanceof Error && error.message === "key_limit" ? "You can have up to 3 active API keys." : "The API key could not be created." } }, { status: 400 }); }
}
