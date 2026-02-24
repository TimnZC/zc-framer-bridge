# @zerocopter/nav-core

Shared navigation logic and authentication for Zerocopter's Next.js application and Framer marketing site.

## Installation

### npm (Next.js)

```bash
npm install @zerocopter/nav-core
```

**Peer dependencies:** `react` >= 18.0.0, `keycloak-js` >= 22.0.0

### CDN (Framer)

```typescript
import { useAuth } from "https://esm.sh/@zerocopter/nav-core@0.3.0/cdn";
```

## Features

-   **Keycloak Authentication** — `useAuth` hook with automatic token refresh and instance caching
-   **Cross-Platform** — ESM/CJS builds for npm, CDN build for Framer via esm.sh
-   **UI-Agnostic** — Provides data and logic, not UI components
-   **Type-Safe** — Full TypeScript definitions

## API

### `useAuth(options): AuthContext`

```typescript
const auth = useAuth({
    keycloakUrl: "https://auth.zerocopter.com",
    keycloakRealm: "zerocopter",
    keycloakClientId: "web-app",
});

// auth.isAuthenticated, auth.user, auth.login(), auth.logout(), auth.getToken()
```

### Utilities

-   `getUserDisplayName(user)` — Display name with fallback chain
-   `getUserInitials(name)` — Extract initials
-   `getColorPair(name)` — Deterministic avatar color pair
-   `getCompanyTypeLabel(type)` — Format company type

### Constants

-   `NAV_HEIGHT_PX` (56px), `ICON_SIZE` (20px), `AVATAR_SIZE_DESKTOP_PX` (40px)
-   `USER_MENU_ITEMS` — Default user menu configuration
-   `AVATAR_COLOR_PAIRS`, `COMPANY_COLOR_PAIRS` — Color palettes

## Development

```bash
npm install
npm run build    # Build ESM + CJS + CDN
npm run dev      # Watch mode
npm run clean    # Clean dist/
```

## Build Outputs

| File                | Purpose                          |
| ------------------- | -------------------------------- |
| `dist/index.js`     | ESM bundle                       |
| `dist/index.cjs`    | CommonJS bundle                  |
| `dist/index.d.ts`   | TypeScript declarations          |
| `dist/cdn/index.js` | CDN bundle (Keycloak via esm.sh) |

## License

UNLICENSED — Proprietary software for Zerocopter
