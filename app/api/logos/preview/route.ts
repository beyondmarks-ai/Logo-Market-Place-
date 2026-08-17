import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { fetchLogoAsset } from "../../../../lib/logo-service";

const SAFE_PATH = /^[a-z0-9][a-z0-9-]*\/[a-zA-Z0-9_-]+\.svg$/;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to preview logos." } }, { status: 401 });
  const path = request.nextUrl.searchParams.get("path") || "";
  if (!SAFE_PATH.test(path)) return NextResponse.json({ error: { code: "invalid_path", message: "Invalid logo path." } }, { status: 400 });
  const asset = await fetchLogoAsset(path);
  if (!asset) return NextResponse.json({ error: { code: "logo_not_found", message: "Logo not found." } }, { status: 404 });
  return new NextResponse(new Uint8Array(await asset.arrayBuffer()), { headers: {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Content-Disposition": "inline",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  }});
}
