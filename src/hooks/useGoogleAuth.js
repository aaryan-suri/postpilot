import { useState, useEffect, useRef, useCallback } from "react";

// Google auth: session-only (no persistence across visits). Cleared on each page load.
const STORAGE_ACCESS = "pp_access_token";
const STORAGE_REFRESH = "pp_refresh_token";
const STORAGE_CALENDAR = "pp_calendar_id";

export function useGoogleAuth(onTokensReceived) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [refreshToken, setRefreshTokenState] = useState(null);
  const [calendarId, setCalendarIdState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const accessTokenRef = useRef(null);
  const refreshTokenRef = useRef(null);
  accessTokenRef.current = accessToken;
  refreshTokenRef.current = refreshToken;

  // On mount: clear any persisted Google auth so each visit starts fresh. Only use URL params from OAuth callback.
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_ACCESS);
      localStorage.removeItem(STORAGE_REFRESH);
      localStorage.removeItem(STORAGE_CALENDAR);
    } catch (e) {
      // Ignore if localStorage unavailable
    }

    const params = new URLSearchParams(window.location.search);
    const urlAccess = params.get("access_token");
    const urlRefresh = params.get("refresh_token");
    const authError = params.get("auth_error");

    if (authError) {
      console.warn("OAuth error:", authError);
      window.history.replaceState({}, "", window.location.pathname);
      setIsInitialized(true);
      return;
    }

    if (urlAccess) {
      setAccessTokenState(urlAccess);
      setRefreshTokenState(urlRefresh);
      window.history.replaceState({}, "", window.location.pathname);
      onTokensReceived?.();
    }
    setIsInitialized(true);
  }, [onTokensReceived]);

  const setAccessToken = (v) => {
    setAccessTokenState(v);
    // No localStorage - session only
  };
  const setRefreshToken = (v) => {
    setRefreshTokenState(v);
    // No localStorage - session only
  };
  const setCalendarId = (v) => {
    setCalendarIdState(v);
    // No localStorage - session only
  };

  const isConnected = !!(accessToken && String(accessToken).trim());

  const connect = async () => {
    try {
      const res = await fetch("/api/auth/url");
      const data = await res.json().catch(() => ({}));
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 500) {
        throw new Error("Google OAuth not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI to .env and run with npx vercel dev");
      }
      if (!res.ok) {
        throw new Error(`API error (${res.status}). Run with npx vercel dev and open http://localhost:3000`);
      }
      throw new Error("No auth URL returned. Check server logs.");
    } catch (err) {
      console.error("Failed to get auth URL:", err);
      throw err;
    }
  };

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_ACCESS);
      localStorage.removeItem(STORAGE_REFRESH);
      localStorage.removeItem(STORAGE_CALENDAR);
    } catch (e) {
      // Ignore if localStorage is unavailable (e.g. private mode)
    }
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setCalendarIdState(null);
  }, []);

  const refreshAccessToken = async () => {
    const stored = refreshTokenRef.current;
    if (!stored) {
      disconnect();
      return null;
    }
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: stored }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data?.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Token refresh failed:", err);
    }
    disconnect();
    return null;
  };

  const fetchWithAuth = useCallback(async (url, opts = {}) => {
    let token = accessTokenRef.current;
    let res = await fetch(url, {
      ...opts,
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await fetch(url, {
          ...opts,
          headers: {
            ...opts.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }
    return res;
  }, []); // Stable ref - uses accessTokenRef for current token

  return {
    isConnected,
    isInitialized,
    calendarId,
    setCalendarId,
    connect,
    disconnect,
    fetchWithAuth,
    accessToken,
  };
}
