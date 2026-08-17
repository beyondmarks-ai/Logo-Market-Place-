import { NextRequest, NextResponse } from "next/server";
import { getTableClient, storageStatus } from "./table-storage";
import { sha256 } from "./security";
const TABLE = process.env.AZURE_AUTH_TOKENS_TABLE || "LogoAuthTokens";
export async function authRateLimit(request: NextRequest, action: string, limit: number, windowMinutes = 15) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const partitionKey = `rate_${action}`; const rowKey = sha256(forwarded); const client = getTableClient(TABLE); const windowMs = windowMinutes * 60_000;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let entity = null;
    try { entity = await client.getEntity<{ count: number; windowStart: string }>(partitionKey, rowKey); } catch (error) { if (storageStatus(error) !== 404) throw error; }
    const expired = !entity || Date.parse(entity.windowStart) + windowMs <= Date.now();
    if (expired) {
      try { if (entity) await client.updateEntity({ partitionKey, rowKey, count: 1, windowStart: new Date().toISOString() }, "Replace", { etag: entity.etag }); else await client.createEntity({ partitionKey, rowKey, count: 1, windowStart: new Date().toISOString() }); return null; }
      catch (error) { if ([409, 412].includes(storageStatus(error))) continue; throw error; }
    }
    if (Number(entity!.count) >= limit) return NextResponse.json({ error: { code: "too_many_requests", message: "Too many attempts. Please try again later." } }, { status: 429, headers: { "Retry-After": String(windowMinutes * 60) } });
    try { await client.updateEntity({ partitionKey, rowKey, count: Number(entity!.count) + 1 }, "Merge", { etag: entity!.etag }); return null; } catch (error) { if (storageStatus(error) === 412) continue; throw error; }
  }
  return NextResponse.json({ error: { code: "too_many_requests", message: "Please try again shortly." } }, { status: 429 });
}
