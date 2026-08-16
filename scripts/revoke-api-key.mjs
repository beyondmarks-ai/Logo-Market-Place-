import { createHash } from "node:crypto";
import { DefaultAzureCredential } from "@azure/identity";
import { TableClient } from "@azure/data-tables";

const index = process.argv.indexOf("--key");
const apiKey = index >= 0 ? process.argv[index + 1] : "";
if (!/^lmp_(live|test)_[A-Za-z0-9_-]{20,}$/.test(apiKey)) throw new Error("Usage: npm run api-key:revoke -- --key <api-key>");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "logomarketplace617db5";
const endpoint = process.env.AZURE_TABLE_ENDPOINT || `https://${accountName}.table.core.windows.net`;
const tableName = process.env.AZURE_API_KEYS_TABLE || "LogoApiKeys";
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const client = connectionString
  ? TableClient.fromConnectionString(connectionString, tableName)
  : new TableClient(endpoint, tableName, new DefaultAzureCredential());
const hash = createHash("sha256").update(apiKey).digest("hex");
const entity = await client.getEntity("key", hash);
await client.updateEntity({ ...entity, status: "revoked", revokedAt: new Date().toISOString() }, "Merge", { etag: entity.etag });
console.log(JSON.stringify({ keyId: entity.keyId, status: "revoked" }, null, 2));
