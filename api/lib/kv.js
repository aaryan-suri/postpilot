import { kv as vercelKv } from "@vercel/kv";
import { randomUUID } from "crypto";

const hasKvEnv =
  !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
  !!process.env.KV_URL;

// In-memory fallback for local dev when KV isn't configured.
// This is explicitly "no-persist" – data is lost between invocations.
const memoryStore = new Map();

function logNoPersistWarning() {
  if (process.env.NODE_ENV === "test") return;
  // Best-effort: avoid spamming logs by only warning occasionally if desired in future.
  // For now, always warn so developers notice missing KV config.
  // eslint-disable-next-line no-console
  console.warn(
    "[PostPilot][KV] KV_REST_API_URL / KV_REST_API_TOKEN not set. Running in NO-PERSIST mode (in-memory only)."
  );
}

async function memoryGet(key) {
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

async function memorySet(key, value, opts = {}) {
  const record = { value, expiresAt: null };
  if (opts.ex) {
    const ttlMs = typeof opts.ex === "number" ? opts.ex * 1000 : 0;
    if (ttlMs > 0) {
      record.expiresAt = Date.now() + ttlMs;
      setTimeout(() => {
        memoryStore.delete(key);
      }, ttlMs).unref?.();
    }
  }
  memoryStore.set(key, record.value);
}

async function memoryDel(key) {
  memoryStore.delete(key);
}

async function memorySAdd(key, ...members) {
  const existing = new Set(memoryStore.get(key) || []);
  for (const m of members) existing.add(m);
  memoryStore.set(key, Array.from(existing));
}

async function memorySRem(key, ...members) {
  const existing = new Set(memoryStore.get(key) || []);
  for (const m of members) existing.delete(m);
  memoryStore.set(key, Array.from(existing));
}

async function memorySMembers(key) {
  return memoryStore.get(key) || [];
}

async function memoryIncr(key) {
  const current = Number(memoryStore.get(key) || 0);
  const next = Number.isFinite(current) ? current + 1 : 1;
  memoryStore.set(key, next);
  return next;
}

export const isKvEnabled = hasKvEnv;

export async function kvGet(key) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memoryGet(key);
  }
  return vercelKv.get(key);
}

export async function kvSet(key, value, opts) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memorySet(key, value, opts);
  }
  return vercelKv.set(key, value, opts);
}

export async function kvDel(key) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memoryDel(key);
  }
  return vercelKv.del(key);
}

export async function kvSAdd(key, ...members) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memorySAdd(key, ...members);
  }
  return vercelKv.sadd(key, ...members);
}

export async function kvSRem(key, ...members) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memorySRem(key, ...members);
  }
  return vercelKv.srem(key, ...members);
}

export async function kvSMembers(key) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memorySMembers(key);
  }
  return vercelKv.smembers(key);
}

export async function kvIncr(key) {
  if (!hasKvEnv) {
    logNoPersistWarning();
    return memoryIncr(key);
  }
  return vercelKv.incr(key);
}

export function newId() {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Key builders (must match spec)
export const kvKeys = {
  userByEmail(email) {
    return `user:byEmail:${String(email).toLowerCase()}`;
  },
  session(sessionId) {
    return `session:${sessionId}`;
  },
  userSessions(userId) {
    return `userSessions:${userId}`;
  },
  magicToken(token) {
    return `magic:${token}`;
  },
  org(orgId) {
    return `org:${orgId}`;
  },
  orgsByUser(userId) {
    return `orgsByUser:${userId}`;
  },
  member(orgId, userId) {
    return `member:${orgId}:${userId}`;
  },
  events(orgId) {
    return `events:${orgId}`;
  },
  posts(orgId) {
    return `posts:${orgId}`;
  },
  queue(orgId) {
    return `queue:${orgId}`;
  },
  analyticsEvents(orgId) {
    return `analytics:${orgId}:events`;
  },
  nextIdCounter() {
    return "id:next";
  },
};

