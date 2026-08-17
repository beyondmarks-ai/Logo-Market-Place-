import { NextRequest, NextResponse } from "next/server";
import { signPaymentReference, verifyAndGrantOrder, verifyWebhook } from "../../../../lib/billing";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!(await verifyWebhook(body, request.headers.get("x-razorpay-signature") || ""))) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  try {
    const event = JSON.parse(body);
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && payment?.id) {
        const signature = await signPaymentReference(payment.order_id, payment.id);
        await verifyAndGrantOrder(payment.order_id, payment.id, signature);
      }
    }
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "processing_failed" }, { status: 500 }); }
}
