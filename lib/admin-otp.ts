import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { getAdminSessionSigningSecret, getOtpSigningSecret } from "./keyless-config";

type OtpEntry = {
  digest: string;
  expiresAt: number;
  attempts: number;
};

const globalOtpStore = globalThis as typeof globalThis & {
  adminOtpStore?: Map<string, OtpEntry>;
  adminOtpCooldown?: Map<string, number>;
};

const otpStore = globalOtpStore.adminOtpStore ??= new Map<string, OtpEntry>();
const cooldownStore = globalOtpStore.adminOtpCooldown ??= new Map<string, number>();
const digest = async (requestId: string, code: string) => {
  const otpSecret = await getOtpSigningSecret();
  return createHash("sha256").update(`${requestId}:${code}:${otpSecret}`).digest("hex");
};

export function getAdminSessionSecret() {
  return getAdminSessionSigningSecret();
}

export async function createOtp(identity: string) {
  const now = Date.now();
  const lastSent = cooldownStore.get(identity) ?? 0;
  if (now - lastSent < 30_000) throw new Error("Please wait 30 seconds before requesting another code.");

  const requestId = randomBytes(24).toString("hex");
  const code = randomInt(100000, 1000000).toString();
  otpStore.set(requestId, { digest: await digest(requestId, code), expiresAt: now + 5 * 60_000, attempts: 0 });
  cooldownStore.set(identity, now);
  return { requestId, code };
}

export function discardOtp(requestId: string) {
  otpStore.delete(requestId);
}

export async function verifyOtp(requestId: string, code: string) {
  const entry = otpStore.get(requestId);
  if (!entry || entry.expiresAt < Date.now() || entry.attempts >= 5) {
    otpStore.delete(requestId);
    return false;
  }
  entry.attempts += 1;
  const supplied = Buffer.from(await digest(requestId, code));
  const expected = Buffer.from(entry.digest);
  const valid = supplied.length === expected.length && timingSafeEqual(supplied, expected);
  if (valid) otpStore.delete(requestId);
  return valid;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export function maskPhone(phone: string) {
  return `${phone.slice(0, Math.max(2, phone.length - 4)).replace(/\d/g, "•")}${phone.slice(-4)}`;
}
