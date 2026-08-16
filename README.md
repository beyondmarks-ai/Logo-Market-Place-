# Logo Market Place

A production-ready Next.js marketplace for browsing, previewing, customizing, and downloading professional SVG logos.

## Features

- Searchable, filterable grid of thousands of SVG assets
- Color, mono, light, dark, wordmark, brand, and cloud categories
- In-browser solid-color and gradient customization for mono SVGs
- Same-origin API routes that avoid browser CORS issues
- Azure Blob Storage as the primary asset source
- Automatic jsDelivr fallback when Azure is unavailable
- Responsive red-and-black navigation with a creamy white interface
- GitHub Actions validation on pushes and pull requests

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

No Azure credentials are required. The default storage container is publicly readable.

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To use another port:

```bash
npm run dev -- --port 3003
```

## Configuration

The application works without a local environment file. To point it at another public logo container, copy `.env.example` to `.env.local` and change:

```dotenv
NEXT_PUBLIC_LOGO_STORAGE_BASE_URL=https://your-account.blob.core.windows.net/your-container
```

The container must provide `catalog.json` at its root and SVG files at the paths listed in that catalog. Because this is a `NEXT_PUBLIC_` variable, do not place credentials or private SAS tokens in it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Run TypeScript validation |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run check` | Run type checking and a production build |

## Data flow

The browser requests the catalog through `/api/logos/catalog`. The server first checks Azure Blob Storage and falls back to the upstream collection on jsDelivr. Downloads use `/api/logos/download`, which validates requested paths and applies the same fallback. This keeps cross-origin storage requests out of the browser and prevents the earlier CORS failure.

## Deploying from GitHub

The workflow in `.github/workflows/ci.yml` runs `npm ci`, type checking, and a production build for pull requests and pushes to `main`.

For Vercel, import the GitHub repository and keep the default Next.js settings. For another Node host, build with `npm ci && npm run build` and start with `npm run start`. Add `NEXT_PUBLIC_LOGO_STORAGE_BASE_URL` only when overriding the default public container.

## Asset attribution

The logo catalog is sourced from [glincker/thesvg](https://github.com/glincker/thesvg). Brand names, logos, and trademarks belong to their respective owners; review each brand's usage guidelines before publishing assets.
