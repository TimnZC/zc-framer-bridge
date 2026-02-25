import Keycloak from 'keycloak-js';
import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/hooks/use-auth.ts

// src/constants.ts
var TOKEN_REFRESH_MIN_VALIDITY = 30;
var TOKEN_UPDATE_MIN_VALIDITY = 300;
var NAV_HEIGHT_PX = 56;
var ICON_SIZE = 20;
var AVATAR_SIZE_MOBILE_PX = 32;
var AVATAR_SIZE_DESKTOP_PX = 40;
var DROPDOWN_OFFSET_PX = 8;
var USER_MENU_ITEMS = [
  {
    icon: "sparkles",
    label: "Update plan",
    action: "upgrade"
  },
  {
    icon: "account",
    label: "Account settings",
    action: "account"
  },
  {
    icon: "credit-card",
    label: "Billing",
    action: "billing"
  },
  {
    icon: "notifications",
    label: "Notifications",
    action: "notifications"
  },
  {
    icon: "sign-out",
    label: "Sign out",
    action: "signout",
    separator: true
  }
];

// src/hooks/use-auth.ts
function extractUserInfo(keycloak) {
  return {
    sub: keycloak.tokenParsed?.sub,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    preferred_username: keycloak.tokenParsed?.preferred_username,
    given_name: keycloak.tokenParsed?.given_name,
    family_name: keycloak.tokenParsed?.family_name,
    email_verified: keycloak.tokenParsed?.email_verified
  };
}
var keycloakCache = /* @__PURE__ */ new Map();
function useAuth(options) {
  const {
    keycloakUrl,
    keycloakRealm,
    keycloakClientId,
    loginRedirectUri,
    logoutRedirectUri,
    onKeycloakReady,
    onLoad = "check-sso",
    enableSilentSsoCheck = false,
    checkLoginIframe = false
  } = options;
  const keycloakConfig = useMemo(
    () => ({
      url: keycloakUrl,
      realm: keycloakRealm,
      clientId: keycloakClientId
    }),
    [keycloakUrl, keycloakRealm, keycloakClientId]
  );
  const configKey = useMemo(
    () => JSON.stringify(keycloakConfig),
    [keycloakConfig]
  );
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  const keycloakRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        let cached = keycloakCache.get(configKey);
        if (cached?.instance.authenticated !== void 0) {
          keycloakRef.current = cached.instance;
          onKeycloakReady?.(cached.instance);
          if (cached.instance.authenticated && cached.instance.tokenParsed) {
            const userInfo = extractUserInfo(cached.instance);
            if (!cancelled) {
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: userInfo,
                error: null
              });
            }
          } else if (!cancelled) {
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: null
            });
          }
          return;
        }
        if (cached === void 0) {
          const newInstance = new Keycloak(keycloakConfig);
          cached = {
            instance: newInstance,
            initPromise: null
          };
          keycloakCache.set(configKey, cached);
        }
        const keycloak = cached.instance;
        keycloakRef.current = keycloak;
        onKeycloakReady?.(keycloak);
        if (cached.initPromise === null) {
          const initOptions = {
            onLoad,
            checkLoginIframe,
            pkceMethod: "S256",
            responseMode: "fragment",
            scope: "openid"
          };
          if (enableSilentSsoCheck && typeof window !== "undefined") {
            initOptions.silentCheckSsoRedirectUri = `${window.location.origin}/silent-check-sso.html`;
          }
          cached.initPromise = keycloak.init(initOptions);
        }
        const authenticated = await cached.initPromise;
        if (cancelled) return;
        if (authenticated && keycloak.tokenParsed) {
          const userInfo = extractUserInfo(keycloak);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userInfo,
            error: null
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
        }
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(TOKEN_REFRESH_MIN_VALIDITY).then((refreshed) => {
            if (refreshed && keycloak.tokenParsed && !cancelled) {
              const userInfo = extractUserInfo(keycloak);
              setAuthState((prev) => ({
                ...prev,
                user: userInfo,
                isAuthenticated: true
              }));
            }
            return refreshed;
          }).catch(() => {
            if (!cancelled) {
              setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: "Session expired. Please log in again."
              });
            }
          });
        };
      } catch (error) {
        console.error(
          "[nav-core] Keycloak initialization failed:",
          error
        );
        if (!cancelled) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: "Unable to check login status"
          });
        }
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [
    configKey,
    keycloakConfig,
    onLoad,
    enableSilentSsoCheck,
    checkLoginIframe
  ]);
  const login = useCallback(() => {
    const keycloak = keycloakRef.current;
    if (!keycloak) return;
    void keycloak.login({
      redirectUri: loginRedirectUri ?? window.location.href,
      scope: "openid"
    });
  }, [loginRedirectUri]);
  const logout = useCallback(async () => {
    const keycloak = keycloakRef.current;
    if (!keycloak) return;
    const idToken = keycloak.idToken ?? null;
    const refreshToken = keycloak.refreshToken ?? null;
    const redirectUri = logoutRedirectUri ?? window.location.origin;
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
    if (refreshToken !== null && refreshToken !== "") {
      const revokeUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/revoke`;
      try {
        await fetch(revokeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: keycloakConfig.clientId,
            token: refreshToken,
            token_type_hint: "refresh_token"
          }).toString()
        });
      } catch (error) {
        console.warn("[nav-core] Token revocation failed:", error);
      }
    }
    try {
      const keycloakPrefix = `kc-callback-${keycloakConfig.clientId}`;
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(keycloakPrefix) || key.startsWith("kc-")) {
          localStorage.removeItem(key);
        }
      }
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith(keycloakPrefix) || key.startsWith("kc-")) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("[nav-core] Failed to clear storage:", error);
    }
    const params = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      post_logout_redirect_uri: redirectUri
    });
    if (idToken !== null && idToken !== "") {
      params.append("id_token_hint", idToken);
    }
    const logoutUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?${params.toString()}`;
    window.location.href = logoutUrl;
  }, [keycloakConfig, logoutRedirectUri]);
  const getToken = useCallback(async () => {
    const keycloak = keycloakRef.current;
    if (keycloak?.authenticated !== true) return void 0;
    try {
      await keycloak.updateToken(TOKEN_UPDATE_MIN_VALIDITY);
      return keycloak.token;
    } catch (error) {
      console.error("[nav-core] Token refresh failed:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: "Session expired. Please login again."
      });
      return void 0;
    }
  }, []);
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);
  return useMemo(
    () => ({
      ...authState,
      login,
      logout,
      getToken,
      clearError
    }),
    [authState, login, logout, getToken, clearError]
  );
}

