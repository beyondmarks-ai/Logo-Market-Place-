import { createHmac, randomUUID } from "node:crypto";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { getTableClient, storageStatus } from "./table-storage";
import { grantCredits } from "./credits";
import { safeEqual } from "./security";

const BILLING = process.env.AZURE_BILLING_TABLE || "LogoBilling";
const KEY_VAULT_URL = process.env.AZURE_KEY_VAULT_URL || "https://lmp-kv-617db5.vault.azure.net";
export const CREDIT_PACKS = {
  starter_100: { name: "Starter", credits: 100, amount: 9900 },
  builder_500: { name: "Builder", credits: 500, amount: 39900 },
  scale_2000: { name: "Scale", credits: 2000, amount: 99900 },
} as const;
export type PackId = keyof typeof CREDIT_PACKS;
type RazorpaySecrets = { keyId: string; keySecret: string; webhookSecret: string };

let secretPromise: Promise<RazorpaySecrets> | null = null;
export async function getRazorpaySecrets() {
  const configured = {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  };
  if (configured.keyId && configured.keySecret && configured.webhookSecret) return configured;
  if (!secretPromise) {
    secretPromise = (async () => {
      const client = new SecretClient(KEY_VAULT_URL, new DefaultAzureCredential());
      const [keyId, keySecret, webhookSecret] = await Promise.all([
        client.getSecret("razorpay-key-id"),
        client.getSecret("razorpay-key-secret"),
        client.getSecret("razorpay-webhook-secret"),
      ]);
      if (!keyId.value || !keySecret.value || !webhookSecret.value) throw new Error("billing_unavailable");
      return { keyId: keyId.value, keySecret: keySecret.value, webhookSecret: webhookSecret.value };
    })().catch((error) => { secretPromise = null; throw error; });
  }
  return secretPromise;
}

export async function billingConfigured() {
  if (process.env.BILLING_ENABLED === "false") return false;
  try { await getRazorpaySecrets(); return true; } catch { return false; }
}

export async function createBillingOrder(userId: string, email: string, packId: PackId) {
  const pack = CREDIT_PACKS[packId];
  if (!pack) throw new Error("invalid_pack");
  if (process.env.BILLING_ENABLED === "false") throw new Error("billing_unavailable");
  const { keyId, keySecret } = await getRazorpaySecrets();
  const receipt = `lmp_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: pack.amount, currency: "INR", receipt, notes: { userId, packId, email } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("order_failed");
  const order = await response.json() as { id: string; amount: number; currency: string };
  await getTableClient(BILLING).createEntity({ partitionKey: "order", rowKey: order.id, userId, email, packId, credits: pack.credits, amount: pack.amount, currency: "INR", status: "created", receipt, createdAt: new Date().toISOString() });
  return { orderId: order.id, amount: pack.amount, currency: "INR", keyId, pack: { id: packId, ...pack } };
}

export async function verifyAndGrantOrder(orderId: string, paymentId: string, signature: string, expectedUserId?: string) {
  const { keyId, keySecret } = await getRazorpaySecrets();
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  if (!safeEqual(expected, signature)) throw new Error("invalid_signature");
  let order;
  try { order = await getTableClient(BILLING).getEntity<{ userId: string; packId: PackId; credits: number; amount: number; status: string }>("order", orderId); }
  catch (error) { if (storageStatus(error) === 404) throw new Error("order_not_found"); throw error; }
  if (expectedUserId && order.userId !== expectedUserId) throw new Error("order_not_found");
  const pack = CREDIT_PACKS[order.packId];
  if (!pack || Number(order.credits) !== pack.credits || Number(order.amount) !== pack.amount) throw new Error("order_mismatch");
  const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` }, cache: "no-store",
  });
  if (!paymentResponse.ok) throw new Error("payment_lookup_failed");
  const payment = await paymentResponse.json() as { status: string; order_id: string; amount: number; currency: string };
  if (payment.status !== "captured" || payment.order_id !== orderId || Number(payment.amount) !== pack.amount || payment.currency !== "INR") throw new Error("payment_not_captured");
  const result = await grantCredits(order.userId, pack.credits, "razorpay", `razorpay_${paymentId}`, `${pack.name} credit pack`);
  await getTableClient(BILLING).updateEntity({ partitionKey: "order", rowKey: orderId, status: "paid", paymentId, paidAt: new Date().toISOString() }, "Merge");
  return { ...result, credits: pack.credits };
}

export async function verifyWebhook(body: string, signature: string) {
  try {
    const { webhookSecret } = await getRazorpaySecrets();
    return safeEqual(createHmac("sha256", webhookSecret).update(body).digest("hex"), signature);
  } catch { return false; }
}

export async function signPaymentReference(orderId: string, paymentId: string) {
  const { keySecret } = await getRazorpaySecrets();
  return createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
}
