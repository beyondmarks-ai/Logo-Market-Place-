import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const emailKey = (email: string) => sha256(normalizeEmail(email));

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validPassword(value: string) {
  return value.length >= 12 && value.length <= 128;
}
