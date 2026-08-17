import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { verifyAndGrantOrder } from "../../../../lib/billing";
export async function POST(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
  try {
    const body = await request.json();
    const result = await verifyAndGrantOrder(String(body.razorpay_order_id || ""), String(body.razorpay_payment_id || ""), String(body.razorpay_signature || ""), account.userId);
    return NextResponse.json({ data: result });
  } catch { return NextResponse.json({ error: { code: "payment_verification_failed", message: "Payment verification failed. Contact support if you were charged." } }, { status: 400 }); }
}
