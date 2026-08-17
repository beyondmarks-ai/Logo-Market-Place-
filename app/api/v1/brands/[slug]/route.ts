import { NextRequest, NextResponse } from "next/server";
import { apiHeaders, apiOptions, authorizeApiRequest, finalizeApiResponse } from "../../../../../lib/api-auth";
import { findLogo, getLogoCatalog } from "../../../../../lib/logo-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authorizeApiRequest(request);
  if (!auth.ok) return auth.response;
  const headers = apiHeaders(auth.context);
  const { slug } = await context.params;

  try {
    const logo = findLogo(await getLogoCatalog(), slug);
    if (!logo) {
      return NextResponse.json({ error: { code: "brand_not_found", message: `No brand was found for slug "${slug}".`, requestId: auth.context.requestId } }, { status: 404, headers });
    }
    const origin = request.nextUrl.origin;
    const variants = Object.keys(logo.variants);
    return NextResponse.json({
      data: {
        slug: logo.slug,
        name: logo.title,
        aliases: logo.aliases || [],
        categories: logo.categories || [],
        collection: logo.collection || null,
        variants,
        downloads: Object.fromEntries(variants.map((variant) => [variant, `${origin}/api/v1/brands/${encodeURIComponent(logo.slug)}/download?variant=${encodeURIComponent(variant)}`])),
      },
      meta: { requestId: auth.context.requestId },
    }, { headers });
  } catch {
    return finalizeApiResponse(NextResponse.json({ error: { code: "catalog_unavailable", message: "The logo catalog is temporarily unavailable.", requestId: auth.context.requestId } }, { status: 503, headers }), auth.context);
  }
}
