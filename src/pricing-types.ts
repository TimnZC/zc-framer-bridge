// ============================================================================
// @zerocopter/nav-core - Pricing Data Types
// Types matching the structure of data/pricing/packages.json
// ============================================================================

export interface PricingFeatures {
    platform: {
        onboarding_setup: boolean;
        asset_map_scoping: boolean;
        continuous_recon: boolean;
        hacker_marketplace: boolean;
    };
    services: {
        cvd_ai_triage: boolean;
        bug_bounty_ai_triage: boolean;
        ai_pentest_reporting: boolean;
    };
    hacker_in_the_loop: {
        community_pentesting: number | null;
        community_peer_review: number | null;
        human_triage: number | null;
    };
    reporting: {
        standard: boolean;
        management_dashboards: boolean;
    };
}

export interface PricingPackage {
    id: string;
    name: string;
    monthly_price: number;
    included_credits_yearly: number;
    bug_bounty_handling_fee: string;
    /** Curated list of ~5 highlight lines shown on the pricing card */
    card_highlights: string[];
    features: PricingFeatures;
}

export interface PricingData {
    last_updated: string;
    currency: string;
    billing_cycle: string;
    packages: PricingPackage[];
}

/** Human-readable labels for each feature key */
export const FEATURE_LABELS: Record<string, string> = {
    onboarding_setup: "Onboarding & setup",
    asset_map_scoping: "Asset map & scoping",
    continuous_recon: "Continuous recon",
    hacker_marketplace: "Hacker marketplace",
    cvd_ai_triage: "CVD AI triage",
    bug_bounty_ai_triage: "Bug bounty AI triage",
    ai_pentest_reporting: "AI pentest reporting",
    community_pentesting: "Community pentesting",
    community_peer_review: "Community peer review",
    human_triage: "Human triage",
    standard: "Standard reports",
    management_dashboards: "Management dashboards",
};

/** Human-readable labels for each feature category */
export const CATEGORY_LABELS: Record<string, string> = {
    platform: "Platform",
    services: "Services",
    hacker_in_the_loop: "Hacker in the Loop",
    reporting: "Reporting",
};
