# zc-framer-bridge

Shared libraries, data, and platform-synced content for Zerocopter's Framer marketing site.

## Overview

`zc-framer-bridge` is the central repository for everything that bridges Zerocopter's platform with the Framer-based public website. This includes shared TypeScript libraries (authentication, navigation), static data files consumed by Framer components, and any future platform-synced content.

## Repository Structure

```
zc-framer-bridge/
├── packages/
│   └── nav-core/              # @zerocopter/nav-core — Auth & navigation library
│       ├── src/
│       ├── dist/
│       ├── package.json
│       └── tsup.config.ts
├── data/
│   └── pricing/
│       └── packages.json      # Pricing packages consumed by Framer
├── package.json               # Root workspace config
└── README.md
```

## Packages

### `@zerocopter/nav-core`

Shared navigation logic and Keycloak authentication for Next.js and Framer.

-   Keycloak `useAuth` hook with automatic token refresh
-   Cross-platform builds (ESM/CJS for npm, CDN build for Framer via esm.sh)
-   Shared types, constants, and utilities (avatar colors, display names, etc.)

See [`packages/nav-core/`](packages/nav-core/) for full documentation and API reference.

## Data

### Pricing (`data/pricing/packages.json`)

Static JSON manifest containing Zerocopter pricing packages. This file is:

-   **Consumed by Framer** to display real-time pricing on the marketing site
-   **Synced automatically** by the `zc-core-api` Pricing Bridge Service to a Scaleway Object Storage bucket
-   **Updated via the platform** — admins manage pricing through the Zerocopter admin panel, which triggers a re-sync

The Framer site fetches this file from the CDN-backed bucket for fast, public, auth-free access.

## Development

### Prerequisites

-   Node.js 18+
-   npm

### Setup

```bash
# Install all workspace dependencies
npm install

# Build nav-core
npm run build

# Watch mode
npm run dev
```

### Adding a New Package

1. Create a new directory under `packages/`
2. Add a `package.json` with the appropriate name and build scripts
3. The root workspace config will pick it up automatically

### Adding New Data Files

Place static data files under `data/<domain>/`. These files are consumed by Framer components and/or synced to external storage by backend services.

## Architecture

```
┌──────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  Zerocopter      │     │  zc-framer-bridge    │     │  Framer Website   │
│  Platform        │     │                      │     │                   │
│                  │     │  packages/            │     │  Imports nav-core │
│  Admin updates   │────▶│    nav-core/         │────▶│  via CDN build    │
│  pricing data    │     │                      │     │                   │
│                  │     │  data/                │     │  Fetches pricing  │
│  zc-core-api     │────▶│    pricing/          │────▶│  from Scaleway    │
│  syncs to bucket │     │    packages.json     │     │  bucket (CDN)     │
└──────────────────┘     └─────────────────────┘     └───────────────────┘
```

## License

UNLICENSED — Proprietary software for Zerocopter
