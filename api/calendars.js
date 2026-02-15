// Vercel Serverless Function — lists user's Google calendars (owner/writer only)
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "OAuth not configured" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { data } = await calendar.calendarList.list();
    const items = data.items || [];

    const calendars = items
      .filter(
        (c) =>
          c.accessRole === "owner" ||
          c.accessRole === "writer" ||
          c.accessRole === "freeBusyWriter"
      )
      .map((c) => ({
        id: c.id,
        name: c.summary || "Untitled Calendar",
        color: c.backgroundColor || "#4285f4",
      }));

    return res.status(200).json({ calendars });
  } catch (error) {
    if (error?.response?.status === 401) {
      return res.status(401).json({ error: "token_expired" });
    }
    console.error("Calendars fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch calendars" });
  }
}
