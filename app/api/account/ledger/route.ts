import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { getCreditBalance, listLedger } from "../../../../lib/credits";
export async function GET(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
  return NextResponse.json({ data: { balance: await getCreditBalance(account.userId), entries: await listLedger(account.userId, Number(request.nextUrl.searchParams.get("limit") || 50)) } }, { headers: { "Cache-Control": "no-store" } });
}