// src/utils/text.ts
var getUserInitials = (name) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};
var getFirstInitial = (name) => {
  if (!name || name.trim().length === 0) {
    return "";
  }
  return name.trim()[0].toUpperCase();
};
function getUserDisplayName(user) {
  if (user === null || user === void 0) {
    return "Unknown";
  }
  if (user.name !== null && user.name !== void 0 && user.name !== "") {
    return user.name;
  }
  if (user.given_name !== null && user.given_name !== void 0 && user.family_name !== null && user.family_name !== void 0) {
    return `${user.given_name} ${user.family_name}`;
  }
  if (user.preferred_username !== null && user.preferred_username !== void 0 && user.preferred_username !== "") {
    return user.preferred_username;
  }
  if (user.email !== null && user.email !== void 0 && user.email !== "") {
    return user.email;
  }
  return "Unknown";
}
var getAvatarColor = (name) => {
  const HASH_SHIFT = 5;
  const HUE_MAX = 360;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << HASH_SHIFT) - hash);
  }
  const hue = Math.abs(hash) % HUE_MAX;
  return `hsl(${hue}, 65%, 50%)`;
};
var getCompanyTypeLabel = (type) => {
  return type === "team" ? "Team Account" : "Company Account";
};

// src/utils/color.ts
var BIT_SHIFT_AMOUNT = 5;
var AVATAR_COLOR_PAIRS = [
  {
    bg: "bg-pri-8",
    text: "text-pri-80",
    bgValue: "oklch(0.9636 0.0176 253.34)",
    textValue: "oklch(0.658 0.1823 256.59)"
  },
  {
    bg: "bg-sec-8",
    text: "text-sec-80",
    bgValue: "oklch(0.9591 0.0147 290.31)",
    textValue: "oklch(0.5913 0.1585 284.25)"
  },
  {
    bg: "bg-ter-8",
    text: "text-ter-80",
    bgValue: "oklch(0.9703 0.0167 343.61)",
    textValue: "oklch(0.7279 0.1872 349.22)"
  },
  {
    bg: "bg-suc-8",
    text: "text-suc-80",
    bgValue: "oklch(0.977 0.0158 196.9)",
    textValue: "oklch(0.7929 0.1183 194.35)"
  },
  {
    bg: "bg-war-8",
    text: "text-war-80",
    bgValue: "oklch(0.9796 0.0119 67.69)",
    textValue: "oklch(0.8019 0.1167 62.39)"
  },
  {
    bg: "bg-dan-8",
    text: "text-dan-80",
    bgValue: "oklch(0.9656 0.0177 4.51)",
    textValue: "oklch(0.6996 0.197366 10.4046)"
  }
];
var COMPANY_COLOR_PAIRS = [
  {
    bg: "bg-pri-80",
    text: "text-pri-8",
    bgValue: "oklch(0.658 0.1823 256.59)",
    textValue: "oklch(0.9636 0.0176 253.34)"
  },
  {
    bg: "bg-sec-80",
    text: "text-sec-8",
    bgValue: "oklch(0.5913 0.1585 284.25)",
    textValue: "oklch(0.9591 0.0147 290.31)"
  },
  {
    bg: "bg-ter-80",
    text: "text-ter-8",
    bgValue: "oklch(0.7279 0.1872 349.22)",
    textValue: "oklch(0.9703 0.0167 343.61)"
  },
  {
    bg: "bg-suc-80",
    text: "text-suc-8",
    bgValue: "oklch(0.7929 0.1183 194.35)",
    textValue: "oklch(0.977 0.0158 196.9)"
  },
  {
    bg: "bg-war-80",
    text: "text-war-8",
    bgValue: "oklch(0.8019 0.1167 62.39)",
    textValue: "oklch(0.9796 0.0119 67.69)"
  },
  {
    bg: "bg-dan-80",
    text: "text-dan-8",
    bgValue: "oklch(0.6996 0.197366 10.4046)",
    textValue: "oklch(0.9656 0.0177 4.51)"
  }
];
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << BIT_SHIFT_AMOUNT) - hash);
  }
  return hash;
}
function getColorPair(str, colorPairs = AVATAR_COLOR_PAIRS) {
  const defaultPair = colorPairs[0] ?? {
    bg: "bg-pri-8",
    text: "text-pri-80",
    bgValue: "oklch(0.9636 0.0176 253.34)",
    textValue: "oklch(0.658 0.1823 256.59)"
  };
  if (str === null || str === void 0 || str === "") {
    return defaultPair;
  }
  const index = Math.abs(hashString(str)) % colorPairs.length;
  return colorPairs[index] ?? defaultPair;
}

