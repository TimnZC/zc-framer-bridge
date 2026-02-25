// ============================================================================
// ZcPricingCard — Framer Code Component (CDN version)
//
// Renders a single pricing plan card matching Figma node 8349:11919.
// Fetches plan data from packages.json and displays the selected package.
//
// Imports @zerocopter/nav-core from GitHub Pages CDN.
// When you update nav-core, rebuild dist and push to TimnZC/zc-framer-bridge.
//
// CDN URL: https://timnzc.github.io/zc-framer-bridge/dist/cdn/index.js
//
// HOW TO USE IN FRAMER:
// 1. In your Framer project, go to Assets → Code → New File
// 2. Paste this entire file
// 3. The component appears as "Zerocopter PricingCard" in the component picker
// 4. Set the Package property to choose which plan to display
// ============================================================================

// @ts-expect-error -- framer module only exists in Framer runtime environment
// eslint-disable-next-line import/no-unresolved
import { addPropertyControls, ControlType } from "framer"
// @ts-expect-error -- CDN import from nav-core GitHub Pages
import {
    FramerPricingCard,
    colors,
    fonts,
} from "https://timnzc.github.io/zc-framer-bridge/dist/cdn/index.js?v=3"
import React, { useEffect, useState } from "react"

// ============================================================================
// Data URL — where packages.json is served from
// ============================================================================

const DEFAULT_DATA_URL =
    "https://raw.githubusercontent.com/TimnZC/zc-framer-bridge/main/data/pricing/packages.json"

// ============================================================================
// Types (mirrored from nav-core for Framer type-safety)
// ============================================================================

interface PricingPackage {
    id: string
    name: string
    monthly_price: number
    included_credits_yearly: number
    bug_bounty_handling_fee: string
    features: Record<string, Record<string, boolean | number | null>>
}

interface PricingData {
    currency: string
    packages: PricingPackage[]
}

// ============================================================================
// Loading skeleton (matches Figma card layout: icon, name, price, features)
// ============================================================================

