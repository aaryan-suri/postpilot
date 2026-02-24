// Vercel Serverless Function — proxies requests to Anthropic API
// This keeps your ANTHROPIC_API_KEY safe on the server side
//
// NOTE: This file also handles analytics endpoints via Vercel rewrites
// (Hobby plan function-count workaround). See `vercel.json`.

import { randomUUID } from "crypto";
import {
  appendAnalyticsEvent,
  getAnalyticsEvents,
  getBackendType,
  validateAnalyticsEvent,
} from "../server/analyticsStore.js";
import {
  kvGet,
  kvSet,
  kvDel,
  kvKeys,
} from "./lib/kv.js";
import {
  destroySession,
  getAppBaseUrl,
  loadUserAndOrgs,
  requireSession,
} from "./lib/auth.js";
import { sendMagicLink } from "./lib/email.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
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
  if (current.count >= RATE_LIMIT_MAX_EVENTS_PER_SESSION) return false;
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

function parseRange(range) {
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 7;
}

function getDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function buildDateBuckets(fromTime, toTime) {
  const buckets = [];
  let t = fromTime;
  while (t <= toTime) {
    const date = new Date(t).toISOString().slice(0, 10);
    buckets.push({
      date,
      generated_count: 0,
      approved_count: 0,
      published_count: 0,
      failed_publish_count: 0,
      events_ingested_count: 0,
      manual_events_count: 0,
    });
    t += ONE_DAY_MS;
  }
  return buckets;
}

async function handleAnalyticsTrack(req, res) {
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!body.orgId) body.orgId = "default";

  const validation = validateAnalyticsEvent(body);
  if (!validation.ok) {
    return res.status(400).json({
      error: "Invalid analytics event",
      details: validation.errors,
    });
  }

  const event = validation.event;
  if (!event.id) event.id = makeId();

  if (!checkRateLimit(event.sessionId)) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      details: "Too many analytics events for this session. Try again in a minute.",
    });
  }

  try {
    await appendAnalyticsEvent(event);
    return res.status(200).json({ success: true, backend: getBackendType() });
  } catch (err) {
    console.error("Analytics track error:", err);
    return res.status(500).json({
      error: "Failed to store analytics event",
      details: err?.message || String(err),
    });
  }
}

