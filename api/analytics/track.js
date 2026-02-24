import { randomUUID } from "crypto";
import {
  appendAnalyticsEvent,
  validateAnalyticsEvent,
  getBackendType,
} from "./store.js";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS_PER_SESSION = 60;

// In-memory rate limiter per sessionId (best-effort within a single lambda instance).
const rateLimitState = new Map();

function checkRateLimit(sessionId) {
  if (!sessionId) return true;
  const now = Date.now();
  const current = rateLimitState.get(sessionId);
  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(sessionId, { windowStart: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX_EVENTS_PER_SESSION) {
    return false;
  }
  current.count += 1;
  return true;
}

function makeId() {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!body.orgId) {
    body.orgId = "default";
  }

  const validation = validateAnalyticsEvent(body);
  if (!validation.ok) {
    return res.status(400).json({
      error: "Invalid analytics event",
      details: validation.errors,
    });
  }

  const event = validation.event;
  if (!event.id) {
    event.id = makeId();
  }

  if (!checkRateLimit(event.sessionId)) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      details: "Too many analytics events for this session. Try again in a minute.",
    });
  }

  try {
    await appendAnalyticsEvent(event);
    return res.status(200).json({
      success: true,
      backend: getBackendType(),
    });
  } catch (err) {
    console.error("Analytics track error:", err);
    return res.status(500).json({
      error: "Failed to store analytics event",
      details: err?.message || String(err),
    });
  }
}

