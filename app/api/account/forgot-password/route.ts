import { NextRequest, NextResponse } from "next/server";
import { getAccountByEmail, issueAuthToken } from "../../../../lib/auth";
import { sendAccountEmail } from "../../../../lib/email";
import { authRateLimit } from "../../../../lib/auth-rate-limit";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const limited = await authRateLimit(request, "forgot", 5); if (limited) return limited;
  try {
    const { email } = await request.json();
    const account = await getAccountByEmail(String(email || ""));
    let previewUrl: string | undefined;
    if (account) {
      const { token } = await issueAuthToken(account.userId, "reset");
      const sent = await sendAccountEmail(account.email, "reset", token);
      previewUrl = "previewUrl" in sent ? sent.previewUrl : undefined;
    }
    return NextResponse.json({ data: { message: "If an account exists, a reset link has been sent.", ...(previewUrl ? { previewUrl } : {}) } });
  } catch { return NextResponse.json({ data: { message: "If an account exists, a reset link has been sent." } }); }
}
