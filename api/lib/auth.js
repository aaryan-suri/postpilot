import {
  kvGet,
  kvSet,
  kvDel,
  kvSAdd,
  kvSRem,
  kvSMembers,
  newId,
  kvKeys,
} from "./kv.js";

export const SESSION_COOKIE_NAME = "postpilot_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function parseCookies(req) {
  const header = req.headers?.cookie;
  const cookies = {};
  if (!header) return cookies;
  const parts = header.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.split("=");
    if (!rawKey) continue;
    const key = rawKey.trim();
    const value = rest.join("=").trim();
    if (!key) continue;
    cookies[key] = decodeURIComponent(value || "");
  }
  return cookies;
}

export function getSessionIdFromRequest(req) {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE_NAME] || null;
}

function buildCookie(name, value, options = {}) {
  const parts = [`${name}=${value ?? ""}`];
  if (options.maxAge != null) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  parts.push("Path=/");
  parts.push("SameSite=Lax");
  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }
  const secure =
    options.secure ??
    !!process.env.VERCEL_URL ||
    process.env.NODE_ENV === "production";
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function setSessionCookie(res, sessionId, maxAgeSeconds = SESSION_TTL_SECONDS) {
  const cookie = buildCookie(SESSION_COOKIE_NAME, sessionId, {
    maxAge: maxAgeSeconds,
  });
  res.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(res) {
  const cookie = buildCookie(SESSION_COOKIE_NAME, "", { maxAge: 0 });
  res.setHeader("Set-Cookie", cookie);
}

export async function getSession(req) {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) return null;
  const key = kvKeys.session(sessionId);
  const stored = await kvGet(key);
  if (!stored) return null;

  if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
    // Session expired – best-effort cleanup.
    await kvDel(key);
    if (stored.userId) {
      const userSessionsKey = kvKeys.userSessions(stored.userId);
      await kvSRem(userSessionsKey, sessionId);
    }
    return null;
  }

  return { sessionId, ...stored };
}

export async function requireSession(req, res) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return session;
}

export async function createSessionForEmail(email) {
  const lower = String(email || "").toLowerCase();
  const now = new Date();
  const nowIso = now.toISOString();

  let user = await kvGet(kvKeys.userByEmail(lower));
  if (!user || !user.id) {
    user = {
      id: newId(),
      email: lower,
      createdAt: nowIso,
    };
  }

  // Preserve any existing fields (e.g. activeOrgId)
  await kvSet(kvKeys.userByEmail(lower), user);

  const sessionId = newId();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();
  const session = {
    userId: user.id,
    email: lower,
    createdAt: nowIso,
    expiresAt,
  };

  await kvSet(kvKeys.session(sessionId), session, { ex: SESSION_TTL_SECONDS });
  await kvSAdd(kvKeys.userSessions(user.id), sessionId);

  return { sessionId, session, user };
}

export async function destroySession(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE_NAME];
  if (!sessionId) {
    clearSessionCookie(res);
    return;
  }
  const key = kvKeys.session(sessionId);
  const session = await kvGet(key);
  await kvDel(key);
  if (session?.userId) {
    await kvSRem(kvKeys.userSessions(session.userId), sessionId);
  }
  clearSessionCookie(res);
}

export async function loadUserAndOrgs(session) {
  const email = session.email;
  const userKey = kvKeys.userByEmail(email);
  let user = await kvGet(userKey);
  if (!user || !user.id) {
    user = {
      id: session.userId || newId(),
      email,
      createdAt: session.createdAt || new Date().toISOString(),
    };
    await kvSet(userKey, user);
  }

  const orgIds = await kvSMembers(kvKeys.orgsByUser(user.id));
  const orgs = [];
  for (const orgId of orgIds || []) {
    const org = await kvGet(kvKeys.org(orgId));
    if (!org) continue;
    const membership = await kvGet(kvKeys.member(orgId, user.id));
    if (!membership) continue;
    orgs.push({
      id: org.id,
      name: org.name,
      role: membership.role || "member",
    });
  }

  let activeOrgId = user.activeOrgId || null;
  if (!activeOrgId && orgs.length > 0) {
    activeOrgId = orgs[0].id;
  }
  if (activeOrgId && !orgs.some((o) => o.id === activeOrgId)) {
    activeOrgId = orgs[0]?.id || null;
  }
  if (activeOrgId !== user.activeOrgId) {
    user.activeOrgId = activeOrgId || null;
    await kvSet(userKey, user);
  }

  return { user, orgs, activeOrgId };
}

export async function ensureOrgAccess(orgId, userId) {
  if (!orgId || !userId) return null;
  const membership = await kvGet(kvKeys.member(orgId, userId));
  if (!membership) {
    return null;
  }
  return membership;
}

export function getAppBaseUrl(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const protocol =
      process.env.VERCEL_ENV === "production" ? "https" : "https";
    return `${protocol}://${process.env.VERCEL_URL}`;
  }
  const host = req?.headers?.host;
  if (host) {
    const proto =
      req.headers["x-forwarded-proto"] ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

