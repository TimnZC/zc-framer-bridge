import React from 'react';

interface UserInfo {
    sub?: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email_verified?: boolean;
}
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    error: string | null;
}
interface AuthActions {
    login: () => void;
    logout: () => Promise<void>;
    getToken: () => Promise<string | undefined>;
    clearError: () => void;
}
type AuthContext = AuthState & AuthActions;
interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
}
interface UseAuthOptions {
    /** Keycloak server URL */
    keycloakUrl: string;
    /** Keycloak realm */
    keycloakRealm: string;
    /** Keycloak client ID */
    keycloakClientId: string;
    /**
     * Where to redirect after login.
     * Defaults to `window.location.href`
     */
    loginRedirectUri?: string;
    /**
     * Where to redirect after logout.
     * Defaults to `window.location.origin`
     */
    logoutRedirectUri?: string;
    /**
     * Called when Keycloak is initialized and the instance is ready.
     * Use this to wire up platform-specific integrations (e.g., axios interceptors).
     */
    onKeycloakReady?: (keycloak: unknown) => void;
    /**
     * Keycloak init onLoad option.
     * - 'check-sso': silently check if the user has an existing session
     * - undefined: don't auto-authenticate
     * Defaults to 'check-sso'
     */
    onLoad?: 'check-sso' | 'login-required' | undefined;
    /**
     * Whether to use silent SSO check via iframe.
     * Requires a silent-check-sso.html page hosted on the same origin.
     * Defaults to false (safer for Framer which runs in iframes)
     */
    enableSilentSsoCheck?: boolean;
    /**
     * Whether to use the check login iframe.
     * Should be false in Framer (iframe context), true in Next.js.
     * Defaults to false
     */
    checkLoginIframe?: boolean;
}
type CompanyType = 'team' | 'company';
interface Company {
    id: string;
    name: string;
    logo: string;
    type: CompanyType;
}
type UserMenuAction = 'upgrade' | 'account' | 'billing' | 'notifications' | 'signout';
interface MenuItem {
    /** Icon identifier — in Next.js this is an SVG path, in Framer it's used to look up inline SVGs */
    icon: string;
    label: string;
    action: UserMenuAction;
    separator?: boolean;
}
interface TopNavBarProps {
    companies: Company[];
    selectedCompanyId?: string;
    onCompanyChange: (companyId: string) => void;
    userName: string;
    userRole: string;
    userAvatar: string;
    onUserMenuAction?: (action: UserMenuAction) => void;
    isLoading?: boolean;
    className?: string;
    hideSidebarTrigger?: boolean;
    isAuthenticated?: boolean;
    onLoginClick?: (() => void) | undefined;
}
interface UserDropdownMenuProps {
    userName: string;
    userRole?: string;
    userAvatar: string;
    showDetails?: boolean;
    align?: 'start' | 'center' | 'end';
    onMenuAction?: (action: UserMenuAction) => void;
    menuItems: MenuItem[];
}
interface CompanyDropdownMenuProps {
    selectedCompany: Company;
    otherCompanies: Company[];
    onCompanyChange: (companyId: string) => void;
    className?: string;
}

/**
 * Platform-agnostic Keycloak authentication hook.
 *
 * **Next.js usage:**
 * Wrap in an AuthProvider that calls `useAuth()` once and distributes
 * the result via React Context. This ensures a single Keycloak instance.
 *
 * **Framer usage:**
 * Call directly inside a Framer code component. The hook manages its own
 * Keycloak lifecycle with an internal instance cache.
 *
 * @example
 * ```tsx
 * const auth = useAuth({
 *   keycloakUrl: 'https://auth.dev.zrc.pt',
 *   keycloakRealm: 'zc',
 *   keycloakClientId: 'zcnxt-frontend',
 * });
 *
 * if (auth.isLoading) return <Spinner />;
 * if (!auth.isAuthenticated) return <button onClick={auth.login}>Log in</button>;
 * return <p>Hello, {auth.user?.name}</p>;
 * ```
 */
declare function useAuth(options: UseAuthOptions): AuthContext;

/** Refresh token if it expires within this many seconds */
declare const TOKEN_REFRESH_MIN_VALIDITY = 30;
/** Update token if it expires within this many seconds */
declare const TOKEN_UPDATE_MIN_VALIDITY = 300;
declare const NAV_HEIGHT_PX = 56;
declare const ICON_SIZE = 20;
declare const AVATAR_SIZE_MOBILE_PX = 32;
declare const AVATAR_SIZE_DESKTOP_PX = 40;
declare const DROPDOWN_OFFSET_PX = 8;
declare const USER_MENU_ITEMS: MenuItem[];

/**
 * Get user initials from full name.
 * - "John Doe" -> "JD"
 * - "John" -> "JO"
 */
declare const getUserInitials: (name: string) => string;
/**
 * Get first initial from a name.
 * - "Zerocopter" -> "Z"
 */
declare const getFirstInitial: (name: string) => string;
/**
 * Get display name from UserInfo with fallback chain:
 * 1. Full name (name field)
 * 2. Given name + Family name
 * 3. Preferred username
 * 4. Email
 * 5. 'Unknown' as last resort
 */
declare function getUserDisplayName(user: UserInfo | null | undefined): string;
/**
 * Generate a consistent avatar color from a name string.
 * Returns an HSL color string.
 */
declare const getAvatarColor: (name: string) => string;
/**
 * Get company type label for display.
 */
declare const getCompanyTypeLabel: (type: "team" | "company") => string;

