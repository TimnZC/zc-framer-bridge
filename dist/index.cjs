'use strict';

var Keycloak = require('keycloak-js');
var React = require('react');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Keycloak__default = /*#__PURE__*/_interopDefault(Keycloak);
var React__default = /*#__PURE__*/_interopDefault(React);

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
  const keycloakConfig = React.useMemo(
    () => ({
      url: keycloakUrl,
      realm: keycloakRealm,
      clientId: keycloakClientId
    }),
    [keycloakUrl, keycloakRealm, keycloakClientId]
  );
  const configKey = React.useMemo(
    () => JSON.stringify(keycloakConfig),
    [keycloakConfig]
  );
  const [authState, setAuthState] = React.useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  const keycloakRef = React.useRef(null);
  React.useEffect(() => {
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
          const newInstance = new Keycloak__default.default(keycloakConfig);
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
  const login = React.useCallback(() => {
    const keycloak = keycloakRef.current;
    if (!keycloak) return;
    void keycloak.login({
      redirectUri: loginRedirectUri ?? window.location.href,
      scope: "openid"
    });
  }, [loginRedirectUri]);
  const logout = React.useCallback(async () => {
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
  const getToken = React.useCallback(async () => {
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
  const clearError = React.useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);
  return React.useMemo(
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
var CheckIcon = ({ size = 16 }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: colors.suc100,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
    children: /* @__PURE__ */ jsxRuntime.jsx("polyline", { points: "20 6 9 17 4 12" })
  }
);
function formatPrice(amount, currency) {
  return new Intl.NumberFormat("en-EU", {
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
  onSelect,
  style
}) {
  const features = featureSummary ?? Object.entries(pkg.features).flatMap(
    ([, category]) => Object.entries(category).filter(([, v]) => v === true || typeof v === "number" && v > 0).map(
      ([k]) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "24px 0",
        background: colors.card,
        borderRadius: radii.lg,
        border: highlighted ? `2px solid ${colors.sec100}` : `1px solid ${colors.baseBorder}`,
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        fontFamily: fonts.sans,
        ...style
      },
      children: [
        badge !== void 0 && badge.length > 0 && highlighted && /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { style: { padding: "0 24px" }, children: /* @__PURE__ */ jsxRuntime.jsx(
          "h3",
          {
            style: {
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1,
              color: colors.foreground
            },
            children: pkg.name
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }, children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                style: {
                  fontSize: 36,
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  color: colors.foreground
                },
                children: formatPrice(pkg.monthly_price, currency)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                style: {
                  fontSize: 14,
                  fontWeight: 400,
                  color: colors.mutedForeground
                },
                children: "/month"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "p",
            {
              style: {
                margin: 0,
                fontSize: 14,
                color: colors.mutedForeground,
                lineHeight: 1.5
              },
              children: [
                formatPrice(pkg.included_credits_yearly, currency),
                " credits/year \xA0\xB7\xA0",
                pkg.bug_bounty_handling_fee,
                " handling fee"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { style: { padding: "0 24px" }, children: /* @__PURE__ */ jsxRuntime.jsx("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }, children: features.map((feature) => /* @__PURE__ */ jsxRuntime.jsxs(
          "li",
          {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: 8
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { style: { marginTop: 2 }, children: /* @__PURE__ */ jsxRuntime.jsx(CheckIcon, {}) }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "span",
                {
                  style: {
                    fontSize: 14,
                    color: colors.foreground,
                    lineHeight: 1.4
                  },
                  children: feature
                }
              )
            ]
          },
          feature
        )) }) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { style: { padding: "0 24px" }, children: /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: onSelect,
            style: {
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
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            },
            children: "Get started"
          }
        ) })
      ]
    }
  );
}
var CheckIcon2 = () => /* @__PURE__ */ jsxRuntime.jsx(
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
    children: /* @__PURE__ */ jsxRuntime.jsx("polyline", { points: "20 6 9 17 4 12" })
  }
);
var MinusIcon = () => /* @__PURE__ */ jsxRuntime.jsx(
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
    children: /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
  }
);
var CreditsBadge = ({ value }) => /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "td",
    {
      style: {
        padding: "12px 16px",
        textAlign: "center",
        background: isHighlighted ? colors.sec4 : "transparent"
      },
      children: [
        value === true && /* @__PURE__ */ jsxRuntime.jsx(CheckIcon2, {}),
        value === null && /* @__PURE__ */ jsxRuntime.jsx(MinusIcon, {}),
        typeof value === "number" && /* @__PURE__ */ jsxRuntime.jsx(CreditsBadge, { value })
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      style: {
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        fontFamily: fonts.sans,
        ...style
      },
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse"
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(
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
              packages.map((pkg) => /* @__PURE__ */ jsxRuntime.jsx(
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
            /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: categories.map((cat) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx(
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
              cat.features.map((feature) => /* @__PURE__ */ jsxRuntime.jsxs(
                "tr",
                {
                  style: {
                    borderBottom: `1px solid ${colors.ink8}`
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
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
                    feature.values.map((value, i) => /* @__PURE__ */ jsxRuntime.jsx(
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

exports.AVATAR_COLOR_PAIRS = AVATAR_COLOR_PAIRS;
exports.AVATAR_SIZE_DESKTOP_PX = AVATAR_SIZE_DESKTOP_PX;
exports.AVATAR_SIZE_MOBILE_PX = AVATAR_SIZE_MOBILE_PX;
exports.CATEGORY_LABELS = CATEGORY_LABELS;
exports.COMPANY_COLOR_PAIRS = COMPANY_COLOR_PAIRS;
exports.DROPDOWN_OFFSET_PX = DROPDOWN_OFFSET_PX;
exports.FEATURE_LABELS = FEATURE_LABELS;
exports.FramerFeatureComparisonTable = FramerFeatureComparisonTable;
exports.FramerPricingCard = FramerPricingCard;
exports.ICON_SIZE = ICON_SIZE;
exports.NAV_HEIGHT_PX = NAV_HEIGHT_PX;
exports.TOKEN_REFRESH_MIN_VALIDITY = TOKEN_REFRESH_MIN_VALIDITY;
exports.TOKEN_UPDATE_MIN_VALIDITY = TOKEN_UPDATE_MIN_VALIDITY;
exports.USER_MENU_ITEMS = USER_MENU_ITEMS;
exports.colors = colors;
exports.fonts = fonts;
exports.getAvatarColor = getAvatarColor;
exports.getColorPair = getColorPair;
exports.getCompanyTypeLabel = getCompanyTypeLabel;
exports.getFirstInitial = getFirstInitial;
exports.getUserDisplayName = getUserDisplayName;
exports.getUserInitials = getUserInitials;
exports.radii = radii;
exports.useAuth = useAuth;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map