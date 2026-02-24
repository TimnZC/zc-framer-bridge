// ============================================================================
// @zerocopter/nav-core - Shared Constants
// Platform-agnostic constants shared between Next.js and Framer
// ============================================================================

import type { MenuItem } from './types';

// --- Token Management ---
/** Refresh token if it expires within this many seconds */
export const TOKEN_REFRESH_MIN_VALIDITY = 30;
/** Update token if it expires within this many seconds */
export const TOKEN_UPDATE_MIN_VALIDITY = 300; // 5 minutes

// --- Layout Constants (platform-agnostic values, not Tailwind classes) ---
export const NAV_HEIGHT_PX = 56; // 14 * 4 = 56px (equivalent to h-14)
export const ICON_SIZE = 20;
export const AVATAR_SIZE_MOBILE_PX = 32; // w-8 h-8
export const AVATAR_SIZE_DESKTOP_PX = 40; // w-10 h-10
export const DROPDOWN_OFFSET_PX = 8;

// --- Menu Items ---
// Icon field is a semantic identifier that each platform maps to its own icon implementation.
// Next.js: maps to SVG file paths in /public/svgs/
// Framer: maps to inline SVG components
export const USER_MENU_ITEMS: MenuItem[] = [
  {
    icon: 'sparkles',
    label: 'Update plan',
    action: 'upgrade',
  },
  {
    icon: 'account',
    label: 'Account settings',
    action: 'account',
  },
  {
    icon: 'credit-card',
    label: 'Billing',
    action: 'billing',
  },
  {
    icon: 'notifications',
    label: 'Notifications',
    action: 'notifications',
  },
  {
    icon: 'sign-out',
    label: 'Sign out',
    action: 'signout',
    separator: true,
  },
];
