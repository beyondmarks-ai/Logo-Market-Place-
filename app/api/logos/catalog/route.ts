import { NextResponse } from "next/server";

const AZURE_BASE = (process.env.NEXT_PUBLIC_LOGO_STORAGE_BASE_URL || "https://logomarketplace617db5.blob.core.windows.net/logos").replace(/\/$/, "");
const SOURCE_CATALOG = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/src/data/icons.json";

async function fetchCatalog(url: string) {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    return response.ok ? response : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const response = await fetchCatalog(`${AZURE_BASE}/catalog.json`) ?? await fetchCatalog(SOURCE_CATALOG);
  if (!response) {
    return NextResponse.json({ error: "Logo catalog is unavailable." }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
