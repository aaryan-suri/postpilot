// Vercel Serverless Function — exchanges auth code for tokens, redirects to frontend
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const code = req.query?.code;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Google OAuth env vars missing");
    return res.redirect("/?auth_error=config");
  }

  if (!code) {
    return res.redirect("/?auth_error=no_code");
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    if (!access_token) {
      return res.redirect("/?auth_error=no_token");
    }

    // Redirect to frontend with tokens in URL (MVP — migrate to httpOnly cookies later)
    const base =
      process.env.FRONTEND_URL || new URL(redirectUri).origin;
    const params = new URLSearchParams({
      access_token,
      ...(refresh_token && { refresh_token }),
    });
    return res.redirect(302, `${base}/?${params.toString()}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect("/?auth_error=exchange_failed");
  }
}
