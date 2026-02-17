// ============================================================================
// @zerocopter/nav-core
// Shared navigation logic for Zerocopter's Next.js app and Framer website.
// ============================================================================

// --- Hooks ---
export { useAuth } from './hooks/use-auth';

// --- Types ---
export type {
  AuthContext,
  AuthState,
  AuthActions,
  Company,
  CompanyDropdownMenuProps,
  CompanyType,
  KeycloakConfig,
  MenuItem,
  TopNavBarProps,
  UseAuthOptions,
  UserDropdownMenuProps,
  UserInfo,
  UserMenuAction,
} from './types';

// --- Constants ---
export {
  AVATAR_SIZE_DESKTOP_PX,
  AVATAR_SIZE_MOBILE_PX,
  DROPDOWN_OFFSET_PX,
  ICON_SIZE,
  NAV_HEIGHT_PX,
  TOKEN_REFRESH_MIN_VALIDITY,
  TOKEN_UPDATE_MIN_VALIDITY,
  USER_MENU_ITEMS,
} from './constants';

// --- Utilities ---
export {
  getAvatarColor,
  getCompanyTypeLabel,
  getFirstInitial,
  getUserDisplayName,
  getUserInitials,
} from './utils/text';
