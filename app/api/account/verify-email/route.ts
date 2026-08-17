import { NextRequest, NextResponse } from "next/server";
import { consumeAuthToken, createSession, getAccountById, setSessionCookie, verifyAccount } from "../../../../lib/auth";
import { grantCredits } from "../../../../lib/credits";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const userId = await consumeAuthToken(String(token || ""), "verify");
    if (!userId) return NextResponse.json({ error: { code: "invalid_token", message: "This verification link is invalid or expired." } }, { status: 400 });
    const account = await verifyAccount(userId);
    if (!account) return NextResponse.json({ error: { code: "invalid_token", message: "Account not found." } }, { status: 400 });
    await grantCredits(userId, 5, "signup", "verified_signup", "Welcome credits");
    const session = await createSession(userId);
    const response = NextResponse.json({ data: { account, credits: 5 } });
    await setSessionCookie(response, session.token);
    return response;
  } catch { return NextResponse.json({ error: { code: "service_unavailable", message: "Verification is temporarily unavailable." } }, { status: 503 }); }
}
