// Vercel Serverless Function — fetches events from a Google Calendar
import { google } from "googleapis";

function detectEventType(title) {
  if (!title) return "gbm";
  const t = title.toLowerCase();
  if (t.includes("gbm") || t.includes("general body") || t.includes("general meeting"))
    return "gbm";
  if (
    t.includes("workshop") ||
    t.includes("resume") ||
    t.includes("career") ||
    t.includes("professional")
  )
    return "workshop";
  if (
    t.includes("social") ||
    t.includes("movie") ||
    t.includes("game night") ||
    t.includes("hangout") ||
    t.includes("party")
  )
    return "social";
  if (t.includes("info session") || t.includes("hackathon") || t.includes(" info "))
    return "info";
  if (
    t.includes("networking") ||
    t.includes("mixer") ||
    t.includes("alumni") ||
    t.includes("connect")
  )
    return "networking";
  return "gbm";
}

function formatTime(dateStr) {
  if (!dateStr) return "All Day";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "All Day";
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  } catch {
    return "All Day";
  }
}

function formatDate(d) {
  if (!d) return "";
  const date = d.dateTime ? new Date(d.dateTime) : new Date(d.date);
  return date.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const calendarId = req.query?.calendarId;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  if (!calendarId) {
    return res.status(400).json({ error: "calendarId query param required" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "OAuth not configured" });
  }

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { data } = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const rawEvents = data.items || [];
    const events = rawEvents
      .filter((e) => e.status !== "cancelled")
      .map((e) => {
        const start = e.start || {};
        const dateStr = formatDate(start);
        const timeStr = start.dateTime ? formatTime(start.dateTime) : "All Day";

        return {
          id: e.id,
          title: e.summary || "Untitled Event",
          date: dateStr,
          time: timeStr,
          location: e.location || "TBD",
          description: e.description || "",
          type: detectEventType(e.summary),
        };
      });

    return res.status(200).json({ events });
  } catch (error) {
    if (error?.response?.status === 401) {
      return res.status(401).json({ error: "token_expired" });
    }
    console.error("Events fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
}
