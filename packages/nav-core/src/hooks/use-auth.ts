// ============================================================================
// @zerocopter/nav-core - useAuth Hook
// Platform-agnostic Keycloak authentication hook.
// Works in both Next.js (via AuthProvider) and Framer (standalone).
// ============================================================================

import Keycloak from "keycloak-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    TOKEN_REFRESH_MIN_VALIDITY,
    TOKEN_UPDATE_MIN_VALIDITY,
} from "../constants";
import type {
    AuthContext,
    AuthState,
    KeycloakConfig,
    UseAuthOptions,
    UserInfo,
} from "../types";

// --- Internal helpers ---

/** Extract UserInfo from Keycloak token payload */
function extractUserInfo(keycloak: Keycloak): UserInfo {
    return {
        sub: keycloak.tokenParsed?.sub,
        email: keycloak.tokenParsed?.email as string | undefined,
        name: keycloak.tokenParsed?.name as string | undefined,
        preferred_username: keycloak.tokenParsed?.preferred_username as
            | string
            | undefined,
        given_name: keycloak.tokenParsed?.given_name as string | undefined,
        family_name: keycloak.tokenParsed?.family_name as string | undefined,
        email_verified: keycloak.tokenParsed?.email_verified as
            | boolean
            | undefined,
    };
}

/**
 * Keycloak instance cache — survives React re-mounts (Framer editor, StrictMode).
 * Key: JSON-stringified config. Value: Keycloak instance + init promise.
 */
const keycloakCache = new Map<
    string,
    {
        instance: Keycloak;
        initPromise: Promise<boolean> | null;
    }
>();

// ============================================================================
// useAuth — the shared hook
// ============================================================================

/**
 * Platform-agnostic Keycloak authentication hook.
 *
 * **Next.js usage:**
 * Wrap in an AuthProvider that calls `useAuth()` once and distributes
 * the result via React Context. This ensures a single Keycloak instance.
 *
 * **Framer usage:**
 * Call directly inside a Framer code component. The hook manages its own
 * Keycloak lifecycle with an internal instance cache.
 *
 * @example
 * ```tsx
 * const auth = useAuth({
 *   keycloakUrl: 'https://auth.dev.zrc.pt',
 *   keycloakRealm: 'zc',
 *   keycloakClientId: 'zcnxt-frontend',
 * });
 *
 * if (auth.isLoading) return <Spinner />;
 * if (!auth.isAuthenticated) return <button onClick={auth.login}>Log in</button>;
 * return <p>Hello, {auth.user?.name}</p>;
 * ```
 */
