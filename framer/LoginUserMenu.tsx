// ============================================================================
// ZcTopNav — Framer Code Component (CDN version)
//
// Imports @zerocopter/nav-core from GitHub Pages CDN.
// When you update nav-core, rebuild dist and push to TimnZC/nav-core.
// GitHub Pages serves dist/cdn/index.js automatically.
//
// CDN URL: https://timnzc.github.io/nav-core/dist/cdn/index.js
// (GitHub Pages serves with correct application/javascript MIME type)
//
// HOW TO USE IN FRAMER:
// 1. In your Framer project, go to Assets → Code → New File
// 2. Paste this entire file
// 3. The component appears as "Zerocopter TopNav" in the component picker
// ============================================================================

// @ts-expect-error -- framer module only exists in Framer runtime environment
// eslint-disable-next-line import/no-unresolved
import { addPropertyControls, ControlType } from "framer";
// @ts-expect-error -- CDN import from nav-core GitHub Pages
import {
    useAuth,
    getUserInitials,
    getUserDisplayName,
    getColorPair,
    USER_MENU_ITEMS,
    ICON_SIZE,
    AVATAR_SIZE_DESKTOP_PX,
    DROPDOWN_OFFSET_PX,
} from "https://timnzc.github.io/zc-framer-bridge/dist/cdn/index.js?v=3";
import React, { useEffect, useRef, useState } from "react";

// ============================================================================
// Icons (inline SVGs — Framer can't serve SVG files)
// ============================================================================

interface IconProps {
    size?: number;
    color?: string;
}

const SparklesIcon = ({ size = 20, color = "currentColor" }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
);

