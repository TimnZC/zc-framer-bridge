// ============================================================================
// @zerocopter/nav-core - Color Utilities
// Shared color functions for consistent avatar/icon fallback colors
// ============================================================================

const BIT_SHIFT_AMOUNT = 5;

export type ColorPair = {
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
export const AVATAR_COLOR_PAIRS: readonly ColorPair[] = [
    {
        bg: "bg-pri-8",
        text: "text-pri-80",
        bgValue: "oklch(0.9636 0.0176 253.34)",
        textValue: "oklch(0.658 0.1823 256.59)",
    },
    {
        bg: "bg-sec-8",
        text: "text-sec-80",
        bgValue: "oklch(0.9591 0.0147 290.31)",
        textValue: "oklch(0.5913 0.1585 284.25)",
    },
    {
        bg: "bg-ter-8",
        text: "text-ter-80",
        bgValue: "oklch(0.9703 0.0167 343.61)",
        textValue: "oklch(0.7279 0.1872 349.22)",
    },
    {
        bg: "bg-suc-8",
        text: "text-suc-80",
        bgValue: "oklch(0.977 0.0158 196.9)",
        textValue: "oklch(0.7929 0.1183 194.35)",
    },
    {
        bg: "bg-war-8",
        text: "text-war-80",
        bgValue: "oklch(0.9796 0.0119 67.69)",
        textValue: "oklch(0.8019 0.1167 62.39)",
    },
    {
        bg: "bg-dan-8",
        text: "text-dan-80",
        bgValue: "oklch(0.9656 0.0177 4.51)",
        textValue: "oklch(0.6996 0.197366 10.4046)",
    },
] as const;

/**
 * Company icon fallback colors — dark background with lighter text.
 * Used for company/organization icons.
 */
export const COMPANY_COLOR_PAIRS: readonly ColorPair[] = [
    {
        bg: "bg-pri-80",
        text: "text-pri-8",
        bgValue: "oklch(0.658 0.1823 256.59)",
        textValue: "oklch(0.9636 0.0176 253.34)",
    },
    {
        bg: "bg-sec-80",
        text: "text-sec-8",
        bgValue: "oklch(0.5913 0.1585 284.25)",
        textValue: "oklch(0.9591 0.0147 290.31)",
    },
    {
        bg: "bg-ter-80",
        text: "text-ter-8",
        bgValue: "oklch(0.7279 0.1872 349.22)",
        textValue: "oklch(0.9703 0.0167 343.61)",
    },
    {
        bg: "bg-suc-80",
        text: "text-suc-8",
        bgValue: "oklch(0.7929 0.1183 194.35)",
        textValue: "oklch(0.977 0.0158 196.9)",
    },
    {
        bg: "bg-war-80",
        text: "text-war-8",
        bgValue: "oklch(0.8019 0.1167 62.39)",
        textValue: "oklch(0.9796 0.0119 67.69)",
    },
    {
        bg: "bg-dan-80",
        text: "text-dan-8",
        bgValue: "oklch(0.6996 0.197366 10.4046)",
        textValue: "oklch(0.9656 0.0177 4.51)",
    },
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
 * Next.js: use `colorPair.bg` / `colorPair.text` (Tailwind classes)
 * Framer:  use `colorPair.bgValue` / `colorPair.textValue` (inline CSS)
 *
 * @param str - The string to derive the color from (e.g. user name, initials)
 * @param colorPairs - Array of color pairs to pick from (defaults to AVATAR_COLOR_PAIRS)
 */
export function getColorPair(
    str: string,
    colorPairs: readonly ColorPair[] = AVATAR_COLOR_PAIRS
): ColorPair {
    const defaultPair = colorPairs[0] ?? {
        bg: "bg-pri-8",
        text: "text-pri-80",
        bgValue: "oklch(0.9636 0.0176 253.34)",
        textValue: "oklch(0.658 0.1823 256.59)",
    };

    if (str === null || str === undefined || str === "") {
        return defaultPair;
    }

    const index = Math.abs(hashString(str)) % colorPairs.length;
    return colorPairs[index] ?? defaultPair;
}
