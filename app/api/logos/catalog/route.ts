import { NextRequest, NextResponse } from "next/server";
import { currentAccount } from "../../../../lib/auth";
import { getLogoCatalog } from "../../../../lib/logo-service";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const account = await currentAccount(request);
  if (!account) return NextResponse.json({ error: { code: "authentication_required", message: "Sign in to view the logo marketplace." } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    return NextResponse.json(await getLogoCatalog(), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: { code: "catalog_unavailable", message: "Logo catalog is temporarily unavailable." } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
