// ============================================================================
// Framer-compatible PricingCard
// Mirrors zcnxt-frontend PricingCard but uses inline CSS instead of Tailwind.
// Data comes from packages.json via props.
// ============================================================================

import React from "react";
import type { PricingPackage } from "../pricing-types";
import { colors, fonts, radii } from "../tokens";

export interface FramerPricingCardProps {
    pkg: PricingPackage;
    currency: string;
    highlighted?: boolean;
    badge?: string;
    /** Short feature summary lines shown on the card */
    featureSummary?: string[];
    onSelect?: () => void;
    style?: React.CSSProperties;
}

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.suc100}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-EU", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function FramerPricingCard({
    pkg,
    currency,
    highlighted = false,
    badge,
    featureSummary,
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

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                padding: "24px 0",
                background: colors.card,
                borderRadius: radii.lg,
                border: highlighted
                    ? `2px solid ${colors.sec100}`
                    : `1px solid ${colors.baseBorder}`,
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                fontFamily: fonts.sans,
                ...style,
            }}
        >
            {/* Badge */}
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

            {/* Header — plan name */}
            <div style={{ padding: "0 24px" }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 600,
                        lineHeight: 1,
                        color: colors.foreground,
                    }}
                >
                    {pkg.name}
                </h3>
            </div>

            {/* Price + meta */}
            <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span
                        style={{
                            fontSize: 36,
                            fontWeight: 300,
                            letterSpacing: "-0.02em",
                            color: colors.foreground,
                        }}
                    >
                        {formatPrice(pkg.monthly_price, currency)}
                    </span>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 400,
                            color: colors.mutedForeground,
                        }}
                    >
                        /month
                    </span>
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        color: colors.mutedForeground,
                        lineHeight: 1.5,
                    }}
                >
                    {formatPrice(pkg.included_credits_yearly, currency)} credits/year
                    &nbsp;·&nbsp;
                    {pkg.bug_bounty_handling_fee} handling fee
                </p>
            </div>

            {/* Feature list */}
            <div style={{ padding: "0 24px" }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {features.map((feature) => (
                        <li
                            key={feature}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                            }}
                        >
                            <span style={{ marginTop: 2 }}>
                                <CheckIcon />
                            </span>
                            <span
                                style={{
                                    fontSize: 14,
                                    color: colors.foreground,
                                    lineHeight: 1.4,
                                }}
                            >
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA button */}
            <div style={{ padding: "0 24px" }}>
                <button
                    type="button"
                    onClick={onSelect}
                    style={{
                        width: "100%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 40,
                        padding: "8px 12px",
                        borderRadius: radii.md,
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: fonts.sans,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                        border: highlighted ? "none" : `1px solid ${colors.baseBorder}`,
                        background: highlighted ? colors.zeroBrand : "transparent",
                        color: highlighted ? "#ffffff" : colors.foreground,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    Get started
                </button>
            </div>
        </div>
    );
}
