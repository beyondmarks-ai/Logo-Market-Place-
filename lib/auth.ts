import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getTableClient, storageStatus } from "./table-storage";
import { emailKey, normalizeEmail, randomToken, sha256, validPassword } from "./security";

const ACCOUNTS = process.env.AZURE_ACCOUNTS_TABLE || "LogoAccounts";
const SESSIONS = process.env.AZURE_SESSIONS_TABLE || "LogoSessions";
const TOKENS = process.env.AZURE_AUTH_TOKENS_TABLE || "LogoAuthTokens";
export const SESSION_COOKIE = "lmp_session";
const SESSION_DAYS = 7;

export type Account = {
  userId: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  status: "pending" | "active" | "suspended";
  createdAt: string;
  verifiedAt?: string;
};

export type PublicAccount = Omit<Account, "passwordHash">;

function publicAccount(account: Account): PublicAccount {
  const { passwordHash: _passwordHash, ...safe } = account;
  return safe;
}

export async function createAccount(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new AuthError("invalid_email", "Enter a valid email address.", 400);
  if (!validPassword(password)) throw new AuthError("invalid_password", "Password must be 12 to 128 characters.", 400);
  const userId = randomUUID();
  const createdAt = new Date().toISOString();
  const accounts = getTableClient(ACCOUNTS);
  try {
    await accounts.createEntity({ partitionKey: "email", rowKey: emailKey(email), userId, email, createdAt });
  } catch (error) {
    if (storageStatus(error) === 409) throw new AuthError("account_exists", "An account already exists for this email.", 409);
    throw error;
  }
  const admins = (process.env.ADMIN_EMAILS || "contact@beyondmarks.ai").split(",").map(normalizeEmail);
  try {
    const account: Account = {
      userId, email, passwordHash: await hash(password), role: admins.includes(email) ? "admin" : "user",
      status: "pending", createdAt,
    };
    await accounts.createEntity({ partitionKey: "user", rowKey: userId, ...account });
    return publicAccount(account);
  } catch (error) {
    await accounts.deleteEntity("email", emailKey(email)).catch(() => undefined);
    throw error;
  }
}

export async function getAccountById(userId: string): Promise<Account | null> {
  try {
    const entity = await getTableClient(ACCOUNTS).getEntity<Account>("user", userId);
    return entity as unknown as Account;
  } catch (error) {
    if (storageStatus(error) === 404) return null;
    throw error;
  }
}

export async function getAccountByEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);
  try {
    const index = await getTableClient(ACCOUNTS).getEntity<{ userId: string }>("email", emailKey(email));
    return getAccountById(index.userId);
  } catch (error) {
    if (storageStatus(error) === 404) return null;
    throw error;
  }
}

export async function authenticate(email: string, password: string) {
  const account = await getAccountByEmail(email);
  if (!account || !(await verify(account.passwordHash, password))) return null;
  return account;
}

export async function issueAuthToken(userId: string, purpose: "verify" | "reset") {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + (purpose === "verify" ? 24 * 60 * 60_000 : 30 * 60_000)).toISOString();
  await getTableClient(TOKENS).createEntity({
    partitionKey: purpose, rowKey: sha256(token), userId, purpose, expiresAt, createdAt: new Date().toISOString(), status: "active",
  });
  return { token, expiresAt };
}

export async function consumeAuthToken(token: string, purpose: "verify" | "reset") {
  const client = getTableClient(TOKENS);
  try {
    const entity = await client.getEntity<{ userId: string; expiresAt: string; status: string }>(purpose, sha256(token));
    if (entity.status !== "active" || Date.parse(entity.expiresAt) <= Date.now()) return null;
    await client.updateEntity({ partitionKey: purpose, rowKey: sha256(token), status: "used", usedAt: new Date().toISOString() }, "Merge", { etag: entity.etag });
    return entity.userId;
  } catch (error) {
    if ([404, 412].includes(storageStatus(error))) return null;
    throw error;
  }
}

export async function verifyAccount(userId: string) {
  const client = getTableClient(ACCOUNTS);
  const account = await getAccountById(userId);
  if (!account) return null;
  if (!account.verifiedAt) {
    account.verifiedAt = new Date().toISOString();
    account.status = "active";
    await client.updateEntity({ partitionKey: "user", rowKey: userId, verifiedAt: account.verifiedAt, status: "active" }, "Merge");
  }
  return publicAccount(account);
}

export async function setPassword(userId: string, password: string) {
  if (!validPassword(password)) throw new AuthError("invalid_password", "Password must be 12 to 128 characters.", 400);
  await getTableClient(ACCOUNTS).updateEntity({ partitionKey: "user", rowKey: userId, passwordHash: await hash(password), passwordChangedAt: new Date().toISOString() }, "Merge");
  await revokeAllSessions(userId);
}

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await getTableClient(SESSIONS).createEntity({ partitionKey: "session", rowKey: sha256(token), userId, expiresAt, createdAt: new Date().toISOString() });
  return { token, expiresAt };
}

export async function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
}

export async function currentAccount(request?: NextRequest) {
  const token = request?.cookies.get(SESSION_COOKIE)?.value || (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await getTableClient(SESSIONS).getEntity<{ userId: string; expiresAt: string }>("session", sha256(token));
    if (Date.parse(session.expiresAt) <= Date.now()) return null;
    const account = await getAccountById(session.userId);
    return account?.status === "active" ? publicAccount(account) : null;
  } catch (error) {
    if (storageStatus(error) === 404) return null;
    throw error;
  }
}

export async function deleteSession(token: string | undefined) {
  if (token) await getTableClient(SESSIONS).deleteEntity("session", sha256(token)).catch(() => undefined);
}

async function revokeAllSessions(userId: string) {
  const client = getTableClient(SESSIONS);
  const entities = client.listEntities<{ userId: string }>({ queryOptions: { filter: `PartitionKey eq 'session' and userId eq '${userId}'` } });
  for await (const entity of entities) if (entity.partitionKey && entity.rowKey) await client.deleteEntity(entity.partitionKey, entity.rowKey).catch(() => undefined);
}

export class AuthError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export function accountError(error: unknown) {
  const known = error instanceof AuthError ? error : new AuthError("service_unavailable", "The account service is temporarily unavailable.", 503);
  return NextResponse.json({ error: { code: known.code, message: known.message } }, { status: known.status, headers: { "Cache-Control": "no-store" } });
}

export function requireAccount(account: PublicAccount | null) {
  return account ? null : NextResponse.json({ error: { code: "authentication_required", message: "Sign in to continue." } }, { status: 401 });
}
