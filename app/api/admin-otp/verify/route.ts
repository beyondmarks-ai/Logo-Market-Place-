import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSessionSecret, verifyOtp } from "../../../../lib/admin-otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { requestId, code } = await request.json() as { requestId?: string; code?: string };
    if (!requestId || !code || !/^\d{6}$/.test(code) || !(await verifyOtp(requestId, code))) {
      return NextResponse.json({ error: "The code is incorrect, expired, or has too many attempts." }, { status: 401 });
    }
    const secret = await getAdminSessionSecret();
    const expires = Date.now() + 8 * 60 * 60_000;
    const value = `${expires}.${createHmac("sha256", secret).update(String(expires)).digest("hex")}`;
    const response = NextResponse.json({ verified: true });
    response.cookies.set("admin_session", value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }
}
