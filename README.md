# Logo Market Place

A production-ready Next.js marketplace and prepaid API for searching, previewing, customizing, and downloading SVG brand assets.

## Product

- Professional cream, red, and black marketplace UI
- Searchable logo grid with SVG previews and mono color/gradient customization
- Email/password accounts with mandatory email verification and password reset
- Five lifetime welcome credits after verification
- Up to three named, independently revocable API keys per account
- One credit per valid-key API request, with atomic balances and an append-only ledger
- Razorpay prepaid packs: ₹99/100, ₹399/500, and ₹999/2,000
- Customer dashboard plus a role-protected admin operations console
- Azure Table Storage, Communication Email, Key Vault, managed identity, and Container Apps

## Local development

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. In local development, verification/reset endpoints return a development preview link when Azure email is not configured.

## Validation

```powershell
npm run typecheck
npm run build
npm audit
```

## API

Create an account, verify the email, and create a key from `/dashboard`. The full key is shown once.

```powershell
curl.exe "http://localhost:3000/api/v1/brands?query=microsoft&limit=5" -H "Authorization: Bearer lmp_live_YOUR_KEY"
```

Protected endpoints:

- `GET /api/v1/brands`
- `GET /api/v1/brands/{slug}`
- `GET /api/v1/brands/{slug}/download`

Every valid-key protected request costs one credit, including client-error responses. Invalid keys, empty-balance responses, rate limits, and server errors do not consume a credit. Server failures are refunded automatically. Responses include `X-Credits-Remaining`.

## Accounts and billing

Account endpoints live under `/api/account`. Payment endpoints live under `/api/billing`. Razorpay order amounts are selected server-side, browser and webhook verification are signature-checked, and credit grants are idempotent.

Set `BILLING_ENABLED=true` only after adding Razorpay test key ID, key secret, and webhook secret to the deployment secret store. Configure the Razorpay webhook URL as:

```
https://YOUR_HOST/api/billing/webhook
```

Subscribe to `payment.captured`. Prices are final/inclusive, credits never expire, and unused-credit refunds are reviewed manually.

## Azure data

- `LogoAccounts`: email indexes and Argon2id account records
- `LogoSessions`: hashed session tokens
- `LogoAuthTokens`: hashed verification/reset tokens and auth throttles
- `LogoCredits`: atomic balance, FIFO lots, idempotency markers, and ledger entries
- `LogoBilling`: Razorpay order metadata
- `LogoApiKeys`: SHA-256 key hashes and user ownership metadata
- `LogoApiUsage`: per-minute rate-limit counters

Secrets are held in Azure Key Vault and read by the Container App user-assigned managed identity. No plaintext password, session token, verification token, reset token, or API key is stored.

## Administration

The verified account matching `ADMIN_EMAILS` receives the admin role. The initial production admin is `contact@beyondmarks.ai`. Admin routes enforce the role server-side and support account review, suspension/key revocation, ledger inspection, and manual credit additions.

## Deployment

Pushes to `main` run CI and publish `ghcr.io/beyondmarks-ai/logo-market-place-api:latest`. Update the Azure Container App to the new digest after the publish workflow succeeds.
