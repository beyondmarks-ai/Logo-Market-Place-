import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { debitCredit } from "../../../../lib/credits";
import { fetchLogoAsset } from "../../../../lib/logo-service";
import { customizeSvg, isHexColor, type SvgColorOptions } from "../../../../lib/svg-customize";

const SAFE_PATH = /^[a-z0-9][a-z0-9-]*\/[a-zA-Z0-9_-]+\.svg$/;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to download logos." } }, { status: 401 });
  const path = request.nextUrl.searchParams.get("path") || "";
  const requestedName = request.nextUrl.searchParams.get("name") || "logo";
  if (!SAFE_PATH.test(path)) return NextResponse.json({ error: { code: "invalid_path", message: "Invalid logo path." } }, { status: 400 });

  const color = request.nextUrl.searchParams.get("color");
  const gradientStart = request.nextUrl.searchParams.get("gradientStart");
  const gradientEnd = request.nextUrl.searchParams.get("gradientEnd");
  let colorOptions: SvgColorOptions = { mode: "original" };
  if (color) {
    if (!isHexColor(color)) return NextResponse.json({ error: { code: "invalid_color", message: "Use a six-digit hex color." } }, { status: 400 });
    colorOptions = { mode: "solid", color };
  } else if (gradientStart || gradientEnd) {
    if (!gradientStart || !gradientEnd || !isHexColor(gradientStart) || !isHexColor(gradientEnd)) return NextResponse.json({ error: { code: "invalid_gradient", message: "Provide valid gradient start and end colors." } }, { status: 400 });
    colorOptions = { mode: "gradient", start: gradientStart, end: gradientEnd };
  }

  const asset = await fetchLogoAsset(path);
  if (!asset) return NextResponse.json({ error: { code: "logo_not_found", message: "Logo not found." } }, { status: 404 });
  const body = colorOptions.mode === "original"
    ? new Uint8Array(await asset.arrayBuffer())
    : customizeSvg(await asset.text(), colorOptions);
  const reference = randomUUID();
  const charge = await debitCredit(account.userId, reference, `Logo download: ${requestedName}`);
  if (!charge) return NextResponse.json({ error: { code: "insufficient_credits", message: "You need 1 credit to download this logo." } }, { status: 402, headers: { "X-Credits-Remaining": "0", "Cache-Control": "no-store" } });

  const suffix = colorOptions.mode === "original" ? "" : `-${colorOptions.mode}`;
  const fileName = `${requestedName.replace(/[^a-zA-Z0-9_-]/g, "-") || "logo"}${suffix}.svg`;
  return new NextResponse(body, { headers: {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Credits-Remaining": String(charge.balance),
  }});
}
