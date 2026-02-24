const SESSION_STORAGE_KEY = "pp_analytics_session_id";

let cachedSessionId = null;

export function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return "server";
  }
  if (cachedSessionId) return cachedSessionId;
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      cachedSessionId = existing;
      return existing;
    }
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    cachedSessionId = id;
    return id;
  } catch {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cachedSessionId = id;
    return id;
  }
}

const IS_DEV = import.meta.env?.MODE !== "production";

export async function track(type, payload = {}, options = {}) {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  const body = {
    orgId: options.orgId || "default",
    sessionId,
    userId: options.userId ?? null,
    type,
    timestamp: new Date().toISOString(),
    payload: payload || {},
  };

  try {
    const res = await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok && IS_DEV) {
      const text = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.warn("Analytics track failed", res.status, text);
    }
  } catch (err) {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn("Analytics track error", err);
    }
  }
}