// src/tokens.ts
var colors = {
  // Base (from Figma design tokens)
  foreground: "#2f3242",
  foregroundSubtle: "#454858",
  background: "oklch(0.9731 0 0)",
  card: "#ffffff",
  cardForeground: "oklch(0.145 0 0)",
  mutedForeground: "oklch(0.556 0 0)",
  mutedForegroundWeak: "#9093a1",
  baseBorder: "#e0e0e0",
  zeroBrand: "#8b7cf6",
  // Semantic
  sec100: "#5347cd",
  sec4: "oklch(0.9805 0.0066 286.28)",
  suc100: "oklch(0.7549 0.1264 194.16)",
  ink4: "oklch(0.9642 0 0)",
  ink8: "oklch(0.9401 0 0)",
  ink24: "oklch(0.8141 0 0)",
  ink40: "oklch(0.683 0 0)",
  ink64: "oklch(0.4748 0 0)"
};
var fonts = {
  sans: "'DM Sans', system-ui, -apple-system, sans-serif"
};
var radii = {
  sm: "4px",
  md: "8px",
  lg: "10px",
  full: "9999px"
};

// src/pricing-types.ts
var FEATURE_LABELS = {
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
  management_dashboards: "Management dashboards"
};
var CATEGORY_LABELS = {
  platform: "Platform",
  services: "Services",
  hacker_in_the_loop: "Hacker in the Loop",
  reporting: "Reporting"
};
var PlanIcon = () => /* @__PURE__ */ jsx(
  "div",
  {
    style: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      background: colors.zeroBrand,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },
    children: /* @__PURE__ */ jsx(
      "svg",
      {
        width: 16,
        height: 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#ffffff",
        strokeWidth: 1.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ jsx("path", { d: "M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" })
      }
    )
  }
);
var CheckIcon = ({ size = 20 }) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: colors.zeroBrand,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
    children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" })
  }
);
function formatPriceEU(amount, currency) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
function FramerPricingCard({
  pkg,
  currency,
  highlighted = false,
  badge,
  featureSummary,
  description,
  ctaLabel = "Select",
  onSelect,
  style
}) {
  const features = featureSummary ?? pkg.card_highlights;
  const descriptionText = description ?? `The ${pkg.name.toLowerCase()} plan includes:`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
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
        boxShadow: highlighted ? `0 0 0 2px ${colors.sec100}, 0 0 10px 0 rgba(0,0,0,0.1)` : "0 0 10px 0 rgba(0,0,0,0.1)",
        fontFamily: fonts.sans,
        ...style
      },
      children: [
        badge !== void 0 && badge.length > 0 && highlighted && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
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
              whiteSpace: "nowrap"
            },
            children: badge
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
              alignSelf: "stretch"
            },
            children: [
              /* @__PURE__ */ jsx(PlanIcon, {}),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-start"
                  },
                  children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                          color: colors.foreground
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              style: {
                                fontSize: 32,
                                fontWeight: 500,
                                lineHeight: "32px",
                                letterSpacing: "-0.96px"
                              },
                              children: pkg.name
                            }
                          ),
                          /* @__PURE__ */ jsxs(
                            "span",
                            {
                              style: {
                                fontSize: 16,
                                fontWeight: 400,
                                lineHeight: "24px",
                                letterSpacing: "-0.48px"
                              },
                              children: [
                                formatPriceEU(pkg.monthly_price, currency),
                                " ",
                                /* @__PURE__ */ jsx("span", { style: { color: colors.mutedForegroundWeak }, children: "per month" })
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          width: "100%",
                          height: 0,
                          borderBottom: `1px solid ${colors.baseBorder}`
                        }
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { style: { alignSelf: "stretch" }, children: /* @__PURE__ */ jsx(
          "p",
          {
            style: {
              margin: 0,
              fontSize: 12,
              fontWeight: 400,
              lineHeight: "20px",
              letterSpacing: "-0.36px",
              color: colors.mutedForegroundWeak
            },
            children: descriptionText
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 20,
              alignItems: "flex-start",
              justifyContent: "center",
              alignSelf: "stretch"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-start"
                  },
                  children: features.map((feature) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      },
                      children: [
                        /* @__PURE__ */ jsx(CheckIcon, {}),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              fontSize: 14,
                              fontWeight: 400,
                              lineHeight: "22px",
                              letterSpacing: "-0.42px",
                              color: colors.foreground
                            },
                            children: feature
                          }
                        )
                      ]
                    },
                    feature
                  ))
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: onSelect,
                  style: {
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
                    flexShrink: 0
                  },
                  children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: 16,
                        fontWeight: 500,
                        lineHeight: "16px",
                        letterSpacing: "-0.48px",
                        color: "#ffffff",
                        opacity: 0.9,
                        whiteSpace: "nowrap",
                        fontFamily: fonts.sans
                      },
                      children: ctaLabel
                    }
                  )
                }
              )
            ]
          }
        )
      ]
    }
  );
}
var CheckIcon2 = () => /* @__PURE__ */ jsx(
  "svg",
  {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: colors.suc100,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: "block", margin: "0 auto" },
    children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" })
  }
);
var MinusIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: colors.ink24,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: "block", margin: "0 auto" },
    children: /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
  }
);
var CreditsBadge = ({ value }) => /* @__PURE__ */ jsx(
  "span",
  {
    style: {
      display: "inline-block",
      fontSize: 12,
      fontWeight: 500,
      color: colors.sec100,
      textAlign: "center"
    },
    children: value.toLocaleString("en")
  }
);
function FeatureCell({
  value,
  isHighlighted
}) {
  return /* @__PURE__ */ jsxs(
    "td",
    {
      style: {
        padding: "12px 16px",
        textAlign: "center",
        background: isHighlighted ? colors.sec4 : "transparent"
      },
      children: [
        value === true && /* @__PURE__ */ jsx(CheckIcon2, {}),
        value === null && /* @__PURE__ */ jsx(MinusIcon, {}),
        typeof value === "number" && /* @__PURE__ */ jsx(CreditsBadge, { value })
      ]
    }
  );
}
function buildCategoryRows(packages) {
  const first = packages[0];
  if (!first) return [];
  const categoryKeys = Object.keys(first.features);
  return categoryKeys.map((catKey) => {
    const featureKeys = Object.keys(first.features[catKey]);
    return {
      category: CATEGORY_LABELS[catKey] ?? catKey,
      features: featureKeys.map((fKey) => ({
        key: fKey,
        label: FEATURE_LABELS[fKey] ?? fKey.replace(/_/g, " "),
        values: packages.map((pkg) => {
          const catObj = pkg.features[catKey];
          return catObj[fKey] ?? null;
        })
      }))
    };
  });
}
function FramerFeatureComparisonTable({
  packages,
  highlightedPackageId,
  style
}) {
  const categories = buildCategoryRows(packages);
  const totalColumns = packages.length + 1;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        fontFamily: fonts.sans,
        ...style
      },
      children: /* @__PURE__ */ jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse"
          },
          children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx(
                "th",
                {
                  style: {
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.foreground,
                    padding: "12px 16px",
                    textAlign: "left"
                  }
                }
              ),
              packages.map((pkg) => /* @__PURE__ */ jsx(
                "th",
                {
                  style: {
                    fontSize: 14,
                    fontWeight: 600,
                    color: highlightedPackageId === pkg.id ? colors.sec100 : colors.foreground,
                    textAlign: "center",
                    padding: "12px 16px",
                    minWidth: 120
                  },
                  children: pkg.name
                },
                pkg.id
              ))
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: categories.map((cat) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                "td",
                {
                  colSpan: totalColumns,
                  style: {
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: colors.ink64,
                    background: colors.ink4,
                    padding: "8px 16px"
                  },
                  children: cat.category
                }
              ) }),
              cat.features.map((feature) => /* @__PURE__ */ jsxs(
                "tr",
                {
                  style: {
                    borderBottom: `1px solid ${colors.ink8}`
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "td",
                      {
                        style: {
                          fontSize: 14,
                          color: colors.foreground,
                          padding: "12px 16px",
                          position: "sticky",
                          left: 0,
                          background: colors.background,
                          zIndex: 1
                        },
                        children: feature.label
                      }
                    ),
                    feature.values.map((value, i) => /* @__PURE__ */ jsx(
                      FeatureCell,
                      {
                        value,
                        isHighlighted: highlightedPackageId === packages[i]?.id
                      },
                      packages[i]?.id
                    ))
                  ]
                },
                feature.key
              ))
            ] }, cat.category)) })
          ]
        }
      )
    }
  );
}

export { AVATAR_COLOR_PAIRS, AVATAR_SIZE_DESKTOP_PX, AVATAR_SIZE_MOBILE_PX, CATEGORY_LABELS, COMPANY_COLOR_PAIRS, DROPDOWN_OFFSET_PX, FEATURE_LABELS, FramerFeatureComparisonTable, FramerPricingCard, ICON_SIZE, NAV_HEIGHT_PX, TOKEN_REFRESH_MIN_VALIDITY, TOKEN_UPDATE_MIN_VALIDITY, USER_MENU_ITEMS, colors, fonts, getAvatarColor, getColorPair, getCompanyTypeLabel, getFirstInitial, getUserDisplayName, getUserInitials, radii, useAuth };
