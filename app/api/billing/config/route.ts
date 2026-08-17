import { NextResponse } from "next/server";
import { billingConfigured, CREDIT_PACKS } from "../../../../lib/billing";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ data: { enabled: billingConfigured(), currency: "INR", packs: Object.entries(CREDIT_PACKS).map(([id, pack]) => ({ id, ...pack })) } }, { headers: { "Cache-Control": "no-store" } });
}
