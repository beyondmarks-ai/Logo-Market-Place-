import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { createBillingOrder, CREDIT_PACKS, type PackId } from "../../../../lib/billing";
export async function POST(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to purchase credits." } }, { status: 401 });
  try {
    const { packId } = await request.json();
    if (!(String(packId) in CREDIT_PACKS)) return NextResponse.json({ error: { code: "invalid_pack", message: "Choose a valid credit pack." } }, { status: 400 });
    return NextResponse.json({ data: await createBillingOrder(account.userId, account.email, packId as PackId) });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "billing_unavailable";
    return NextResponse.json({ error: { code: unavailable ? "billing_unavailable" : "order_failed", message: unavailable ? "Payments are being configured. Please try again later." : "The order could not be created." } }, { status: unavailable ? 503 : 502 });
  }
}
