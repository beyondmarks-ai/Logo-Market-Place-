import { NextRequest, NextResponse } from "next/server";
import { consumeAuthToken, setPassword } from "../../../../lib/auth";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();
    if (password !== confirmPassword) return NextResponse.json({ error: { code: "password_mismatch", message: "Passwords do not match." } }, { status: 400 });
    const userId = await consumeAuthToken(String(token || ""), "reset");
    if (!userId) return NextResponse.json({ error: { code: "invalid_token", message: "This reset link is invalid or expired." } }, { status: 400 });
    await setPassword(userId, String(password || ""));
    return NextResponse.json({ data: { message: "Password updated. You can now sign in." } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset is temporarily unavailable.";
    return NextResponse.json({ error: { code: "reset_failed", message } }, { status: 400 });
  }
}
