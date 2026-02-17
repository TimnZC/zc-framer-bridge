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
    selectedCompanyId: string;
    onCompanyChange: (companyId: string) => void;
    userName: string;
    userRole: string;
    userAvatar: string;
    onUserMenuAction?: (action: UserMenuAction) => void;
    isLoading?: boolean;
    className?: string;
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

export { AVATAR_SIZE_DESKTOP_PX, AVATAR_SIZE_MOBILE_PX, type AuthActions, type AuthContext, type AuthState, type Company, type CompanyDropdownMenuProps, type CompanyType, DROPDOWN_OFFSET_PX, ICON_SIZE, type KeycloakConfig, type MenuItem, NAV_HEIGHT_PX, TOKEN_REFRESH_MIN_VALIDITY, TOKEN_UPDATE_MIN_VALIDITY, type TopNavBarProps, USER_MENU_ITEMS, type UseAuthOptions, type UserDropdownMenuProps, type UserInfo, type UserMenuAction, getAvatarColor, getCompanyTypeLabel, getFirstInitial, getUserDisplayName, getUserInitials, useAuth };