function CardSkeleton({
    width,
    highlighted,
}: {
    width: number | string
    highlighted: boolean
}) {
    return (
        <>
            <style>
                {
                    "@keyframes zcPricePulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }"
                }
            </style>
            <div
                style={{
                    width,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "64px 44px",
                    background: "#ffffff",
                    borderRadius: 4,
                    boxShadow: highlighted
                        ? `0 0 0 2px ${colors.sec100}, 0 0 10px rgba(0,0,0,0.1)`
                        : "0 0 10px rgba(0,0,0,0.1)",
                    fontFamily: fonts.sans,
                }}
            >
                {/* Icon skeleton */}
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        animation: "zcPricePulse 1.5s ease-in-out infinite",
                    }}
                />
                {/* Plan name skeleton */}
                <div
                    style={{
                        width: "70%",
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        animation:
                            "zcPricePulse 1.5s ease-in-out infinite 0.1s",
                    }}
                />
                {/* Price skeleton */}
                <div
                    style={{
                        width: "55%",
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        animation:
                            "zcPricePulse 1.5s ease-in-out infinite 0.15s",
                    }}
                />
                {/* Separator */}
                <div
                    style={{
                        width: "100%",
                        height: 1,
                        backgroundColor: "#E2E8F0",
                    }}
                />
                {/* Description skeleton */}
                <div
                    style={{
                        width: "65%",
                        height: 12,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        animation:
                            "zcPricePulse 1.5s ease-in-out infinite 0.2s",
                    }}
                />
                {/* Feature lines skeleton */}
                {[0.3, 0.35, 0.4, 0.45, 0.5].map((delay, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${55 + i * 8}%`,
                            height: 14,
                            borderRadius: 4,
                            backgroundColor: "#E2E8F0",
                            animation: `zcPricePulse 1.5s ease-in-out infinite ${delay}s`,
                        }}
                    />
                ))}
                {/* Button skeleton */}
                <div
                    style={{
                        width: 80,
                        height: 44,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        animation:
                            "zcPricePulse 1.5s ease-in-out infinite 0.6s",
                        marginTop: 8,
                    }}
                />
            </div>
        </>
    )
}

// ============================================================================
// Error state
// ============================================================================

function CardError({ message }: { message: string }) {
    return (
        <div
            style={{
                padding: "64px 44px",
                background: "#ffffff",
                borderRadius: 4,
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                fontFamily: fonts.sans,
                textAlign: "center",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    color: "#DC2626",
                    marginBottom: 8,
                }}
            >
                Failed to load pricing data
            </div>
            <div
                style={{
                    fontSize: 12,
                    color: "#64748B",
                    wordBreak: "break-word",
                }}
            >
                {message}
            </div>
        </div>
    )
}

// ============================================================================
// Component
// ============================================================================

interface ZcPricingCardProps {
    dataUrl?: string
    packageId?: string
    highlighted?: boolean
    badge?: string
    description?: string
    ctaLabel?: string
    ctaUrl?: string
    width?: number | string
    style?: React.CSSProperties
}

function ZcPricingCard(props: ZcPricingCardProps) {
    const {
        dataUrl = DEFAULT_DATA_URL,
        packageId = "advanced-plan",
        highlighted = false,
        badge = "",
        description = "",
        ctaLabel = "Select",
        ctaUrl = "",
        width = 360,
        style,
    } = props

    const [data, setData] = useState<PricingData | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        fetch(dataUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then((json) => {
                if (!cancelled) setData(json)
            })
            .catch((err) => {
                if (!cancelled) setError(String(err))
            })

        return () => {
            cancelled = true
        }
    }, [dataUrl])

    // Loading
    if (!data && !error) {
        return <CardSkeleton width={width} highlighted={highlighted} />
    }

    // Error
    if (error || !data) {
        return <CardError message={error ?? "No data"} />
    }

    // Find selected package
    const pkg = data.packages.find((p) => p.id === packageId)
    if (!pkg) {
        return (
            <CardError
                message={`Package "${packageId}" not found. Available: ${data.packages.map((p) => p.id).join(", ")}`}
            />
        )
    }

    const handleSelect = () => {
        if (ctaUrl) {
            window.open(ctaUrl, "_blank", "noopener")
        }
    }

    return (
        <FramerPricingCard
            pkg={pkg}
            currency={data.currency}
            highlighted={highlighted}
            badge={badge || undefined}
            description={description || undefined}
            ctaLabel={ctaLabel}
            onSelect={ctaUrl ? handleSelect : undefined}
            style={{ width, ...style }}
        />
    )
}

ZcPricingCard.displayName = "Zerocopter PricingCard"
export default ZcPricingCard

// ============================================================================
// Framer Property Controls
// ============================================================================

addPropertyControls(ZcPricingCard, {
    dataUrl: {
        type: ControlType.String,
        title: "Data URL",
        defaultValue: DEFAULT_DATA_URL,
        description: "URL to packages.json",
    },
    packageId: {
        type: ControlType.Enum,
        title: "Package",
        defaultValue: "advanced-plan",
        options: ["core-plan", "advanced-plan", "professional-plan"],
        optionTitles: ["Core / CVD Only", "Advanced", "Professional"],
        description: "Which pricing plan to display",
    },
    highlighted: {
        type: ControlType.Boolean,
        title: "Highlighted",
        defaultValue: false,
        description: "Show accent ring and enable badge",
    },
    badge: {
        type: ControlType.String,
        title: "Badge Text",
        defaultValue: "",
        placeholder: "Most Popular",
        description: "Badge shown above the card (only when highlighted)",
        hidden: (props: ZcPricingCardProps) => !props.highlighted,
    },
    description: {
        type: ControlType.String,
        title: "Description",
        defaultValue: "",
        placeholder: "The advanced plan includes:",
        description:
            'Override the description line (default: "The {plan} plan includes:")',
    },
    ctaLabel: {
        type: ControlType.String,
        title: "Button Label",
        defaultValue: "Select",
        description: "Text displayed on the CTA button",
    },
    ctaUrl: {
        type: ControlType.String,
        title: "CTA Link",
        defaultValue: "",
        placeholder: "https://app.zerocopter.com/signup",
        description: "URL to open when the CTA button is clicked",
    },
    width: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 360,
        min: 280,
        max: 500,
        step: 10,
        unit: "px",
    },
})
