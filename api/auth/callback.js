// Vercel Serverless Function — exchanges auth code for tokens, redirects to frontend
import { google } from "googleapis";
import { kvGet, kvDel, kvKeys } from "../server/kv.js";
import {
  createSessionForEmail,
  setSessionCookie,
  getAppBaseUrl,
} from "../server/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const magicToken = req.query?.token;
  const oauthCode = req.query?.code;

  // Passwordless magic-link callback: /api/auth/callback?token=...
  if (magicToken && !oauthCode) {
    try {
      const key = kvKeys.magicToken(magicToken);
      const record = await kvGet(key);
      if (!record) {
        return res.redirect("/login?error=magic_link_invalid");
      }

      await kvDel(key);

      const now = new Date();
      if (record.expiresAt && new Date(record.expiresAt) < now) {
        return res.redirect("/login?error=magic_link_expired");
      }

      const { sessionId } = await createSessionForEmail(record.email);
      setSessionCookie(res, sessionId);

      const base = getAppBaseUrl(req);
      return res.redirect(302, `${base}/app`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Magic link callback error:", err);
      return res.redirect("/login?error=magic_link_error");
    }
  }

  // Existing Google OAuth callback for Calendar
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    // eslint-disable-next-line no-console
    console.error("Google OAuth env vars missing");
    return res.redirect("/?auth_error=config");
  }

  if (!oauthCode) {
    return res.redirect("/?auth_error=no_code");
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    const { tokens } = await oauth2Client.getToken(oauthCode);
    const { access_token: accessToken, refresh_token: refreshToken } = tokens;

    if (!accessToken) {
      return res.redirect("/?auth_error=no_token");
    }

    // Redirect to frontend app (onboard) with tokens in URL (MVP — Google auth is separate from PostPilot accounts)
    const base = process.env.FRONTEND_URL || new URL(redirectUri).origin;
    const params = new URLSearchParams({
      access_token: accessToken,
      ...(refreshToken && { refresh_token: refreshToken }),
    });
    return res.redirect(302, `${base}/onboard?${params.toString()}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("OAuth callback error:", error);
    return res.redirect("/?auth_error=exchange_failed");
  }
}

