// Shared analytics storage layer used by /api/analytics routes.
// Chooses Vercel KV when configured, Supabase Postgres when available,
// and falls back to a JSON file in local development.

import { kv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

const MAX_EVENTS_PER_ORG = 20000;

const EVENT_TYPES = new Set([
  "event_ingested",
  "event_added_manual",
  "post_generated",
  "post_approved",
  "post_rejected",
  "post_queued",
  "publish_attempted",
  "publish_succeeded",
  "publish_failed",
  "photo_uploaded",
  "photo_assigned",
]);

function detectBackend() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return "kv";
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }
  if (process.env.NODE_ENV !== "production") {
    return "file";
  }
  return "memory";
}

const BACKEND = detectBackend();

function getOrgId(rawOrgId) {
  return rawOrgId || "default";
}

export function getBackendType() {
  return BACKEND;
}

export function validateAnalyticsEvent(input) {
  const errors = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["Body must be a JSON object."] };
  }

  const {
    orgId,
    sessionId,
    userId = null,
    type,
    timestamp,
    payload,
  } = input;

  const normalizedOrgId = getOrgId(orgId);

  if (!sessionId || typeof sessionId !== "string") {
    errors.push("sessionId (string) is required.");
  }
  if (!type || typeof type !== "string" || !EVENT_TYPES.has(type)) {
    errors.push(
      `type must be one of: ${Array.from(EVENT_TYPES).join(", ")}.`
    );
  }
  if (!timestamp || typeof timestamp !== "string") {
    errors.push("timestamp (ISO string) is required.");
  } else if (Number.isNaN(Date.parse(timestamp))) {
    errors.push("timestamp must be a valid ISO date string.");
  }
  if (payload != null && typeof payload !== "object") {
    errors.push("payload must be an object if provided.");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const cleaned = {
    id: input.id || undefined,
    orgId: normalizedOrgId,
    sessionId,
    userId: userId ?? null,
    type,
    timestamp,
    payload: payload || {},
  };

  return { ok: true, event: cleaned };
}

function getDateRangeFilter(fromIso, toIso) {
  const fromTime = fromIso ? Date.parse(fromIso) : null;
  const toTime = toIso ? Date.parse(toIso) : null;
  return (evt) => {
    const t = Date.parse(evt.timestamp);
    if (Number.isNaN(t)) return false;
    if (fromTime != null && t < fromTime) return false;
    if (toTime != null && t > toTime) return false;
    return true;
  };
}

function getFilePath() {
  // Store under a .data folder at the project root when running locally.
  const root = process.cwd();
  return path.join(root, ".data", "analytics-events.json");
}

async function ensureDataFile() {
  const filePath = getFilePath();
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({ events: [] }, null, 2), "utf8");
  }
  return filePath;
}

async function fileBackendAppend(event) {
  const filePath = await ensureDataFile();
  let data;
  try {
    const raw = await fs.readFile(filePath, "utf8");
    data = JSON.parse(raw || "{}");
  } catch {
    data = { events: [] };
  }
  if (!Array.isArray(data.events)) data.events = [];
  data.events.push(event);
  if (data.events.length > MAX_EVENTS_PER_ORG) {
    data.events = data.events.slice(-MAX_EVENTS_PER_ORG);
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function fileBackendGetEvents(orgId, fromIso, toIso, limit) {
  const filePath = await ensureDataFile();
  let data;
  try {
    const raw = await fs.readFile(filePath, "utf8");
    data = JSON.parse(raw || "{}");
  } catch {
    return [];
  }
  const events = Array.isArray(data.events) ? data.events : [];
  const filter = getDateRangeFilter(fromIso, toIso);
  const filtered = events.filter((e) => e.orgId === orgId).filter(filter);
  if (typeof limit === "number" && limit > 0) {
    return filtered.slice(-limit);
  }
  return filtered;
}

async function kvAppend(event) {
  const key = `analytics:${event.orgId}:events`;
  const json = JSON.stringify(event);
  await kv.lpush(key, json);
  await kv.ltrim(key, 0, MAX_EVENTS_PER_ORG - 1);
}

async function kvGetEvents(orgId, fromIso, toIso, limit) {
  const key = `analytics:${orgId}:events`;
  const max = typeof limit === "number" && limit > 0 ? limit : MAX_EVENTS_PER_ORG;
  const rawList = await kv.lrange(key, 0, max - 1);
  if (!Array.isArray(rawList) || rawList.length === 0) return [];
  const filter = getDateRangeFilter(fromIso, toIso);
  const events = [];
  for (const raw of rawList) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.orgId === orgId && filter(parsed)) {
        events.push(parsed);
      }
    } catch {
      // ignore bad rows
    }
  }
  return events;
}

async function supabaseAppend(event) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase not configured");
  }
  const res = await fetch(`${url}/rest/v1/analytics_events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase insert failed (${res.status}): ${text || res.statusText}`);
  }
}

async function supabaseGetEvents(orgId, fromIso, toIso, limit) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase not configured");
  }
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("orgId", `eq.${orgId}`);
  if (fromIso) params.set("timestamp", `gte.${fromIso}`);
  if (toIso) params.append("timestamp", `lte.${toIso}`);
  params.set("order", "timestamp.asc");
  if (typeof limit === "number" && limit > 0) {
    params.set("limit", String(limit));
  } else {
    params.set("limit", String(MAX_EVENTS_PER_ORG));
  }

  const res = await fetch(`${url}/rest/v1/analytics_events?${params.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase fetch failed (${res.status}): ${text || res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

const memoryStore = {
  events: [],
};

async function memoryAppend(event) {
  memoryStore.events.push(event);
  if (memoryStore.events.length > MAX_EVENTS_PER_ORG) {
    memoryStore.events = memoryStore.events.slice(-MAX_EVENTS_PER_ORG);
  }
}

async function memoryGetEvents(orgId, fromIso, toIso, limit) {
  const filter = getDateRangeFilter(fromIso, toIso);
  const all = memoryStore.events.filter((e) => e.orgId === orgId).filter(filter);
  if (typeof limit === "number" && limit > 0) {
    return all.slice(-limit);
  }
  return all;
}

export async function appendAnalyticsEvent(event) {
  const backend = BACKEND;
  if (backend === "kv") return kvAppend(event);
  if (backend === "supabase") return supabaseAppend(event);
  if (backend === "file") return fileBackendAppend(event);
  return memoryAppend(event);
}

export async function getAnalyticsEvents({ orgId, from, to, limit }) {
  const backend = BACKEND;
  const normalizedOrgId = getOrgId(orgId);
  if (backend === "kv") {
    return kvGetEvents(normalizedOrgId, from, to, limit);
  }
  if (backend === "supabase") {
    return supabaseGetEvents(normalizedOrgId, from, to, limit);
  }
  if (backend === "file") {
    return fileBackendGetEvents(normalizedOrgId, from, to, limit);
  }
  return memoryGetEvents(normalizedOrgId, from, to, limit);
}

