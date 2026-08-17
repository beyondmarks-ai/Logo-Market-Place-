import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSession, setSessionCookie } from "../../../../lib/auth";
import { authRateLimit } from "../../../../lib/auth-rate-limit";
import { grantCredits } from "../../../../lib/credits";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const limited = await authRateLimit(request, "signin", 10); if (limited) return limited;
  try {
    const body = await request.json();
    const account = await authenticate(String(body.email || ""), String(body.password || ""));
    if (!account) return NextResponse.json({ error: { code: "invalid_credentials", message: "Email or password is incorrect." } }, { status: 401 });
    if (!account.verifiedAt) return NextResponse.json({ error: { code: "email_unverified", message: "Verify your email before signing in." } }, { status: 403 });
    if (account.status !== "active") return NextResponse.json({ error: { code: "account_unavailable", message: "This account is not active." } }, { status: 403 });
    await grantCredits(account.userId, 5, "signup", "verified_signup", "Welcome credits");
    const session = await createSession(account.userId);
    const response = NextResponse.json({ data: { userId: account.userId, email: account.email, role: account.role } });
    await setSessionCookie(response, session.token);
    return response;
  } catch { return NextResponse.json({ error: { code: "service_unavailable", message: "Sign in is temporarily unavailable." } }, { status: 503 }); }
}
