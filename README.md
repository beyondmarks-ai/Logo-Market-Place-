# Logo Market Place

A production-ready Next.js marketplace and developer API for searching, previewing, customizing, and downloading professional SVG logos.

## Features

- Searchable, filterable catalog with color, mono, light, dark, wordmark, brand, and cloud variants
- In-browser and API-driven solid-color or gradient customization for mono SVGs
- Versioned REST API with Bearer-key authentication
- SHA-256 API-key storage; plaintext keys are shown only when created
- Concurrency-safe per-minute and monthly quotas backed by Azure Table Storage
- Cursor pagination, stable JSON errors, request IDs, CORS, and rate-limit headers
- Azure Blob Storage primary assets with automatic jsDelivr fallback
- OpenAPI document at `/api/v1/openapi` and developer documentation at `/developers`
- GitHub Actions type checking and production builds

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- Azure CLI login or an Azure Storage connection string when managing API keys locally

The public storefront works without Azure credentials. Protected `/api/v1` routes require access to the configured Azure Tables.

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), or use another port with `npm run dev -- --port 3003`.

Copy `.env.example` to `.env.local` to override defaults. Never put credentials in a `NEXT_PUBLIC_` variable.

## API quickstart

```bash
curl "http://localhost:3000/api/v1/brands?query=microsoft&limit=10" \
  -H "Authorization: Bearer lmp_live_YOUR_API_KEY"
```

Core endpoints:

| Endpoint | Authentication | Purpose |
| --- | --- | --- |
| `GET /api/v1/health` | Public | Service health |
| `GET /api/v1/openapi` | Public | OpenAPI 3.1 contract |
| `GET /api/v1/brands` | Bearer key | Search and paginate brands |
| `GET /api/v1/brands/{slug}` | Bearer key | Read brand metadata and variants |
| `GET /api/v1/brands/{slug}/download` | Bearer key | Download or customize an SVG |

For mono customization, pass either `color=%23B70C1B` or both `gradientStart` and `gradientEnd` as URL-encoded six-digit hex colors.

## API keys

Create a key after the Azure tables and permissions are configured:

```bash
npm run api-key:create -- --label "Customer name" --plan starter --per-minute 60 --monthly 10000
```

The command prints the key once. Only its SHA-256 hash is stored in `LogoApiKeys`.

Revoke a key:

```bash
npm run api-key:revoke -- --key lmp_live_YOUR_API_KEY
```

Keep live keys in a secret manager. Do not embed them in browser JavaScript, mobile bundles, logs, or repositories.

## Azure architecture

- `logomarketplace617db5` Blob service stores the public catalog and SVG assets.
- `LogoApiKeys` stores key hashes, status, plan, and quota configuration.
- `LogoApiUsage` stores two bounded counter rows per API key: current minute and current month.
- `DefaultAzureCredential` supports Azure CLI locally and managed identity in Azure.
- The application identity needs `Storage Table Data Contributor`; `Storage Blob Data Reader` supports a future private-originals configuration.
- `AZURE_STORAGE_CONNECTION_STRING` is an optional local fallback and must remain secret.

The blob container is currently public so marketplace previews work directly. API quotas govern API usage, not direct public-blob access. For paid or exclusive asset delivery, move originals to a private container and issue short-lived signed downloads while keeping separate public previews.

## Response limits

Authenticated responses include `X-Request-Id`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `X-Monthly-Limit`, and `X-Monthly-Remaining`. A `429` response includes a stable error code and, for minute limits, `Retry-After`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Run TypeScript validation |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run check` | Run type checking and a production build |
| `npm run api-key:create` | Issue and persist a hashed API key |
| `npm run api-key:revoke` | Revoke an API key |

## Deployment

The workflow in `.github/workflows/ci.yml` validates pull requests and pushes to `main`. Deploy to a Node.js 20+ host, configure the variables from `.env.example`, attach the managed identity, and grant it the scoped storage roles described above.

## Asset attribution

The logo catalog is sourced from [glincker/thesvg](https://github.com/glincker/thesvg). Brand names, logos, and trademarks belong to their respective owners. API access does not grant trademark usage rights; review each brand's guidelines before publishing assets.
