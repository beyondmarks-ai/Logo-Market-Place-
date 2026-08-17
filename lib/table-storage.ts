import { DefaultAzureCredential } from "@azure/identity";
import { TableClient } from "@azure/data-tables";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "logomarketplace617db5";
const endpoint = process.env.AZURE_TABLE_ENDPOINT || `https://${accountName}.table.core.windows.net`;
const credential = new DefaultAzureCredential();

export function getTableClient(name: string) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  return connectionString
    ? TableClient.fromConnectionString(connectionString, name)
    : new TableClient(endpoint, name, credential);
}

export function storageStatus(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number((error as { statusCode?: number }).statusCode)
    : 0;
}

export async function ensureTables(names: string[]) {
  await Promise.all(names.map((name) => getTableClient(name).createTable().catch((error) => {
    if (storageStatus(error) !== 409) throw error;
  })));
}
