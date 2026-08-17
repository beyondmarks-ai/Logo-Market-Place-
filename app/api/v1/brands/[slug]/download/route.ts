import { NextRequest, NextResponse } from "next/server";
import { apiHeaders, apiOptions, authorizeApiRequest, finalizeApiResponse } from "../../../../../../lib/api-auth";
import { fetchLogoAsset, findLogo, getLogoCatalog, logoVariantPath } from "../../../../../../lib/logo-service";
import { customizeSvg, isHexColor, type SvgColorOptions } from "../../../../../../lib/svg-customize";

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
  const variant = (request.nextUrl.searchParams.get("variant") || "default").toLowerCase();

  try {
    const logo = findLogo(await getLogoCatalog(), slug);
    if (!logo) {
      return NextResponse.json({ error: { code: "brand_not_found", message: `No brand was found for slug "${slug}".`, requestId: auth.context.requestId } }, { status: 404, headers });
    }
    const path = logoVariantPath(logo, variant);
    if (!path) {
      return NextResponse.json({ error: { code: "variant_not_found", message: `Variant "${variant}" is unavailable for this brand.`, availableVariants: Object.keys(logo.variants), requestId: auth.context.requestId } }, { status: 404, headers });
    }

    const color = request.nextUrl.searchParams.get("color");
    const gradientStart = request.nextUrl.searchParams.get("gradientStart");
    const gradientEnd = request.nextUrl.searchParams.get("gradientEnd");
    let colorOptions: SvgColorOptions = { mode: "original" };
    if (color) {
      if (variant !== "mono" || !isHexColor(color)) {
        return NextResponse.json({ error: { code: "invalid_color", message: "The color option requires the mono variant and a six-digit hex value such as #B70C1B.", requestId: auth.context.requestId } }, { status: 400, headers });
      }
      colorOptions = { mode: "solid", color };
    } else if (gradientStart || gradientEnd) {
      if (variant !== "mono" || !gradientStart || !gradientEnd || !isHexColor(gradientStart) || !isHexColor(gradientEnd)) {
        return NextResponse.json({ error: { code: "invalid_gradient", message: "Gradient customization requires the mono variant and valid gradientStart and gradientEnd hex values.", requestId: auth.context.requestId } }, { status: 400, headers });
      }
      colorOptions = { mode: "gradient", start: gradientStart, end: gradientEnd };
    }

    const asset = await fetchLogoAsset(path);
    if (!asset) {
      return finalizeApiResponse(NextResponse.json({ error: { code: "asset_unavailable", message: "The requested SVG is temporarily unavailable.", requestId: auth.context.requestId } }, { status: 503, headers }), auth.context);
    }
    const suffix = colorOptions.mode === "original" ? variant : colorOptions.mode;
    const fileName = `${logo.slug}-${suffix}.svg`;
    const responseHeaders = {
      ...headers,
      "Cache-Control": "private, no-store",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "X-Content-Type-Options": "nosniff",
    };

    if (colorOptions.mode === "original") return new NextResponse(asset.body, { headers: responseHeaders });
    const customized = customizeSvg(await asset.text(), colorOptions);
    return new NextResponse(customized, { headers: responseHeaders });
  } catch {
    return finalizeApiResponse(NextResponse.json({ error: { code: "download_unavailable", message: "The logo download is temporarily unavailable.", requestId: auth.context.requestId } }, { status: 503, headers }), auth.context);
  }
}
