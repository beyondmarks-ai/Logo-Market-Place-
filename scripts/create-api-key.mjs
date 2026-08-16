import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DefaultAzureCredential } from "@azure/identity";
import { TableClient } from "@azure/data-tables";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const label = argument("label", "Initial developer key");
const plan = argument("plan", "starter");
const mode = argument("mode", "live");
const perMinute = Number(argument("per-minute", "60"));
const monthlyLimit = Number(argument("monthly", "10000"));
if (!label || !["live", "test"].includes(mode) || !Number.isInteger(perMinute) || perMinute < 1 || !Number.isInteger(monthlyLimit) || monthlyLimit < 1) {
  throw new Error("Usage: npm run api-key:create -- --label <name> [--mode live|test] [--plan starter] [--per-minute 60] [--monthly 10000]");
}

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "logomarketplace617db5";
const endpoint = process.env.AZURE_TABLE_ENDPOINT || `https://${accountName}.table.core.windows.net`;
const tableName = process.env.AZURE_API_KEYS_TABLE || "LogoApiKeys";
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const client = connectionString
  ? TableClient.fromConnectionString(connectionString, tableName)
  : new TableClient(endpoint, tableName, new DefaultAzureCredential());

try {
  await client.createTable();
} catch (error) {
  if (Number(error?.statusCode) !== 409) throw error;
}
const apiKey = `lmp_${mode}_${randomBytes(32).toString("base64url")}`;
const hash = createHash("sha256").update(apiKey).digest("hex");
const keyId = randomUUID();
await client.createEntity({
  partitionKey: "key",
  rowKey: hash,
  keyId,
  label,
  plan,
  status: "active",
  perMinute,
  monthlyLimit,
  createdAt: new Date().toISOString(),
});

console.log(JSON.stringify({ keyId, label, plan, perMinute, monthlyLimit, apiKey, warning: "Copy this key now. It is stored only as a SHA-256 hash and cannot be recovered." }, null, 2));
