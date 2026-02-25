// ============================================================================
// Framer-compatible FeatureComparisonTable
// Mirrors zcnxt-frontend FeatureComparisonTable but uses inline CSS.
// Reads feature data from packages.json structure.
// ============================================================================

import React from "react";
import type { PricingPackage } from "../pricing-types";
import { CATEGORY_LABELS, FEATURE_LABELS } from "../pricing-types";
import { colors, fonts } from "../tokens";

export interface FramerFeatureComparisonTableProps {
    packages: PricingPackage[];
    highlightedPackageId?: string;
    style?: React.CSSProperties;
}

const CheckIcon: React.FC = () => (
    <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.suc100}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "block", margin: "0 auto" }}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MinusIcon: React.FC = () => (
    <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.ink24}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "block", margin: "0 auto" }}
    >
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CreditsBadge: React.FC<{ value: number }> = ({ value }) => (
    <span
        style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 500,
            color: colors.sec100,
            textAlign: "center",
        }}
    >
        {value.toLocaleString("en")}
    </span>
);

type FeatureValue = boolean | number | null;

function FeatureCell({
    value,
    isHighlighted,
}: {
    value: FeatureValue;
    isHighlighted: boolean;
}): React.JSX.Element {
    return (
        <td
            style={{
                padding: "12px 16px",
                textAlign: "center",
                background: isHighlighted ? colors.sec4 : "transparent",
            }}
        >
            {value === true && <CheckIcon />}
            {value === null && <MinusIcon />}
            {typeof value === "number" && <CreditsBadge value={value} />}
        </td>
    );
}

/**
 * Extracts the ordered categories and their feature entries from a packages array.
 * Returns a structure that can be iterated to build the table rows.
 */
function buildCategoryRows(packages: PricingPackage[]) {
    const first = packages[0];
    if (!first) return [];

    const categoryKeys = Object.keys(first.features) as Array<keyof typeof first.features>;

    return categoryKeys.map((catKey) => {
        const featureKeys = Object.keys(first.features[catKey]) as string[];

        return {
            category: CATEGORY_LABELS[catKey] ?? catKey,
            features: featureKeys.map((fKey) => ({
                key: fKey,
                label: FEATURE_LABELS[fKey] ?? fKey.replace(/_/g, " "),
                values: packages.map((pkg) => {
                    const catObj = pkg.features[catKey] as Record<string, FeatureValue>;
                    return catObj[fKey] ?? null;
                }),
            })),
        };
    });
}

export function FramerFeatureComparisonTable({
    packages,
    highlightedPackageId,
    style,
}: FramerFeatureComparisonTableProps): React.JSX.Element {
    const categories = buildCategoryRows(packages);
    const totalColumns = packages.length + 1;

    return (
        <div
            style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                fontFamily: fonts.sans,
                ...style,
            }}
        >
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr>
                        {/* Empty corner cell */}
                        <th
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: colors.foreground,
                                padding: "12px 16px",
                                textAlign: "left",
                            }}
                        />
                        {packages.map((pkg) => (
                            <th
                                key={pkg.id}
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color:
                                        highlightedPackageId === pkg.id
                                            ? colors.sec100
                                            : colors.foreground,
                                    textAlign: "center",
                                    padding: "12px 16px",
                                    minWidth: 120,
                                }}
                            >
                                {pkg.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <React.Fragment key={cat.category}>
                            {/* Category header */}
                            <tr>
                                <td
                                    colSpan={totalColumns}
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        color: colors.ink64,
                                        background: colors.ink4,
                                        padding: "8px 16px",
                                    }}
                                >
                                    {cat.category}
                                </td>
                            </tr>

                            {/* Feature rows */}
                            {cat.features.map((feature) => (
                                <tr
                                    key={feature.key}
                                    style={{
                                        borderBottom: `1px solid ${colors.ink8}`,
                                    }}
                                >
                                    {/* Feature name — sticky on mobile */}
                                    <td
                                        style={{
                                            fontSize: 14,
                                            color: colors.foreground,
                                            padding: "12px 16px",
                                            position: "sticky",
                                            left: 0,
                                            background: colors.background,
                                            zIndex: 1,
                                        }}
                                    >
                                        {feature.label}
                                    </td>

                                    {/* Value cells */}
                                    {feature.values.map((value, i) => (
                                        <FeatureCell
                                            key={packages[i]?.id}
                                            value={value}
                                            isHighlighted={
                                                highlightedPackageId === packages[i]?.id
                                            }
                                        />
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
