import Keycloak from 'keycloak-js';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';

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
  const configKey = useMemo(() => JSON.stringify(keycloakConfig), [keycloakConfig]);
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
        console.error("[nav-core] Keycloak initialization failed:", error);
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
  }, [configKey, keycloakConfig, onLoad, enableSilentSsoCheck, checkLoginIframe]);
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
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

export { AVATAR_SIZE_DESKTOP_PX, AVATAR_SIZE_MOBILE_PX, DROPDOWN_OFFSET_PX, ICON_SIZE, NAV_HEIGHT_PX, TOKEN_REFRESH_MIN_VALIDITY, TOKEN_UPDATE_MIN_VALIDITY, USER_MENU_ITEMS, getAvatarColor, getCompanyTypeLabel, getFirstInitial, getUserDisplayName, getUserInitials, useAuth };
