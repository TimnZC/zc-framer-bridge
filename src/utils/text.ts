// ============================================================================
// @zerocopter/nav-core - Text Utilities
// Shared text processing functions used by both Next.js and Framer
// ============================================================================

import type { UserInfo } from '../types';

/**
 * Get user initials from full name.
 * - "John Doe" -> "JD"
 * - "John" -> "JO"
 */
export const getUserInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Get first initial from a name.
 * - "Zerocopter" -> "Z"
 */
export const getFirstInitial = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return '';
  }
  return name.trim()[0].toUpperCase();
};

/**
 * Get display name from UserInfo with fallback chain:
 * 1. Full name (name field)
 * 2. Given name + Family name
 * 3. Preferred username
 * 4. Email
 * 5. 'Unknown' as last resort
 */
export function getUserDisplayName(user: UserInfo | null | undefined): string {
  if (user === null || user === undefined) {
    return 'Unknown';
  }

  if (user.name !== null && user.name !== undefined && user.name !== '') {
    return user.name;
  }

  if (
    user.given_name !== null &&
    user.given_name !== undefined &&
    user.family_name !== null &&
    user.family_name !== undefined
  ) {
    return `${user.given_name} ${user.family_name}`;
  }

  if (
    user.preferred_username !== null &&
    user.preferred_username !== undefined &&
    user.preferred_username !== ''
  ) {
    return user.preferred_username;
  }

  if (user.email !== null && user.email !== undefined && user.email !== '') {
    return user.email;
  }

  return 'Unknown';
}

/**
 * Generate a consistent avatar color from a name string.
 * Returns an HSL color string.
 */
export const getAvatarColor = (name: string): string => {
  const HASH_SHIFT = 5;
  const HUE_MAX = 360;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << HASH_SHIFT) - hash);
  }
  const hue = Math.abs(hash) % HUE_MAX;
  return `hsl(${hue}, 65%, 50%)`;
};

/**
 * Get company type label for display.
 */
export const getCompanyTypeLabel = (type: 'team' | 'company'): string => {
  return type === 'team' ? 'Team Account' : 'Company Account';
};
