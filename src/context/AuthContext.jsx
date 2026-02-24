import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Navigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [activeOrgId, setActiveOrgIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.status === 401) {
        setUser(null);
        setOrgs([]);
        setActiveOrgIdState(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data.user || null);
      setOrgs(data.orgs || []);
      setActiveOrgIdState(data.activeOrgId || null);
    } catch (err) {
      setError(err?.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch {
      // ignore
    }
    setUser(null);
    setOrgs([]);
    setActiveOrgIdState(null);
    window.location.assign("/login");
  }, []);

  const updateActiveOrgId = useCallback(
    async (orgId) => {
      setActiveOrgIdState(orgId);
      try {
        const res = await fetch("/api/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ activeOrgId: orgId }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
          setOrgs(data.orgs || []);
          setActiveOrgIdState(data.activeOrgId || null);
        }
      } catch {
        // best-effort; local state already updated
      }
    },
    []
  );

  const value = {
    user,
    orgs,
    activeOrgId,
    loading,
    error,
    reload: loadMe,
    logout,
    setActiveOrgId: updateActiveOrgId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext) || {
    user: null,
    orgs: [],
    activeOrgId: null,
    loading: false,
    error: null,
    reload: () => {},
    logout: () => {},
    setActiveOrgId: () => {},
  };
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "radial-gradient(circle at top, #1e1e24 0, #050507 55%, #020203 100%)",
        }}
      >
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}

