# zc-framer-bridge

Shared libraries, data, and platform-synced content for Zerocopter's Framer marketing site.

## Overview

`zc-framer-bridge` is the central repository for everything that bridges Zerocopter's platform with the Framer-based public website. It provides the `@zerocopter/nav-core` package (authentication, navigation) and hosts static data files consumed by Framer components.

## Repository Structure

```
zc-framer-bridge/
├── src/                       # @zerocopter/nav-core source
│   ├── hooks/use-auth.ts      # Keycloak auth hook
│   ├── utils/                 # Text, color utilities
│   ├── types.ts               # Shared TypeScript types
│   ├── constants.ts           # Shared constants
│   └── index.ts               # Package entry point
├── dist/                      # Built output (ESM, CJS, CDN)
├── data/
│   └── pricing/
│       └── packages.json      # Pricing packages consumed by Framer
├── package.json               # @zerocopter/nav-core package
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## @zerocopter/nav-core

Shared navigation logic and Keycloak authentication for Next.js and Framer.

### Installation

```bash
# npm / bun
bun add @zerocopter/nav-core

# Or from git
bun add github:TimnZC/zc-framer-bridge

# CDN (Framer)
import { useAuth } from "https://esm.sh/@zerocopter/nav-core@0.3.0/cdn";
```

### Features

- Keycloak `useAuth` hook with automatic token refresh and instance caching
- Cross-platform builds (ESM/CJS for npm, CDN build for Framer via esm.sh)
- Shared types, constants, and utilities (avatar colors, display names, etc.)

## Data

### Pricing (`data/pricing/packages.json`)

Static JSON manifest containing Zerocopter pricing packages. This file is:

- **Consumed by Framer** to display real-time pricing on the marketing site
- **Synced automatically** by the `zc-core-api` Pricing Bridge Service to a Scaleway Object Storage bucket
- **Updated via the platform** — admins manage pricing through the Zerocopter admin panel

## Development

```bash
bun install
bun run build    # Build ESM + CJS + CDN
bun run dev      # Watch mode
bun run clean    # Clean dist/
```

## Architecture

```
┌──────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│  Zerocopter      │     │  zc-framer-bridge    │     │  Framer Website   │
│  Platform        │     │                      │     │                   │
│  Admin updates   │────▶│  @zerocopter/nav-core│────▶│  CDN build import │
│  pricing data    │     │  data/pricing/       │────▶│  Fetches from CDN │
│  zc-core-api     │     │                      │     │                   │
└──────────────────┘     └─────────────────────┘     └───────────────────┘
```

## License

UNLICENSED — Proprietary software for Zerocopter
