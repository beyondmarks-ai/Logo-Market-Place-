import { NextRequest, NextResponse } from "next/server";

const AZURE_BASE = (process.env.NEXT_PUBLIC_LOGO_STORAGE_BASE_URL || "https://logomarketplace617db5.blob.core.windows.net/logos").replace(/\/$/, "");
const SOURCE_BASE = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";
const SAFE_PATH = /^[a-z0-9][a-z0-9-]*\/[a-zA-Z0-9_-]+\.svg$/;

async function fetchLogo(url: string) {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    return response.ok ? response : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "";
  const requestedName = request.nextUrl.searchParams.get("name") || "logo";
  if (!SAFE_PATH.test(path)) return NextResponse.json({ error: "Invalid logo path." }, { status: 400 });

  const response = await fetchLogo(`${AZURE_BASE}/${path}`) ?? await fetchLogo(`${SOURCE_BASE}/${path}`);
  if (!response) return NextResponse.json({ error: "Logo not found." }, { status: 404 });

  const fileName = `${requestedName.replace(/[^a-zA-Z0-9_-]/g, "-") || "logo"}.svg`;
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
