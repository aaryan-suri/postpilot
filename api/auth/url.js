// Vercel Serverless Function — generates Google OAuth authorization URL
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Google OAuth env vars missing");
    return res.status(500).json({ error: "OAuth not configured" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
    return res.status(200).json({ url: authUrl });
  } catch (error) {
    console.error("OAuth URL generation error:", error);
    return res.status(500).json({ error: "Failed to generate auth URL" });
  }
}
