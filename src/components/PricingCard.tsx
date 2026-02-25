// ============================================================================
// Framer-compatible PricingCard
// Matches Figma node 8349:11919 (subscriptions-card) pixel-for-pixel.
// Uses inline CSS — no Tailwind dependency.
// ============================================================================

import React from "react";
import type { PricingPackage } from "../pricing-types";
import { colors, fonts, radii } from "../tokens";

export interface FramerPricingCardProps {
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

// ── Inline SVG icons (Framer can't load external SVGs) ──────────────────

const PlanIcon: React.FC = () => (
    <div
        style={{
            width: 36,
            height: 36,
            borderRadius: radii.sm,
            background: colors.zeroBrand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
    >
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
    </div>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.zeroBrand}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// ── Price formatter matching Figma "3.000€" format ──────────────────────

function formatPriceEU(amount: number, currency: string): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// ── Component ───────────────────────────────────────────────────────────

export function FramerPricingCard({
    pkg,
    currency,
    highlighted = false,
    badge,
    featureSummary,
    description,
    ctaLabel = "Select",
    onSelect,
    style,
}: FramerPricingCardProps): React.JSX.Element {
    const features =
        featureSummary ??
        Object.entries(pkg.features).flatMap(([, category]) =>
            Object.entries(category)
                .filter(([, v]) => v === true || (typeof v === "number" && v > 0))
                .map(([k]) =>
                    k
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                )
        );

    const descriptionText =
        description ?? `The ${pkg.name.toLowerCase()} plan includes:`;

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 44px",
                background: "#ffffff",
                borderRadius: radii.sm,
                overflow: "clip",
                boxShadow: highlighted
                    ? `0 0 0 2px ${colors.sec100}, 0 0 10px 0 rgba(0,0,0,0.1)`
                    : "0 0 10px 0 rgba(0,0,0,0.1)",
                fontFamily: fonts.sans,
                ...style,
            }}
        >
            {/* Badge (only when highlighted) */}
            {badge !== undefined && badge.length > 0 && highlighted && (
                <div
                    style={{
                        position: "absolute",
                        top: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: colors.sec100,
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 12px",
                        borderRadius: radii.full,
                        whiteSpace: "nowrap",
                    }}
                >
                    {badge}
                </div>
            )}

            {/* ── Header: icon + name + price + separator ── */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: "flex-start",
                    alignSelf: "stretch",
                }}
            >
                <PlanIcon />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        alignItems: "flex-start",
                    }}
                >
                    {/* Plan name + price */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            color: colors.foreground,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 32,
                                fontWeight: 500,
                                lineHeight: "32px",
                                letterSpacing: "-0.96px",
                            }}
                        >
                            {pkg.name}
                        </span>
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 400,
                                lineHeight: "24px",
                                letterSpacing: "-0.48px",
                            }}
                        >
                            {formatPriceEU(pkg.monthly_price, currency)}{" "}
                            <span style={{ color: colors.mutedForegroundWeak }}>
                                per month
                            </span>
                        </span>
                    </div>

                    {/* Separator line */}
                    <div
                        style={{
                            width: "100%",
                            height: 0,
                            borderBottom: `1px solid ${colors.baseBorder}`,
                        }}
                    />
                </div>
            </div>

            {/* ── Description ── */}
            <div style={{ alignSelf: "stretch" }}>
                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.36px",
                        color: colors.mutedForegroundWeak,
                    }}
                >
                    {descriptionText}
                </p>
            </div>

            {/* ── Features + button ── */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    alignSelf: "stretch",
                }}
            >
                {/* Feature list */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "flex-start",
                    }}
                >
                    {features.map((feature) => (
                        <div
                            key={feature}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <CheckIcon />
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    lineHeight: "22px",
                                    letterSpacing: "-0.42px",
                                    color: colors.foreground,
                                }}
                            >
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Select button */}
                <button
                    type="button"
                    onClick={onSelect}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        height: 44,
                        padding: "8px 24px",
                        borderRadius: radii.sm,
                        border: "none",
                        background: colors.foreground,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 500,
                            lineHeight: "16px",
                            letterSpacing: "-0.48px",
                            color: "#ffffff",
                            opacity: 0.9,
                            whiteSpace: "nowrap",
                            fontFamily: fonts.sans,
                        }}
                    >
                        {ctaLabel}
                    </span>
                </button>
            </div>
        </div>
    );
}