export function useAuth(options: UseAuthOptions): AuthContext {
    const {
        keycloakUrl,
        keycloakRealm,
        keycloakClientId,
        loginRedirectUri,
        logoutRedirectUri,
        onKeycloakReady,
        onLoad = "check-sso",
        enableSilentSsoCheck = false,
        checkLoginIframe = false,
    } = options;

    // Memoize the Keycloak config to keep the effect dependency stable
    const keycloakConfig: KeycloakConfig = useMemo(
        () => ({
            url: keycloakUrl,
            realm: keycloakRealm,
            clientId: keycloakClientId,
        }),
        [keycloakUrl, keycloakRealm, keycloakClientId]
    );

    const configKey = useMemo(
        () => JSON.stringify(keycloakConfig),
        [keycloakConfig]
    );

    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null,
    });

    const keycloakRef = useRef<Keycloak | null>(null);

    // ---- Initialize Keycloak ----
    useEffect(() => {
        let cancelled = false;

        const init = async (): Promise<void> => {
            try {
                // Get or create cached instance
                let cached = keycloakCache.get(configKey);

                // If already initialized, reuse
                if (cached?.instance.authenticated !== undefined) {
                    keycloakRef.current = cached.instance;
                    onKeycloakReady?.(cached.instance);

                    if (
                        cached.instance.authenticated &&
                        cached.instance.tokenParsed
                    ) {
                        const userInfo = extractUserInfo(cached.instance);
                        if (!cancelled) {
                            setAuthState({
                                isAuthenticated: true,
                                isLoading: false,
                                user: userInfo,
                                error: null,
                            });
                        }
                    } else if (!cancelled) {
                        setAuthState({
                            isAuthenticated: false,
                            isLoading: false,
                            user: null,
                            error: null,
                        });
                    }
                    return;
                }

                // Create new instance if needed
                if (cached === undefined) {
                    const newInstance = new Keycloak(keycloakConfig);
                    cached = {
                        instance: newInstance,
                        initPromise: null,
                    };
                    keycloakCache.set(configKey, cached);
                }

                const keycloak = cached.instance;
                keycloakRef.current = keycloak;
                onKeycloakReady?.(keycloak);

                // Deduplicate concurrent init calls (React StrictMode, Framer re-renders)
                if (cached.initPromise === null) {
                    const initOptions: Keycloak.KeycloakInitOptions = {
                        onLoad,
                        checkLoginIframe,
                        pkceMethod: "S256",
                        responseMode: "fragment",
                        scope: "openid",
                    };

                    // Add silent SSO check if enabled (Next.js with proper hosting)
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
                        error: null,
                    });
                } else {
                    setAuthState({
                        isAuthenticated: false,
                        isLoading: false,
                        user: null,
                        error: null,
                    });
                }

                // Token refresh callback
                keycloak.onTokenExpired = () => {
                    keycloak
                        .updateToken(TOKEN_REFRESH_MIN_VALIDITY)
                        .then((refreshed: boolean) => {
                            if (
                                refreshed &&
                                keycloak.tokenParsed &&
                                !cancelled
                            ) {
                                const userInfo = extractUserInfo(keycloak);
                                setAuthState((prev: AuthState) => ({
                                    ...prev,
                                    user: userInfo,
                                    isAuthenticated: true,
                                }));
                            }
                            return refreshed;
                        })
                        .catch((): void => {
                            if (!cancelled) {
                                setAuthState({
                                    isAuthenticated: false,
                                    isLoading: false,
                                    user: null,
                                    error: "Session expired. Please log in again.",
                                });
                            }
                        });
                };
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(
                    "[nav-core] Keycloak initialization failed:",
                    error
                );
                if (!cancelled) {
                    setAuthState({
                        isAuthenticated: false,
                        isLoading: false,
                        user: null,
                        error: "Unable to check login status",
                    });
                }
            }
        };

        void init();

        return () => {
            cancelled = true;
        };
        // onKeycloakReady intentionally excluded — it's a callback, not a dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        configKey,
        keycloakConfig,
        onLoad,
        enableSilentSsoCheck,
        checkLoginIframe,
    ]);

    // ---- Actions ----

    const login = useCallback((): void => {
        const keycloak = keycloakRef.current;
        if (!keycloak) return;

        void keycloak.login({
            redirectUri: loginRedirectUri ?? window.location.href,
            scope: "openid",
        });
    }, [loginRedirectUri]);

    const logout = useCallback(async (): Promise<void> => {
        const keycloak = keycloakRef.current;
        if (!keycloak) return;

        // Capture tokens BEFORE clearing state
        const idToken = keycloak.idToken ?? null;
        const refreshToken = keycloak.refreshToken ?? null;
        const redirectUri = logoutRedirectUri ?? window.location.origin;

        // Clear local state immediately
        setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null,
        });

        // Revoke refresh token server-side
        if (refreshToken !== null && refreshToken !== "") {
            const revokeUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/revoke`;
            try {
                await fetch(revokeUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        client_id: keycloakConfig.clientId,
                        token: refreshToken,
                        token_type_hint: "refresh_token",
                    }).toString(),
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn("[nav-core] Token revocation failed:", error);
            }
        }

        // Clear Keycloak-related storage
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
            // eslint-disable-next-line no-console
            console.warn("[nav-core] Failed to clear storage:", error);
        }

        // Build logout URL with id_token_hint (required by Keycloak 18+)
        const params = new URLSearchParams({
            client_id: keycloakConfig.clientId,
            post_logout_redirect_uri: redirectUri,
        });

        if (idToken !== null && idToken !== "") {
            params.append("id_token_hint", idToken);
        }

        const logoutUrl = `${keycloakConfig.url}/realms/${
            keycloakConfig.realm
        }/protocol/openid-connect/logout?${params.toString()}`;
        window.location.href = logoutUrl;
    }, [keycloakConfig, logoutRedirectUri]);

    const getToken = useCallback(async (): Promise<string | undefined> => {
        const keycloak = keycloakRef.current;
        if (keycloak?.authenticated !== true) return undefined;

        try {
            await keycloak.updateToken(TOKEN_UPDATE_MIN_VALIDITY);
            return keycloak.token;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("[nav-core] Token refresh failed:", error);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: "Session expired. Please login again.",
            });
            return undefined;
        }
    }, []);

    const clearError = useCallback((): void => {
        setAuthState((prev: AuthState) => ({ ...prev, error: null }));
    }, []);

    // ---- Return memoized context ----
    return useMemo(
        () => ({
            ...authState,
            login,
            logout,
            getToken,
            clearError,
        }),
        [authState, login, logout, getToken, clearError]
    );
}
