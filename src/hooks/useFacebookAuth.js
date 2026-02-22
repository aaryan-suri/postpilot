import { useState, useEffect, useRef, useCallback } from "react";

// Token storage: MVP uses localStorage. Migrate to httpOnly cookies or server-side storage for production.
const STORAGE_META_ACCESS = "pp_meta_access_token";
const STORAGE_META_IG_USER_ID = "pp_meta_ig_user_id";

export function useFacebookAuth(onTokensReceived) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [igUserId, setIgUserIdState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const accessTokenRef = useRef(null);
  accessTokenRef.current = accessToken;

  useEffect(() => {
    const storedAccess = localStorage.getItem(STORAGE_META_ACCESS);
    const storedIgUserId = localStorage.getItem(STORAGE_META_IG_USER_ID);

    const params = new URLSearchParams(window.location.search);
    const urlAccess = params.get("meta_access_token");
    const urlIgUserId = params.get("meta_ig_user_id");
    const authError = params.get("meta_auth_error");

    if (authError) {
      console.warn("Meta OAuth error:", authError);
      window.history.replaceState({}, "", window.location.pathname);
      setAccessTokenState(storedAccess);
      setIgUserIdState(storedIgUserId);
      setIsInitialized(true);
      return;
    }

    if (urlAccess && urlIgUserId) {
      localStorage.setItem(STORAGE_META_ACCESS, urlAccess);
      localStorage.setItem(STORAGE_META_IG_USER_ID, urlIgUserId);
      setAccessTokenState(urlAccess);
      setIgUserIdState(urlIgUserId);
      window.history.replaceState({}, "", window.location.pathname);
      onTokensReceived?.();
    } else if (storedAccess && String(storedAccess).trim()) {
      setAccessTokenState(storedAccess);
      setIgUserIdState(storedIgUserId);
    }
    setIsInitialized(true);
  }, [onTokensReceived]);

  const connect = async () => {
    try {
      const res = await fetch("/api/auth/facebook/url");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.location.assign(data.url);
        return;
      }
      if (res.status === 500) {
        const msg = data?.message || data?.error || "Instagram auth isn't configured (META_APP_ID / META_REDIRECT_URI missing).";
        throw new Error(msg);
      }
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `API error (${res.status}). Run with npx vercel dev and open http://localhost:3000`);
      }
      throw new Error(data?.message || data?.error || "No auth URL returned. Check server logs.");
    } catch (err) {
      console.error("Failed to get Meta auth URL:", err);
      throw err;
    }
  };

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_META_ACCESS);
      localStorage.removeItem(STORAGE_META_IG_USER_ID);
    } catch (e) {
      // Ignore if localStorage is unavailable (e.g. private mode)
    }
    setAccessTokenState(null);
    setIgUserIdState(null);
  }, []);

  const fetchWithAuth = useCallback(
    async (url, opts = {}) => {
      const token = accessTokenRef.current;
      if (!token) return new Response(JSON.stringify({ error: "Not connected" }), { status: 401 });
      return fetch(url, {
        ...opts,
        headers: {
          ...opts.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    []
  );

  return {
    isConnected: !!(accessToken && String(accessToken).trim()),
    isInitialized,
    igUserId,
    accessToken,
    connect,
    disconnect,
    fetchWithAuth,
  };
}
