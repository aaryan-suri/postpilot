// Vercel Serverless Function — refreshes access token using refresh token
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "OAuth not configured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const refreshToken = body.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: "refresh_token required" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    return res.status(200).json({
      access_token: credentials.access_token,
      expires_in: credentials.expiry_date
        ? Math.round((credentials.expiry_date - Date.now()) / 1000)
        : 3600,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ error: "token_refresh_failed" });
  }
}
