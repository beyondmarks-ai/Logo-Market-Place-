import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const keylessState = globalThis as typeof globalThis & {
  academySecretCache?: Map<string, Promise<string>>;
  academySecretClient?: SecretClient;
};

const secretCache = keylessState.academySecretCache ??= new Map<string, Promise<string>>();

function getSecretClient() {
  if (keylessState.academySecretClient) return keylessState.academySecretClient;
  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
  if (!vaultUrl) throw new Error("AZURE_KEY_VAULT_URL is required for keyless configuration.");
  keylessState.academySecretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());
  return keylessState.academySecretClient;
}

export function getKeyVaultSecret(name: string) {
  const cached = secretCache.get(name);
  if (cached) return cached;

  const pending = getSecretClient().getSecret(name).then((secret) => {
    if (!secret.value) throw new Error(`Azure Key Vault secret ${name} has no value.`);
    return secret.value;
  }).catch((error) => {
    secretCache.delete(name);
    throw error;
  });

  secretCache.set(name, pending);
  return pending;
}

export const getAdminPassword = () => getKeyVaultSecret("admin-password");
export const getOtpSigningSecret = () => getKeyVaultSecret("otp-signing-secret");
export const getAdminSessionSigningSecret = () => getKeyVaultSecret("admin-session-secret");
