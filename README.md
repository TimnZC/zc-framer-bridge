# @zerocopter/zc-framer-bridge

Shared navigation logic and authentication for Zerocopter's Next.js application and Framer marketing site.

## Overview

`@zerocopter/nav-core` is a platform-agnostic TypeScript library that provides unified authentication and navigation primitives for Zerocopter's ecosystem. It enables consistent user experience across different platforms by sharing Keycloak authentication logic, types, constants, and utilities.

## Features

-   **🔐 Keycloak Authentication** - Platform-agnostic `useAuth` hook with automatic token refresh
-   **🔄 Cross-Platform** - Works seamlessly in Next.js and Framer with appropriate build targets
-   **📦 Tree-Shakeable** - ESM and CJS exports with full TypeScript support
-   **🎨 UI-Agnostic** - Provides data and logic without enforcing specific UI implementations
-   **⚡ Optimized** - Instance caching and deduplication for React StrictMode and Framer editor
-   **🛡️ Type-Safe** - Fully typed with TypeScript for excellent developer experience

## Installation

### For Next.js (npm/yarn/pnpm)

```bash
npm install @zerocopter/nav-core
```

**Peer dependencies:**

-   `react` >= 18.0.0
-   `keycloak-js` >= 22.0.0

### For Framer (CDN)

The library provides a CDN build with Keycloak bundled via esm.sh:

```typescript
import { useAuth } from "https://esm.sh/@zerocopter/nav-core@0.3.0/cdn";
```

## Usage

### Authentication Hook

#### Next.js Setup

Create an `AuthProvider` to share the Keycloak instance across your app:

```tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth as useAuthHook, type AuthContext } from "@zerocopter/nav-core";

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthHook({
        keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
        keycloakRealm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
        keycloakClientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
        checkLoginIframe: true,
        enableSilentSsoCheck: true,
    });

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
```

#### Framer Setup

Call `useAuth` directly in your code component:

```tsx
import { useAuth } from "https://esm.sh/@zerocopter/nav-core@0.3.0/cdn";

export default function MyComponent() {
    const auth = useAuth({
        keycloakUrl: "https://auth.example.com",
        keycloakRealm: "my-realm",
        keycloakClientId: "my-client",
        checkLoginIframe: false, // Important for iframe contexts
    });

    if (auth.isLoading) return <div>Loading...</div>;

    if (!auth.isAuthenticated) {
        return <button onClick={auth.login}>Log in</button>;
    }

    return (
        <div>
            <p>Welcome, {auth.user?.name}!</p>
            <button onClick={auth.logout}>Log out</button>
        </div>
    );
}
```

### Configuration Options

```typescript
interface UseAuthOptions {
    /** Keycloak server URL */
    keycloakUrl: string;

    /** Keycloak realm */
    keycloakRealm: string;

    /** Keycloak client ID */
    keycloakClientId: string;

    /** Where to redirect after login (defaults to current URL) */
    loginRedirectUri?: string;

    /** Where to redirect after logout (defaults to origin) */
    logoutRedirectUri?: string;

    /** Callback when Keycloak instance is ready */
    onKeycloakReady?: (keycloak: unknown) => void;

    /** Keycloak onLoad strategy (defaults to 'check-sso') */
    onLoad?: "check-sso" | "login-required" | undefined;

    /** Enable silent SSO check via iframe (defaults to false) */
    enableSilentSsoCheck?: boolean;

    /** Enable login iframe check (defaults to false) */
    checkLoginIframe?: boolean;
}
```

### Using Utilities

```tsx
import {
    getUserDisplayName,
    getUserInitials,
    getAvatarColor,
    getFirstInitial,
} from "@zerocopter/nav-core";

const displayName = getUserDisplayName(auth.user);
const initials = getUserInitials(displayName);
const avatarColor = getAvatarColor(displayName);

<Avatar style={{ backgroundColor: avatarColor }}>{initials}</Avatar>;
```

### Using Constants

