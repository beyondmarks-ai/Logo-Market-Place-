import { currentAccount } from "./auth";
import { NextRequest, NextResponse } from "next/server";
export async function requireAdmin(request: NextRequest) {
  const account = await currentAccount(request);
  return account?.role === "admin" ? { account } : { response: NextResponse.json({ error: { code: "forbidden", message: "Administrator access is required." } }, { status: account ? 403 : 401 }) };
}
