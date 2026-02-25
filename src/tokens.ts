// ============================================================================
// @zerocopter/nav-core - Design Tokens (inline CSS values)
// OKLCH color values matching the Zerocopter design system.
// Used by Framer components that cannot use Tailwind.
// ============================================================================

export const colors = {
    foreground: "#1f1f1f",
    background: "oklch(0.9731 0 0)",
    card: "#ffffff",
    cardForeground: "oklch(0.145 0 0)",
    mutedForeground: "oklch(0.556 0 0)",
    mutedForegroundWeak: "#9093a1",
    baseBorder: "#e0e0e0",
    zeroBrand: "oklch(0.6569 0.1759 286.1)",

    // Semantic
    sec100: "oklch(0.4936 0.1986 280.27)",
    sec4: "oklch(0.9805 0.0066 286.28)",
    suc100: "oklch(0.7549 0.1264 194.16)",
    ink4: "oklch(0.9642 0 0)",
    ink8: "oklch(0.9401 0 0)",
    ink24: "oklch(0.8141 0 0)",
    ink40: "oklch(0.683 0 0)",
    ink64: "oklch(0.4748 0 0)",
} as const;

export const fonts = {
    sans: "'DM Sans', system-ui, -apple-system, sans-serif",
} as const;

export const radii = {
    sm: "4px",
    md: "8px",
    lg: "10px",
    full: "9999px",
} as const;
