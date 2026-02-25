// ============================================================================
// @zerocopter/nav-core
// Shared navigation logic for Zerocopter's Next.js app and Framer website.
// ============================================================================

// --- Hooks ---
export { useAuth } from "./hooks/use-auth";

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
} from "./types";

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
} from "./constants";

// --- Utilities ---
export {
    getAvatarColor,
    getCompanyTypeLabel,
    getFirstInitial,
    getUserDisplayName,
    getUserInitials,
} from "./utils/text";

export {
    getColorPair,
    AVATAR_COLOR_PAIRS,
    COMPANY_COLOR_PAIRS,
} from "./utils/color";
export type { ColorPair } from "./utils/color";

// --- Design Tokens ---
export { colors, fonts, radii } from "./tokens";

// --- Pricing Types & Labels ---
export {
    CATEGORY_LABELS,
    FEATURE_LABELS,
} from "./pricing-types";
export type {
    PricingData,
    PricingFeatures,
    PricingPackage,
} from "./pricing-types";

// --- Framer Components (inline CSS, no Tailwind) ---
export { FramerPricingCard } from "./components/PricingCard";
export type { FramerPricingCardProps } from "./components/PricingCard";

export { FramerFeatureComparisonTable } from "./components/FeatureComparisonTable";
export type { FramerFeatureComparisonTableProps } from "./components/FeatureComparisonTable";
