import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { debitCredit, refundCredit } from "./credits";
import { getTableClient, storageStatus } from "./table-storage";

const KEYS_TABLE = process.env.AZURE_API_KEYS_TABLE || "LogoApiKeys";
const USAGE_TABLE = process.env.AZURE_API_USAGE_TABLE || "LogoApiUsage";
type ApiKeyProperties = { keyId: string; userId?: string; label: string; plan: string; status: string; perMinute: number; createdAt: string; expiresAt?: string };
type UsageProperties = { count: number; period: string; expiresAt: string };
export type ApiAuthContext = { requestId: string; chargeReference: string; keyId: string; userId: string; label: string; plan: string; minuteLimit: number; minuteRemaining: number; minuteReset: number; creditsRemaining: number };
type AuthResult = { ok: true; context: ApiAuthContext } | { ok: false; response: NextResponse };
const keyCache = new Map<string, { entity: ApiKeyProperties; expires: number }>();

function apiError(status: number, code: string, message: string, requestId: string, extraHeaders?: HeadersInit) {
  return NextResponse.json({ error: { code, message, requestId } }, { status, headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", "X-Request-Id": requestId, ...extraHeaders } });
}
async function getApiKey(hash: string) {
  const cached = keyCache.get(hash);
  if (cached && cached.expires > Date.now()) return cached.entity;
  try {
    const entity = await getTableClient(KEYS_TABLE).getEntity<ApiKeyProperties>("key", hash);
    const key = entity as unknown as ApiKeyProperties;
    keyCache.set(hash, { entity: key, expires: Date.now() + 30_000 });
    return key;
  } catch (error) { if (storageStatus(error) === 404) return null; throw error; }
}
async function incrementMinute(hash: string, period: string, limit: number, expiresAt: string) {
  const client = getTableClient(USAGE_TABLE);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let entity = null;
    try { entity = await client.getEntity<UsageProperties>(hash, "minute"); } catch (error) { if (storageStatus(error) !== 404) throw error; }
    if (!entity) {
      try { await client.createEntity({ partitionKey: hash, rowKey: "minute", count: 1, period, expiresAt }); return { allowed: true, count: 1 }; }
      catch (error) { if (storageStatus(error) === 409) continue; throw error; }
    }
    if (entity.period !== period) {
      try { await client.updateEntity({ partitionKey: hash, rowKey: "minute", count: 1, period, expiresAt }, "Merge", { etag: entity.etag }); return { allowed: true, count: 1 }; }
      catch (error) { if (storageStatus(error) === 412) continue; throw error; }
    }
    const count = Number(entity.count || 0);
    if (count >= limit) return { allowed: false, count };
    try { await client.updateEntity({ partitionKey: hash, rowKey: "minute", count: count + 1 }, "Merge", { etag: entity.etag }); return { allowed: true, count: count + 1 }; }
    catch (error) { if (storageStatus(error) === 412) continue; throw error; }
  }
  throw new Error("Unable to update rate limit.");
}
export async function authorizeApiRequest(request: NextRequest): Promise<AuthResult> {
  const supplied = request.headers.get("x-request-id") || "";
  const requestId = /^[A-Za-z0-9._-]{1,100}$/.test(supplied) ? supplied : randomUUID();
  const match = (request.headers.get("authorization") || "").match(/^Bearer\s+(lmp_(?:live|test)_[A-Za-z0-9_-]{20,})$/i);
  if (!match) return { ok: false, response: apiError(401, "invalid_api_key", "Provide a valid API key using Authorization: Bearer <key>.", requestId, { "WWW-Authenticate": 'Bearer realm="Logo Market Place API"' }) };
  const keyHash = createHash("sha256").update(match[1]).digest("hex");
  try {
    const key = await getApiKey(keyHash);
    const expired = key?.expiresAt && Date.parse(key.expiresAt) <= Date.now();
    if (!key || key.status !== "active" || expired || !key.userId) return { ok: false, response: apiError(401, "invalid_api_key", "The API key is invalid, expired, revoked, or legacy.", requestId) };
    const now = new Date();
    const period = now.toISOString().slice(0, 16).replace(/[-T:]/g, "");
    const limit = Math.max(1, Number(key.perMinute || 60));
    const reset = Math.floor(now.getTime() / 60_000) * 60 + 60;
    const minute = await incrementMinute(keyHash, period, limit, new Date((reset + 3600) * 1000).toISOString());
    if (!minute.allowed) return { ok: false, response: apiError(429, "rate_limit_exceeded", "The per-minute request limit has been reached.", requestId, { "Retry-After": String(Math.max(1, reset - Math.floor(Date.now() / 1000))), "RateLimit-Limit": String(limit), "RateLimit-Remaining": "0", "RateLimit-Reset": String(reset) }) };
    const charge = await debitCredit(key.userId, requestId, `${request.method} ${request.nextUrl.pathname}`);
    if (!charge) return { ok: false, response: apiError(402, "insufficient_credits", "Your credit balance is empty. Purchase a prepaid pack to continue.", requestId, { "X-Credits-Remaining": "0", Link: `<${request.nextUrl.origin}/pricing>; rel="payment"` }) };
    void getTableClient(KEYS_TABLE).updateEntity({ partitionKey: "key", rowKey: keyHash, lastUsedAt: now.toISOString() }, "Merge").catch(() => undefined);
    return { ok: true, context: { requestId, chargeReference: requestId, keyId: key.keyId, userId: key.userId, label: key.label, plan: key.plan, minuteLimit: limit, minuteRemaining: Math.max(0, limit - minute.count), minuteReset: reset, creditsRemaining: charge.balance } };
  } catch { return { ok: false, response: apiError(503, "authentication_unavailable", "API authentication is temporarily unavailable.", requestId) }; }
}
export function apiHeaders(context: ApiAuthContext) {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Request-Id, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-Credits-Remaining", "Cache-Control": "private, no-store", "X-Request-Id": context.requestId, "RateLimit-Limit": String(context.minuteLimit), "RateLimit-Remaining": String(context.minuteRemaining), "RateLimit-Reset": String(context.minuteReset), "X-Credits-Remaining": String(context.creditsRemaining) };
}
export async function finalizeApiResponse(response: NextResponse, context: ApiAuthContext) {
  if (response.status >= 500) {
    const balance = await refundCredit(context.userId, context.chargeReference).catch(() => context.creditsRemaining);
    response.headers.set("X-Credits-Remaining", String(balance));
  }
  return response;
}
export function apiOptions() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Request-Id", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400" } });
}