async function handleAnalyticsSummary(req, res) {
  const range = req.query?.range || "7d";
  const orgId = req.query?.orgId || "default";

  const days = parseRange(range);
  const now = Date.now();
  const toTime = now;
  const fromTime = now - days * ONE_DAY_MS;
  const fromIso = new Date(fromTime).toISOString();
  const toIso = new Date(toTime).toISOString();

  let events;
  try {
    events = await getAnalyticsEvents({ orgId, from: fromIso, to: toIso });
  } catch (err) {
    console.error("Analytics summary load error:", err);
    return res.status(500).json({
      error: "Failed to load analytics events",
      details: err?.message || String(err),
    });
  }

  const buckets = buildDateBuckets(fromTime, toTime);
  const bucketByDate = new Map(buckets.map((b) => [b.date, b]));

  let totalGenerated = 0;
  let totalApproved = 0;
  let totalPublished = 0;
  let totalFailed = 0;
  let eventsIngested = 0;
  let manualEvents = 0;

  let sumGenToApproveMinutes = 0;
  let countGenToApprove = 0;
  let sumApproveToPublishMinutes = 0;
  let countApproveToPublish = 0;

  const topEventsCounter = new Map();
  const platformBreakdown = new Map();
  const eventTitles = new Map();

  const ingestionBreakdown = {
    google: 0,
    demo: 0,
    manual: 0,
    other: 0,
  };

  for (const evt of events) {
    const dateKey = getDateKey(evt.timestamp);
    const bucket = bucketByDate.get(dateKey);
    const payload = evt.payload || {};
    const platform = payload.platform || "unknown";

    if (evt.type === "post_generated") {
      const postsCount =
        typeof payload.postsCount === "number" && payload.postsCount > 0
          ? payload.postsCount
          : 1;
      totalGenerated += postsCount;
      if (bucket) bucket.generated_count += postsCount;

      const key = payload.eventId || "unknown";
      topEventsCounter.set(key, (topEventsCounter.get(key) || 0) + postsCount);
      if (payload.eventId && payload.eventTitle && !eventTitles.has(payload.eventId)) {
        eventTitles.set(payload.eventId, payload.eventTitle);
      }

      const platformInfo =
        platformBreakdown.get(platform) || { generated: 0, approved: 0, published: 0 };
      platformInfo.generated += postsCount;
      platformBreakdown.set(platform, platformInfo);
    }

    if (evt.type === "post_approved") {
      totalApproved += 1;
      if (bucket) bucket.approved_count += 1;

      const platformInfo =
        platformBreakdown.get(platform) || { generated: 0, approved: 0, published: 0 };
      platformInfo.approved += 1;
      platformBreakdown.set(platform, platformInfo);

      const genAt = payload.generatedAt;
      const approvedAt = payload.approvedAt;
      if (genAt && approvedAt) {
        const dt = (Date.parse(approvedAt) - Date.parse(genAt)) / (60 * 1000);
        if (!Number.isNaN(dt) && dt >= 0) {
          sumGenToApproveMinutes += dt;
          countGenToApprove += 1;
        }
      }
    }

    if (evt.type === "publish_succeeded") {
      totalPublished += 1;
      if (bucket) bucket.published_count += 1;

      const platformInfo =
        platformBreakdown.get(platform) || { generated: 0, approved: 0, published: 0 };
      platformInfo.published += 1;
      platformBreakdown.set(platform, platformInfo);

      const approvedAt = payload.approvedAt;
      const publishedAt = payload.publishedAt;
      if (approvedAt && publishedAt) {
        const dt = (Date.parse(publishedAt) - Date.parse(approvedAt)) / (60 * 1000);
        if (!Number.isNaN(dt) && dt >= 0) {
          sumApproveToPublishMinutes += dt;
          countApproveToPublish += 1;
        }
      }
    }

    if (evt.type === "publish_failed") {
      totalFailed += 1;
      if (bucket) bucket.failed_publish_count += 1;
    }

    if (evt.type === "event_ingested") {
      const count = typeof payload.count === "number" ? payload.count : 1;
      eventsIngested += count;
      if (bucket) bucket.events_ingested_count += count;
      const src = (payload.calendarSource || "other").toLowerCase();
      if (src === "google" || src === "demo" || src === "manual") {
        ingestionBreakdown[src] += count;
      } else {
        ingestionBreakdown.other += count;
      }
    }

    if (evt.type === "event_added_manual") {
      manualEvents += 1;
      eventsIngested += 1;
      if (bucket) {
        bucket.manual_events_count += 1;
        bucket.events_ingested_count += 1;
      }
      ingestionBreakdown.manual += 1;
    }
  }

  const avgGenerateToApproveMinutes =
    countGenToApprove > 0 ? sumGenToApproveMinutes / countGenToApprove : 0;
  const avgApproveToPublishMinutes =
    countApproveToPublish > 0 ? sumApproveToPublishMinutes / countApproveToPublish : 0;

  const approvalRate = totalGenerated > 0 ? totalApproved / totalGenerated : 0;
  const publishFailureRate =
    totalPublished + totalFailed > 0 ? totalFailed / (totalPublished + totalFailed) : 0;

  const topEventsByPosts = Array.from(topEventsCounter.entries())
    .map(([eventId, count]) => ({
      eventId,
      count,
      title: eventTitles.get(eventId) || null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const platformBreakdownObj = {};
  for (const [plat, info] of platformBreakdown.entries()) {
    platformBreakdownObj[plat] = info;
  }

  const recentEvents = events
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 20);

  return res.status(200).json({
    range,
    from: fromIso,
    to: toIso,
    backend: getBackendType(),
    totals: {
      generated_count: totalGenerated,
      approved_count: totalApproved,
      published_count: totalPublished,
      failed_publish_count: totalFailed,
      events_ingested_count: eventsIngested,
      manual_events_count: manualEvents,
      approval_rate: approvalRate,
      publish_failure_rate: publishFailureRate,
      avg_time_generate_to_approve: avgGenerateToApproveMinutes,
      avg_time_approve_to_publish: avgApproveToPublishMinutes,
      events_ingested_breakdown: ingestionBreakdown,
    },
    daily_rollups: buckets,
    top_events_by_posts: topEventsByPosts,
    platform_breakdown: platformBreakdownObj,
    recent_events: recentEvents,
  });
}

async function handleAnalyticsEventsDebug(req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Analytics events endpoint disabled in production" });
  }

  const range = req.query?.range || "7d";
  const orgId = req.query?.orgId || "default";

  const days = parseRange(range);
  const now = Date.now();
  const toTime = now;
  const fromTime = now - days * ONE_DAY_MS;
  const fromIso = new Date(fromTime).toISOString();
  const toIso = new Date(toTime).toISOString();

  try {
    const events = await getAnalyticsEvents({
      orgId,
      from: fromIso,
      to: toIso,
      limit: 500,
    });
    return res.status(200).json({
      backend: getBackendType(),
      range,
      from: fromIso,
      to: toIso,
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Analytics events debug error:", err);
    return res.status(500).json({
      error: "Failed to load analytics events",
      details: err?.message || String(err),
    });
  }
}

// -------- Passwordless auth & org-scoped data ----------------

async function handleAuthRequestLink(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    // Do not leak parsing failures; respond OK to avoid enumeration.
    return res.status(200).json({ ok: true });
  }

  const rawEmail = body.email;
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email) {
    return res.status(200).json({ ok: true });
  }

  const rateKey = `ratelimit:magic:${email}`;
  const existing = await kvGet(rateKey);
  const now = Date.now();
  if (existing && typeof existing.nextAllowedAt === "number") {
    if (existing.nextAllowedAt > now) {
      return res.status(200).json({ ok: true });
    }
  }
  const nextAllowedAt = now + 60 * 1000;
  await kvSet(rateKey, { nextAllowedAt }, { ex: 60 });

  const token = makeId();
  const magicKey = kvKeys.magicToken(token);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await kvSet(
    magicKey,
    {
      email,
      createdAt,
      expiresAt,
    },
    { ex: 15 * 60 }
  );

  const base = getAppBaseUrl(req);
  const url = `${base}/auth/callback?token=${encodeURIComponent(token)}`;
  await sendMagicLink(email, url);

  return res.status(200).json({ ok: true });
}

async function handleAuthLogout(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  await destroySession(req, res);
  return res.status(200).json({ ok: true });
}

async function handleMe(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const { user, orgs, activeOrgId } = await loadUserAndOrgs(session);

  if (req.method === "POST") {
    let body;
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (body && typeof body.activeOrgId === "string") {
      const requestedOrgId = body.activeOrgId;
      if (orgs.some((o) => o.id === requestedOrgId)) {
        const userKey = kvKeys.userByEmail(user.email);
        const updated = { ...user, activeOrgId: requestedOrgId };
        await kvSet(userKey, updated);
        const refreshed = await loadUserAndOrgs(session);
        return res.status(200).json({
          user: { id: refreshed.user.id, email: refreshed.user.email },
          orgs: refreshed.orgs,
          activeOrgId: refreshed.activeOrgId,
        });
      }
    }
  }

  return res.status(200).json({
    user: { id: user.id, email: user.email },
    orgs,
    activeOrgId,
  });
}

async function handleOrgs(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const { user, orgs, activeOrgId } = await loadUserAndOrgs(session);
    return res.status(200).json({
      user: { id: user.id, email: user.email },
      orgsDetailed: await Promise.all(
        orgs.map(async (o) => {
          const org = await kvGet(kvKeys.org(o.id));
          return org || null;
        })
      ).then((arr) => arr.filter(Boolean)),
      activeOrgId,
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const tone = typeof body.tone === "string" ? body.tone : "";
    const platforms = Array.isArray(body.platforms) ? body.platforms : [];

    const orgId = makeId();
    const createdAt = new Date().toISOString();
    const org = {
      id: orgId,
      name,
      description,
      tone,
      platforms,
      createdAt,
      createdBy: session.userId,
    };

    await kvSet(kvKeys.org(orgId), org);
    await kvSAdd(kvKeys.orgsByUser(session.userId), orgId);
    await kvSet(kvKeys.member(orgId, session.userId), { role: "admin" });

    const userKey = kvKeys.userByEmail(session.email);
    const user = await kvGet(userKey);
    if (user) {
      const updated = { ...user, activeOrgId: orgId };
      await kvSet(userKey, updated);
    }

    return res.status(201).json({ org });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function loadOrgScopedArray(orgId, keyBuilder) {
  const key = keyBuilder(orgId);
  const existing = await kvGet(key);
  if (!existing) return [];
  if (Array.isArray(existing)) return existing;
  return [];
}

async function saveOrgScopedArray(orgId, keyBuilder, items) {
  const safe = Array.isArray(items) ? items : [];
  const json = JSON.stringify(safe);
  if (json.length > 1_000_000) {
    throw new Error(
      "Payload too large to store in KV (over ~1MB). Implement chunking before increasing size."
    );
  }
  await kvSet(keyBuilder(orgId), safe);
}

async function handleOrgListResource(req, res, keyBuilder) {
  const session = await requireSession(req, res);
  if (!session) return;
  const { user, orgs, activeOrgId } = await loadUserAndOrgs(session);
  const explicitOrgId = req.query?.orgId;
  const orgId = explicitOrgId || activeOrgId;
  if (!orgId) {
    return res.status(400).json({ error: "No active org" });
  }

  if (!orgs.some((o) => o.id === orgId)) {
    return res.status(403).json({ error: "Not a member of this org" });
  }

  if (req.method === "GET") {
    const items = await loadOrgScopedArray(orgId, keyBuilder);
    return res.status(200).json({ orgId, items });
  }

  if (req.method === "POST") {
    let body;
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const existing = await loadOrgScopedArray(orgId, keyBuilder);
    let next = existing;

    if (Array.isArray(body.items)) {
      next = body.items;
    } else if (body.item) {
      const item = body.item;
      if (!item.id) {
        item.id = makeId();
      }
      const byId = new Map(existing.map((e) => [e.id, e]));
      byId.set(item.id, { ...byId.get(item.id), ...item });
      next = Array.from(byId.values());
    }

    try {
      await saveOrgScopedArray(orgId, keyBuilder, next);
    } catch (err) {
      return res.status(413).json({ error: err.message });
    }

    return res.status(200).json({ orgId, items: next });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default async function handler(req, res) {
  const ppRoute = req.query?.pp_route;
  if (ppRoute && typeof ppRoute === "string") {
    const route = ppRoute.replace(/^\/+/, "");
    const parts = route.split("/").filter(Boolean);
    const root = parts[0];
    const action = parts[1] || "";

    if (root === "analytics") {
      if (action === "track") {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }
        return handleAnalyticsTrack(req, res);
      }
      if (action === "summary") {
        if (req.method !== "GET") {
          return res.status(405).json({ error: "Method not allowed" });
        }
        return handleAnalyticsSummary(req, res);
      }
      if (action === "events") {
        if (req.method !== "GET") {
          return res.status(405).json({ error: "Method not allowed" });
        }
        return handleAnalyticsEventsDebug(req, res);
      }
      return res.status(404).json({ error: "Unknown analytics route" });
    }

    if (root === "auth" && action === "request-link") {
      return handleAuthRequestLink(req, res);
    }

    if (root === "auth" && action === "logout") {
      return handleAuthLogout(req, res);
    }

    if (root === "me") {
      return handleMe(req, res);
    }

    if (root === "orgs") {
      return handleOrgs(req, res);
    }

    if (root === "events") {
      return handleOrgListResource(req, res, kvKeys.events);
    }

    if (root === "posts") {
      return handleOrgListResource(req, res, kvKeys.posts);
    }

    if (root === "queue") {
      return handleOrgListResource(req, res, kvKeys.queue);
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  // Validate request body (Vercel parses JSON automatically, but body can be undefined for malformed requests)
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Propagate Anthropic error status so frontend can handle 4xx/5xx gracefully
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Anthropic API error:", error);
    return res.status(500).json({ error: "Failed to call Anthropic API" });
  }
}
