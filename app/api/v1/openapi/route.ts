import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL || request.nextUrl.origin;
  const document = {
    openapi: "3.1.0",
    info: {
      title: "Logo Market Place API",
      version: "1.0.0",
      description: "Search professional brand assets and download original or customized SVG variants.",
      contact: { name: "Beyond Marks AI", url: "https://github.com/beyondmarks-ai/Logo-Market-Place-" },
    },
    servers: [{ url: serverUrl }],
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/v1/health": {
        get: { summary: "Check service health", security: [], responses: { "200": { description: "Service is available" } } },
      },
      "/api/v1/brands": {
        get: {
          summary: "Search brands",
          parameters: [
            { name: "query", in: "query", schema: { type: "string" }, description: "Brand, alias, or keyword" },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
            { name: "cursor", in: "query", schema: { type: "string" }, description: "Opaque cursor returned by the previous page" },
          ],
          responses: { "200": { description: "Paginated brand results" }, "401": { $ref: "#/components/responses/Unauthorized" }, "402": { description: "Credit balance exhausted" }, "429": { $ref: "#/components/responses/RateLimited" } },
        },
      },
      "/api/v1/brands/{slug}": {
        get: {
          summary: "Get one brand",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Brand metadata and available variants" }, "404": { description: "Brand not found" } },
        },
      },
      "/api/v1/brands/{slug}/download": {
        get: {
          summary: "Download an SVG",
          description: "Use color or gradient parameters only with a mono variant.",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
            { name: "variant", in: "query", schema: { type: "string", default: "default" } },
            { name: "color", in: "query", schema: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" } },
            { name: "gradientStart", in: "query", schema: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" } },
            { name: "gradientEnd", in: "query", schema: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" } },
          ],
          responses: { "200": { description: "SVG file", content: { "image/svg+xml": {} } }, "400": { description: "Invalid customization" }, "404": { description: "Brand or variant not found" } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "lmp_live_...", description: "Pass your API key as a Bearer token. Keep it on the server." },
      },
      responses: {
        Unauthorized: { description: "Missing, invalid, expired, or revoked API key" },
        RateLimited: { description: "Per-minute request rate exceeded" },
      },
    },
  };

  return NextResponse.json(document, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" },
  });
}