type ColorPair = {
    /** Tailwind background class (e.g. 'bg-pri-8') — used in Next.js */
    bg: string;
    /** Tailwind text class (e.g. 'text-pri-80') — used in Next.js */
    text: string;
    /** Inline CSS background color (oklch) — used in Framer / inline styles */
    bgValue: string;
    /** Inline CSS text color (oklch) — used in Framer / inline styles */
    textValue: string;
};
/**
 * Avatar fallback colors — light background with darker text.
 * Used for user avatars.
 */
declare const AVATAR_COLOR_PAIRS: readonly ColorPair[];
/**
 * Company icon fallback colors — dark background with lighter text.
 * Used for company/organization icons.
 */
declare const COMPANY_COLOR_PAIRS: readonly ColorPair[];
/**
 * Get a consistent color pair from a string.
 * Same input always returns the same color pair — useful for avatar/icon fallbacks
 * so each user or company always gets the same color.
 *
 * Next.js: use `colorPair.bg` / `colorPair.text` (Tailwind classes)
 * Framer:  use `colorPair.bgValue` / `colorPair.textValue` (inline CSS)
 *
 * @param str - The string to derive the color from (e.g. user name, initials)
 * @param colorPairs - Array of color pairs to pick from (defaults to AVATAR_COLOR_PAIRS)
 */
declare function getColorPair(str: string, colorPairs?: readonly ColorPair[]): ColorPair;

declare const colors: {
    readonly foreground: "#2f3242";
    readonly foregroundSubtle: "#454858";
    readonly background: "oklch(0.9731 0 0)";
    readonly card: "#ffffff";
    readonly cardForeground: "oklch(0.145 0 0)";
    readonly mutedForeground: "oklch(0.556 0 0)";
    readonly mutedForegroundWeak: "#9093a1";
    readonly baseBorder: "#e0e0e0";
    readonly zeroBrand: "#8b7cf6";
    readonly sec100: "#5347cd";
    readonly sec4: "oklch(0.9805 0.0066 286.28)";
    readonly suc100: "oklch(0.7549 0.1264 194.16)";
    readonly ink4: "oklch(0.9642 0 0)";
    readonly ink8: "oklch(0.9401 0 0)";
    readonly ink24: "oklch(0.8141 0 0)";
    readonly ink40: "oklch(0.683 0 0)";
    readonly ink64: "oklch(0.4748 0 0)";
};
declare const fonts: {
    readonly sans: "'DM Sans', system-ui, -apple-system, sans-serif";
};
declare const radii: {
    readonly sm: "4px";
    readonly md: "8px";
    readonly lg: "10px";
    readonly full: "9999px";
};

interface PricingFeatures {
    platform: {
        onboarding_setup: boolean;
        asset_map_scoping: boolean;
        continuous_recon: boolean;
        hacker_marketplace: boolean;
    };
    services: {
        cvd_ai_triage: boolean;
        bug_bounty_ai_triage: boolean;
        ai_pentest_reporting: boolean;
    };
    hacker_in_the_loop: {
        community_pentesting: number | null;
        community_peer_review: number | null;
        human_triage: number | null;
    };
    reporting: {
        standard: boolean;
        management_dashboards: boolean;
    };
}
interface PricingPackage {
    id: string;
    name: string;
    monthly_price: number;
    included_credits_yearly: number;
    bug_bounty_handling_fee: string;
    features: PricingFeatures;
}
interface PricingData {
    last_updated: string;
    currency: string;
    billing_cycle: string;
    packages: PricingPackage[];
}
/** Human-readable labels for each feature key */
declare const FEATURE_LABELS: Record<string, string>;
/** Human-readable labels for each feature category */
declare const CATEGORY_LABELS: Record<string, string>;

interface FramerPricingCardProps {
    pkg: PricingPackage;
    currency: string;
    highlighted?: boolean;
    badge?: string;
    /** Override the auto-derived feature list */
    featureSummary?: string[];
    /** Override the description line (default: "The {plan} plan includes:") */
    description?: string;
    /** Button label (default: "Select") */
    ctaLabel?: string;
    onSelect?: () => void;
    style?: React.CSSProperties;
}
declare function FramerPricingCard({ pkg, currency, highlighted, badge, featureSummary, description, ctaLabel, onSelect, style, }: FramerPricingCardProps): React.JSX.Element;

interface FramerFeatureComparisonTableProps {
    packages: PricingPackage[];
    highlightedPackageId?: string;
    style?: React.CSSProperties;
}
declare function FramerFeatureComparisonTable({ packages, highlightedPackageId, style, }: FramerFeatureComparisonTableProps): React.JSX.Element;

export { AVATAR_COLOR_PAIRS, AVATAR_SIZE_DESKTOP_PX, AVATAR_SIZE_MOBILE_PX, type AuthActions, type AuthContext, type AuthState, CATEGORY_LABELS, COMPANY_COLOR_PAIRS, type ColorPair, type Company, type CompanyDropdownMenuProps, type CompanyType, DROPDOWN_OFFSET_PX, FEATURE_LABELS, FramerFeatureComparisonTable, type FramerFeatureComparisonTableProps, FramerPricingCard, type FramerPricingCardProps, ICON_SIZE, type KeycloakConfig, type MenuItem, NAV_HEIGHT_PX, type PricingData, type PricingFeatures, type PricingPackage, TOKEN_REFRESH_MIN_VALIDITY, TOKEN_UPDATE_MIN_VALIDITY, type TopNavBarProps, USER_MENU_ITEMS, type UseAuthOptions, type UserDropdownMenuProps, type UserInfo, type UserMenuAction, colors, fonts, getAvatarColor, getColorPair, getCompanyTypeLabel, getFirstInitial, getUserDisplayName, getUserInitials, radii, useAuth };
