import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../../lib/admin";
import { adjustCredits } from "../../../../../../lib/credits";
export async function POST(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin(request); if ("response" in auth) return auth.response;
  const { userId } = await context.params; const { amount, reason } = await request.json(); const value = Number(amount);
  if (!Number.isSafeInteger(value) || value < -100000 || value > 100000 || value === 0) return NextResponse.json({ error: { code: "invalid_amount", message: "Amount must be a non-zero integer from -100,000 to 100,000." } }, { status: 400 });
  const result = await adjustCredits(userId, value, `admin_${crypto.randomUUID()}`, String(reason || "Administrative credit adjustment").slice(0, 120));
  return NextResponse.json({ data: result });
}