```tsx
import {
    NAV_HEIGHT_PX,
    ICON_SIZE,
    AVATAR_SIZE_DESKTOP_PX,
    USER_MENU_ITEMS,
} from "@zerocopter/nav-core";

<nav style={{ height: `${NAV_HEIGHT_PX}px` }}>
    {USER_MENU_ITEMS.map((item) => (
        <MenuItem key={item.action} {...item} />
    ))}
</nav>;
```

## API Reference

### Hooks

#### `useAuth(options: UseAuthOptions): AuthContext`

Returns an authentication context with state and actions.

**Returns:**

```typescript
interface AuthContext {
    // State
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    error: string | null;

    // Actions
    login: () => void;
    logout: () => Promise<void>;
    getToken: () => Promise<string | undefined>;
    clearError: () => void;
}
```

### Types

Full TypeScript definitions are exported for:

-   `AuthContext`, `AuthState`, `AuthActions`
-   `UserInfo`, `Company`, `CompanyType`
-   `MenuItem`, `UserMenuAction`
-   `TopNavBarProps`, `UserDropdownMenuProps`, `CompanyDropdownMenuProps`
-   `KeycloakConfig`, `UseAuthOptions`

### Utilities

#### Text Utilities

-   `getUserDisplayName(user)` - Get display name with smart fallback chain
-   `getUserInitials(name)` - Extract initials from full name
-   `getFirstInitial(name)` - Get first letter of name
-   `getAvatarColor(name)` - Generate consistent HSL color from name
-   `getCompanyTypeLabel(type)` - Format company type for display

### Constants

#### Token Management

-   `TOKEN_REFRESH_MIN_VALIDITY` - Refresh token if expiring within 30s
-   `TOKEN_UPDATE_MIN_VALIDITY` - Update token if expiring within 5 minutes

#### Layout

-   `NAV_HEIGHT_PX` - Navigation bar height (56px)
-   `ICON_SIZE` - Standard icon size (20px)
-   `AVATAR_SIZE_MOBILE_PX` - Mobile avatar size (32px)
-   `AVATAR_SIZE_DESKTOP_PX` - Desktop avatar size (40px)
-   `DROPDOWN_OFFSET_PX` - Dropdown offset (8px)

#### Menus

-   `USER_MENU_ITEMS` - Default user menu configuration

## Development

### Prerequisites

-   Node.js 18+
-   pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
```

### Build Outputs

The build process generates:

-   `dist/index.js` - ESM bundle
-   `dist/index.cjs` - CommonJS bundle
-   `dist/index.d.ts` - TypeScript declarations
-   `dist/cdn/index.js` - CDN bundle with Keycloak via esm.sh

### Project Structure

```
src/
├── index.ts              # Main entry point & exports
├── types.ts              # TypeScript type definitions
├── constants.ts          # Shared constants
├── hooks/
│   └── use-auth.ts       # Keycloak authentication hook
└── utils/
    └── text.ts           # Text processing utilities
```

## Architecture

### Keycloak Instance Caching

The `useAuth` hook implements intelligent instance caching to handle:

-   React StrictMode double-mounting
-   Framer editor hot reloading
-   Multiple components using the same Keycloak config

Instances are cached by configuration (URL, realm, client ID) and reused across React remounts.

### Token Management

-   **Automatic Refresh**: Tokens are automatically refreshed via `onTokenExpired` callback
-   **Pre-emptive Updates**: `getToken()` updates tokens 5 minutes before expiry
-   **Secure Logout**: Revokes refresh tokens server-side and clears all Keycloak storage

### Platform Compatibility

The library is designed to work across different JavaScript environments:

-   **Next.js**: Full SSR/CSR support with proper hydration
-   **Framer**: Iframe-safe configuration without login iframe checks
-   **Standard React**: Works in any React 18+ application

## License

UNLICENSED - Proprietary software for Zerocopter

## Repository

[github.com/TimnZC/nav-core](https://github.com/TimnZC/nav-core)
