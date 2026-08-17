import { NextRequest, NextResponse } from "next/server";
import { apiHeaders, apiOptions, authorizeApiRequest, finalizeApiResponse } from "../../../../lib/api-auth";
import { getLogoCatalog, searchLogos, type LogoRecord } from "../../../../lib/logo-service";

export const runtime = "nodejs";

function encodeCursor(offset: number) {
  return Buffer.from(String(offset)).toString("base64url");
}

function decodeCursor(value: string | null) {
  if (!value) return 0;
  const decoded = Number(Buffer.from(value, "base64url").toString("utf8"));
  return Number.isSafeInteger(decoded) && decoded >= 0 ? decoded : null;
}

function serializeLogo(logo: LogoRecord, origin: string) {
  const variants = Object.keys(logo.variants);
  return {
    slug: logo.slug,
    name: logo.title,
    aliases: logo.aliases || [],
    categories: logo.categories || [],
    collection: logo.collection || null,
    variants,
    url: `${origin}/api/v1/brands/${encodeURIComponent(logo.slug)}`,
    downloads: Object.fromEntries(variants.map((variant) => [variant, `${origin}/api/v1/brands/${encodeURIComponent(logo.slug)}/download?variant=${encodeURIComponent(variant)}`])),
  };
}

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (!auth.ok) return auth.response;
  const headers = apiHeaders(auth.context);
  const query = request.nextUrl.searchParams.get("query") || request.nextUrl.searchParams.get("search") || "";
  const category = request.nextUrl.searchParams.get("category") || "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 20);
  const limit = Number.isInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 20;
  const offset = decodeCursor(request.nextUrl.searchParams.get("cursor"));
  if (offset === null) {
    return NextResponse.json({ error: { code: "invalid_cursor", message: "The pagination cursor is invalid.", requestId: auth.context.requestId } }, { status: 400, headers });
  }

  try {
    const logos = searchLogos(await getLogoCatalog(), query, category);
    const page = logos.slice(offset, offset + limit);
    const nextOffset = offset + page.length;
    const nextCursor = nextOffset < logos.length ? encodeCursor(nextOffset) : null;
    const origin = request.nextUrl.origin;
    const nextUrl = nextCursor
      ? `${origin}/api/v1/brands?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&limit=${limit}&cursor=${encodeURIComponent(nextCursor)}`
      : null;

    return NextResponse.json({
      data: page.map((logo) => serializeLogo(logo, origin)),
      meta: { total: logos.length, count: page.length, limit, nextCursor, requestId: auth.context.requestId },
      links: { self: request.nextUrl.toString(), next: nextUrl },
    }, { headers });
  } catch {
    return finalizeApiResponse(NextResponse.json({ error: { code: "catalog_unavailable", message: "The logo catalog is temporarily unavailable.", requestId: auth.context.requestId } }, { status: 503, headers }), auth.context);
  }
}
