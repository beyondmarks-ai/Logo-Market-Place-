# Beyond Marks AI Academy Dashboard

A Next.js dashboard for managing academy students, project folders, API and Azure resource requests, notifications, certificates, and Azure Foundry-generated folder avatars.

## Features

- Student sign-up restricted to administrator-created admission IDs and `@beyondmarks.ai` email addresses
- Administrator email OTP through Azure Communication Services
- Student approval workflow and protected four-digit security PIN actions
- Per-student project folders, links, README notes, screenshots, and academy avatars
- API and Azure service request catalog
- Admin student, resource, notification, certificate, and avatar-management screens
- Automated Azure Foundry `gpt-image-2` avatar generation with a six-per-day limit

## Local setup

Requirements:

- Node.js 20 or newer
- npm
- Azure CLI signed in to an identity with access to the configured Azure resources

Install dependencies and create the local configuration:

```powershell
npm install
Copy-Item .env.example .env.local
```

Fill in `.env.local`. Never commit this file. Then start the application:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Validation

```powershell
npm run check
```

This runs TypeScript validation followed by a production build.

## Azure configuration

The server uses `DefaultAzureCredential`, allowing local development through Azure CLI and production through a managed identity. Azure service access is keyless, and administrator/signing secrets are retrieved from Azure Key Vault. Required non-secret settings are documented in [.env.example](.env.example).

Relevant Azure services:

- Azure Key Vault for administrator and signing secrets, accessed without vault keys
- Azure Communication Services and Email Communication Services for administrator OTP
- Microsoft Foundry/Azure AI Services with a `gpt-image-2` deployment for avatar generation

SMS verification is intentionally disabled until an India-capable sender is configured.

## Current storage model

This repository is a dashboard prototype. Student records, password/PIN hashes, projects, approvals, and generated-avatar metadata currently use browser storage. Before production, move identity and shared state to server-side authentication, the academy database, and Azure Blob Storage.

## Security

- `.env.local` and other local environment variants are ignored by Git.
- Do not place Azure keys, connection strings, passwords, or production secrets in source files.
- Use managed identities and Azure RBAC in deployed environments.
