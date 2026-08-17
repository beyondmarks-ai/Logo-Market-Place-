import { NextRequest, NextResponse } from "next/server";
import { accountError, createAccount, issueAuthToken } from "../../../../lib/auth";
import { sendAccountEmail } from "../../../../lib/email";
import { authRateLimit } from "../../../../lib/auth-rate-limit";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const limited = await authRateLimit(request, "signup", 5); if (limited) return limited;
  try {
    const body = await request.json();
    if (body.password !== body.confirmPassword) return NextResponse.json({ error: { code: "password_mismatch", message: "Passwords do not match." } }, { status: 400 });
    const account = await createAccount(String(body.email || ""), String(body.password || ""));
    const { token } = await issueAuthToken(account.userId, "verify");
    const delivery = await sendAccountEmail(account.email, "verify", token);
    return NextResponse.json({ data: { message: "Check your email to verify your account.", ...delivery } }, { status: 201 });
  } catch (error) { return accountError(error); }
}
