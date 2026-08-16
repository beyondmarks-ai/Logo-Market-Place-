import { createHash, randomUUID } from "node:crypto";
import { DefaultAzureCredential } from "@azure/identity";
import { TableClient, type TableEntityResult } from "@azure/data-tables";
import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "logomarketplace617db5";
const TABLE_ENDPOINT = process.env.AZURE_TABLE_ENDPOINT || `https://${ACCOUNT_NAME}.table.core.windows.net`;
const KEYS_TABLE = process.env.AZURE_API_KEYS_TABLE || "LogoApiKeys";
const USAGE_TABLE = process.env.AZURE_API_USAGE_TABLE || "LogoApiUsage";

type ApiKeyProperties = {
  keyId: string;
  label: string;
  plan: string;
  status: string;
  perMinute: number;
  monthlyLimit: number;
  createdAt: string;
  expiresAt?: string;
};

type UsageProperties = {
  count: number;
  period: string;
  expiresAt: string;
};

export type ApiAuthContext = {
  requestId: string;
  keyId: string;
  label: string;
  plan: string;
  minuteLimit: number;
  minuteRemaining: number;
  minuteReset: number;
  monthlyLimit: number;
  monthlyRemaining: number;
};

type AuthResult =
  | { ok: true; context: ApiAuthContext }
  | { ok: false; response: NextResponse };

const credential = new DefaultAzureCredential();
const keyCache = new Map<string, { entity: TableEntityResult<ApiKeyProperties>; expires: number }>();

function tableClient(tableName: string) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  return connectionString
    ? TableClient.fromConnectionString(connectionString, tableName)
    : new TableClient(TABLE_ENDPOINT, tableName, credential);
}

function errorStatus(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number((error as { statusCode?: number }).statusCode)
    : 0;
}

function apiError(status: number, code: string, message: string, requestId: string, extraHeaders?: HeadersInit) {
  return NextResponse.json(
    { error: { code, message, requestId } },
    {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        ...extraHeaders,
      },
    },
  );
}

async function getApiKey(hash: string) {
  const cached = keyCache.get(hash);
  if (cached && cached.expires > Date.now()) return cached.entity;

  try {
    const entity = await tableClient(KEYS_TABLE).getEntity<ApiKeyProperties>("key", hash);
    keyCache.set(hash, { entity, expires: Date.now() + 60_000 });
    return entity;
  } catch (error) {
    if (errorStatus(error) === 404) return null;
    throw error;
  }
}

async function incrementCounter(partitionKey: string, rowKey: string, period: string, limit: number, expiresAt: string) {
  const client = tableClient(USAGE_TABLE);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let entity: TableEntityResult<UsageProperties> | null = null;
    try {
      entity = await client.getEntity<UsageProperties>(partitionKey, rowKey);
    } catch (error) {
      if (errorStatus(error) !== 404) throw error;
    }

    if (!entity) {
      try {
        await client.createEntity<UsageProperties>({ partitionKey, rowKey, count: 1, period, expiresAt });
        return { allowed: true, count: 1 };
      } catch (error) {
        if (errorStatus(error) === 409) continue;
        throw error;
      }
    }

    if (entity.period !== period) {
      try {
        await client.updateEntity<UsageProperties>({ partitionKey, rowKey, count: 1, period, expiresAt }, "Merge", { etag: entity.etag });
        return { allowed: true, count: 1 };
      } catch (error) {
        if (errorStatus(error) === 412) continue;
        throw error;
      }
    }

    const count = Number(entity.count || 0);
    if (count >= limit) return { allowed: false, count };
    try {
      await client.updateEntity<UsageProperties>({ partitionKey, rowKey, count: count + 1, period, expiresAt }, "Merge", { etag: entity.etag });
      return { allowed: true, count: count + 1 };
    } catch (error) {
      if (errorStatus(error) === 412) continue;
      throw error;
    }
  }
  throw new Error("Unable to update the API usage counter.");
}

export async function authorizeApiRequest(request: NextRequest): Promise<AuthResult> {
  const suppliedRequestId = request.headers.get("x-request-id") || "";
  const requestId = /^[A-Za-z0-9._-]{1,100}$/.test(suppliedRequestId) ? suppliedRequestId : randomUUID();
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(lmp_(?:live|test)_[A-Za-z0-9_-]{20,})$/i);
  if (!match) {
    return {
      ok: false,
      response: apiError(401, "invalid_api_key", "Provide a valid API key using Authorization: Bearer <key>.", requestId, {
        "WWW-Authenticate": 'Bearer realm="Logo Market Place API"',
      }),
    };
  }

  const hash = createHash("sha256").update(match[1]).digest("hex");
  try {
    const key = await getApiKey(hash);
    const expired = key?.expiresAt && Date.parse(key.expiresAt) <= Date.now();
    if (!key || key.status !== "active" || expired) {
      return { ok: false, response: apiError(401, "invalid_api_key", "The API key is invalid, expired, or revoked.", requestId) };
    }

    const now = new Date();
    const minutePeriod = now.toISOString().slice(0, 16).replace(/[-T:]/g, "");
    const monthPeriod = now.toISOString().slice(0, 7).replace("-", "");
    const minuteLimit = Math.max(1, Number(key.perMinute || 60));
    const monthlyLimit = Math.max(1, Number(key.monthlyLimit || 10_000));
    const minuteReset = Math.floor(now.getTime() / 60_000) * 60 + 60;
    const minuteExpiry = new Date((minuteReset + 3600) * 1000).toISOString();
    const monthExpiry = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1)).toISOString();

    const minute = await incrementCounter(hash, "minute", minutePeriod, minuteLimit, minuteExpiry);
    if (!minute.allowed) {
      return { ok: false, response: apiError(429, "rate_limit_exceeded", "The per-minute request limit has been reached.", requestId, {
        "Retry-After": String(Math.max(1, minuteReset - Math.floor(Date.now() / 1000))),
        "RateLimit-Limit": String(minuteLimit),
        "RateLimit-Remaining": "0",
        "RateLimit-Reset": String(minuteReset),
      }) };
    }

    const monthly = await incrementCounter(hash, "month", monthPeriod, monthlyLimit, monthExpiry);
    if (!monthly.allowed) {
      return { ok: false, response: apiError(429, "monthly_quota_exceeded", "The monthly request quota has been reached.", requestId) };
    }

    return {
      ok: true,
      context: {
        requestId,
        keyId: key.keyId,
        label: key.label,
        plan: key.plan,
        minuteLimit,
        minuteRemaining: Math.max(0, minuteLimit - minute.count),
        minuteReset,
        monthlyLimit,
        monthlyRemaining: Math.max(0, monthlyLimit - monthly.count),
      },
    };
  } catch {
    return { ok: false, response: apiError(503, "authentication_unavailable", "API authentication is temporarily unavailable.", requestId) };
  }
}

export function apiHeaders(context: ApiAuthContext) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Request-Id, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-Monthly-Limit, X-Monthly-Remaining",
    "Cache-Control": "private, no-store",
    "X-Request-Id": context.requestId,
    "RateLimit-Limit": String(context.minuteLimit),
    "RateLimit-Remaining": String(context.minuteRemaining),
    "RateLimit-Reset": String(context.minuteReset),
    "X-Monthly-Limit": String(context.monthlyLimit),
    "X-Monthly-Remaining": String(context.monthlyRemaining),
  };
}

export function apiOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Request-Id",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
