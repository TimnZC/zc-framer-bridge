// ============================================================================
// @zerocopter/nav-core - Shared Types
// Used by both Next.js (zcnxt-frontend) and Framer marketing site
// ============================================================================

// --- Auth Types ---

export interface UserInfo {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  error: string | null;
}

export interface AuthActions {
  login: () => void;
  logout: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
  clearError: () => void;
}

export type AuthContext = AuthState & AuthActions;

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export interface UseAuthOptions {
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

// --- Navigation Types ---

export type CompanyType = 'team' | 'company';

export interface Company {
  id: string;
  name: string;
  logo: string;
  type: CompanyType;
}

export type UserMenuAction = 'upgrade' | 'account' | 'billing' | 'notifications' | 'signout';

export interface MenuItem {
  /** Icon identifier — in Next.js this is an SVG path, in Framer it's used to look up inline SVGs */
  icon: string;
  label: string;
  action: UserMenuAction;
  separator?: boolean;
}

// --- Component Props Types ---

export interface TopNavBarProps {
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

export interface UserDropdownMenuProps {
  userName: string;
  userRole?: string;
  userAvatar: string;
  showDetails?: boolean;
  align?: 'start' | 'center' | 'end';
  onMenuAction?: (action: UserMenuAction) => void;
  menuItems: MenuItem[];
}

export interface CompanyDropdownMenuProps {
  selectedCompany: Company;
  otherCompanies: Company[];
  onCompanyChange: (companyId: string) => void;
  className?: string;
}
