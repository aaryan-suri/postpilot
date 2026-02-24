import {
  getAnalyticsEvents,
  getBackendType,
} from "./store.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function parseRange(range) {
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 7;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