const AccountIcon = ({ size = 20, color = "currentColor" }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CreditCardIcon = ({ size = 20, color = "currentColor" }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);

const NotificationsIcon = ({
    size = 20,
    color = "currentColor",
}: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

const SignOutIcon = ({ size = 20, color = "currentColor" }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

const ICON_MAP: Record<string, React.FC<IconProps>> = {
    sparkles: SparklesIcon,
    account: AccountIcon,
    "credit-card": CreditCardIcon,
    notifications: NotificationsIcon,
    "sign-out": SignOutIcon,
};

function renderIcon(iconId: string, size = 20, color = "currentColor") {
    const Icon = ICON_MAP[iconId];
    return Icon ? <Icon size={size} color={color} /> : null;
}

// ============================================================================
// Styles
// ============================================================================

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as React.CSSProperties,
    loadingSkeleton: (size: number): React.CSSProperties => ({
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: "#E2E8F0",
        animation: "zcNavPulse 1.5s ease-in-out infinite",
    }),
    loginButton: (
        bg: string,
        fg: string,
        fs: number,
        hover: boolean,
    ): React.CSSProperties => ({
        backgroundColor: hover ? `${bg}dd` : bg,
        color: fg,
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        fontSize: `${fs}px`,
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        outline: "none",
    }),
    avatar: (
        size: number,
        bg: string,
        textColor: string,
        fs: number,
    ): React.CSSProperties => ({
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: bg,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fs}px`,
        fontWeight: "600",
        cursor: "pointer",
        userSelect: "none",
    }),
    dropdown: (top: number): React.CSSProperties => ({
        position: "absolute",
        top: `${top}px`,
        right: "0",
        minWidth: "220px",
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        zIndex: 1000,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    }),
    dropdownHeader: {
        display: "flex",
        gap: "12px",
        padding: "10px 12px",
        borderBottom: "1px solid #E2E8F0",
        alignItems: "center",
    } as React.CSSProperties,
    menuItem: (hover: boolean): React.CSSProperties => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        backgroundColor: hover ? "#F1F5F9" : "transparent",
        transition: "background-color 0.15s ease",
        cursor: "pointer",
        border: "none",
        width: "100%",
        textAlign: "left",
        fontFamily: "inherit",
        textDecoration: "none",
        color: "#0F172A",
    }),
    separator: {
        height: "1px",
        backgroundColor: "#E2E8F0",
        margin: "4px 0",
    } as React.CSSProperties,
};

// ============================================================================
// Component
// ============================================================================

interface ZcTopNavProps {
    keycloakUrl?: string;
    keycloakRealm?: string;
    keycloakClientId?: string;
    appUrl?: string;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    avatarSize?: number;
    fontSize?: number;
}

function ZcTopNav(props: ZcTopNavProps) {
    const {
        keycloakUrl = "https://auth.dev.zrc.pt",
        keycloakRealm = "zc",
        keycloakClientId = "zcnxt-frontend",
        appUrl = "https://zcnxt-frontend-production.up.railway.app",
        buttonText = "Log in",
        buttonColor = "#0F172A",
        buttonTextColor = "#FFFFFF",
        avatarSize = AVATAR_SIZE_DESKTOP_PX,
        fontSize = 14,
    } = props;

    const auth = useAuth({
        keycloakUrl,
        keycloakRealm,
        keycloakClientId,
        checkLoginIframe: false,
        enableSilentSsoCheck: false,
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoginHovered, setIsLoginHovered] = useState(false);
    const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    const handleMenuAction = (action: string) => {
        setIsDropdownOpen(false);
        if (action === "signout") {
            void auth.logout();
            return;
        }
        const routes: Record<string, string> = {
            account: "/account",
            billing: "/billing",
            notifications: "/notifications",
            upgrade: "/upgrade",
        };
        if (routes[action]) {
            window.location.href = `${appUrl}${routes[action]}`;
        }
    };

    const displayName = getUserDisplayName(auth.user);
    const initials = auth.user ? getUserInitials(displayName) : "?";
    const colorPair = getColorPair(displayName);

    return (
        <>
            <style>
                {
                    "@keyframes zcNavPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }"
                }
            </style>
            <div style={styles.container}>
                {auth.isLoading && (
                    <div style={styles.loadingSkeleton(avatarSize)} />
                )}

                {!auth.isLoading && !auth.isAuthenticated && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                        }}>
                        <button
                            onClick={auth.login}
                            onMouseEnter={() => setIsLoginHovered(true)}
                            onMouseLeave={() => setIsLoginHovered(false)}
                            style={styles.loginButton(
                                buttonColor,
                                buttonTextColor,
                                fontSize,
                                isLoginHovered,
                            )}>
                            {buttonText}
                        </button>
                        {auth.error && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#DC2626",
                                    fontSize: "12px",
                                }}>
                                <div
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        backgroundColor: "#DC2626",
                                    }}
                                />
                                {auth.error}
                            </div>
                        )}
                    </div>
                )}

                {!auth.isLoading && auth.isAuthenticated && auth.user && (
                    <div ref={dropdownRef} style={{ position: "relative" }}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setIsDropdownOpen(!isDropdownOpen);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            style={styles.avatar(
                                avatarSize,
                                colorPair.bgValue,
                                colorPair.textValue,
                                fontSize,
                            )}
                            title={displayName}>
                            {initials}
                        </div>

                        {isDropdownOpen && (
                            <div
                                style={styles.dropdown(
                                    avatarSize + DROPDOWN_OFFSET_PX,
                                )}>
                                <div style={styles.dropdownHeader}>
                                    <div
                                        style={styles.avatar(
                                            36,
                                            colorPair.bgValue,
                                            colorPair.textValue,
                                            13,
                                        )}>
                                        {initials}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            minWidth: 0,
                                        }}>
                                        <div
                                            style={{
                                                fontSize: `${fontSize}px`,
                                                color: "#0F172A",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}>
                                            {displayName}
                                        </div>
                                        {auth.user.email && (
                                            <div
                                                style={{
                                                    fontSize: `${fontSize - 2}px`,
                                                    color: "#64748B",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}>
                                                {auth.user.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: "4px 0" }}>
                                    {USER_MENU_ITEMS.map((item: any) => (
                                        <React.Fragment key={item.action}>
                                            {item.separator && (
                                                <div style={styles.separator} />
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleMenuAction(
                                                        item.action,
                                                    )
                                                }
                                                onMouseEnter={() =>
                                                    setHoveredMenuItem(
                                                        item.action,
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredMenuItem(null)
                                                }
                                                style={{
                                                    ...styles.menuItem(
                                                        hoveredMenuItem ===
                                                            item.action,
                                                    ),
                                                    fontSize: `${fontSize}px`,
                                                }}>
                                                {renderIcon(
                                                    item.icon,
                                                    ICON_SIZE,
                                                    "#0F172A",
                                                )}
                                                {item.label}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

ZcTopNav.displayName = "Zerocopter TopNav";
export default ZcTopNav;

addPropertyControls(ZcTopNav, {
    keycloakUrl: {
        type: ControlType.String,
        title: "Keycloak URL",
        defaultValue: "https://auth.dev.zrc.pt",
    },
    keycloakRealm: {
        type: ControlType.String,
        title: "Keycloak Realm",
        defaultValue: "zc",
    },
    keycloakClientId: {
        type: ControlType.String,
        title: "Keycloak Client ID",
        defaultValue: "zcnxt-frontend",
    },
    appUrl: {
        type: ControlType.String,
        title: "App URL",
        defaultValue: "https://zcnxt-frontend-production.up.railway.app",
    },
    buttonText: {
        type: ControlType.String,
        title: "Button Text",
        defaultValue: "Log in",
    },
    buttonColor: {
        type: ControlType.Color,
        title: "Button Color",
        defaultValue: "#0F172A",
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text Color",
        defaultValue: "#FFFFFF",
    },
    avatarSize: {
        type: ControlType.Number,
        title: "Avatar Size",
        defaultValue: 40,
        min: 24,
        max: 64,
        step: 1,
        unit: "px",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 14,
        min: 10,
        max: 20,
        step: 1,
        unit: "px",
    },
});
