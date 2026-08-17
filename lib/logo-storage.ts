import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME || "logomarketplace617db5";
const containerName = process.env.AZURE_LOGOS_CONTAINER || "logos";
const service = new BlobServiceClient(`https://${account}.blob.core.windows.net`, new DefaultAzureCredential());
const container = service.getContainerClient(containerName);

export async function readLogoBlob(path: string) {
  try {
    const client = container.getBlockBlobClient(path);
    const buffer = await client.downloadToBuffer();
    return { buffer, contentType: (await client.getProperties()).contentType || "application/octet-stream" };
  } catch (error) {
    const status = typeof error === "object" && error !== null && "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : 0;
    if (status === 404) return null;
    throw error;
  }
}
