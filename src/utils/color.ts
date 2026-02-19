// ============================================================================
// @zerocopter/nav-core - Color Utilities
// Shared color functions for consistent avatar/icon fallback colors
// ============================================================================

const BIT_SHIFT_AMOUNT = 5;

export type ColorPair = { bg: string; text: string };

/**
 * Avatar fallback colors — light background with darker text.
 * Used for user avatars.
 */
export const AVATAR_COLOR_PAIRS: readonly ColorPair[] = [
    { bg: "bg-pri-8", text: "text-pri-80" },
    { bg: "bg-sec-8", text: "text-sec-80" },
    { bg: "bg-ter-8", text: "text-ter-80" },
    { bg: "bg-suc-8", text: "text-suc-80" },
    { bg: "bg-war-8", text: "text-war-80" },
    { bg: "bg-dan-8", text: "text-dan-80" },
] as const;

/**
 * Company icon fallback colors — dark background with lighter text.
 * Used for company/organization icons.
 */
export const COMPANY_COLOR_PAIRS: readonly ColorPair[] = [
    { bg: "bg-pri-80", text: "text-pri-8" },
    { bg: "bg-sec-80", text: "text-sec-8" },
    { bg: "bg-ter-80", text: "text-ter-8" },
    { bg: "bg-suc-80", text: "text-suc-8" },
    { bg: "bg-war-80", text: "text-war-8" },
    { bg: "bg-dan-80", text: "text-dan-8" },
] as const;

/**
 * Hash a string to a numeric value.
 * Deterministic: same input always produces the same output.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = str.charCodeAt(i) + ((hash << BIT_SHIFT_AMOUNT) - hash);
    }
    return hash;
}

/**
 * Get a consistent color pair from a string.
 * Same input always returns the same color pair — useful for avatar/icon fallbacks
 * so each user or company always gets the same color.
 *
 * @param str - The string to derive the color from (e.g. user name, initials)
 * @param colorPairs - Array of color pairs to pick from (defaults to AVATAR_COLOR_PAIRS)
 * @returns A color pair with `bg` and `text` Tailwind class strings
 */
export function getColorPair(
    str: string,
    colorPairs: readonly ColorPair[] = AVATAR_COLOR_PAIRS
): ColorPair {
    const defaultPair = colorPairs[0] ?? {
        bg: "bg-pri-8",
        text: "text-pri-80",
    };

    if (str === null || str === undefined || str === "") {
        return defaultPair;
    }

    const index = Math.abs(hashString(str)) % colorPairs.length;
    return colorPairs[index] ?? defaultPair;
}
