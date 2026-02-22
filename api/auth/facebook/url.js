// Vercel Serverless Function — generates Meta/Facebook OAuth authorization URL for Instagram
import { getMetaRedirectUri } from "./redirectUri.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const appId = process.env.META_APP_ID;
  const { redirectUri, derived } = getMetaRedirectUri();

  if (!appId) {
    const { redirectUri: computedUri } = getMetaRedirectUri();
    console.error("Meta OAuth: META_APP_ID is missing");
    return res.status(500).json({
      error: "OAuth not configured",
      message: "Instagram auth isn't configured. Set META_APP_ID and META_APP_SECRET in Vercel → Project Settings → Environment Variables.",
      missing: ["META_APP_ID"],
      setupHint: "In your Meta app dashboard (developers.facebook.com), add this exact URL to Valid OAuth Redirect URIs:",
      redirectUriSuggested: computedUri,
      howToFix: "See README → Instagram Setup for step-by-step instructions.",
    });
  }

  if (!redirectUri) {
    console.error("Meta OAuth: Could not derive redirect URI (set FRONTEND_URL, VERCEL_URL, or META_REDIRECT_URI)");
    return res.status(500).json({
      error: "OAuth not configured",
      message: "Redirect URI could not be determined. Set META_REDIRECT_URI to your callback URL, or set FRONTEND_URL / VERCEL_URL.",
      missing: ["META_REDIRECT_URI or FRONTEND_URL/VERCEL_URL"],
      howToFix: "See README → Instagram Setup.",
    });
  }

  if (process.env.NODE_ENV !== "production" && derived) {
    console.log("[Meta OAuth] Using derived redirect URI (paste this into Meta app Valid OAuth Redirect URIs):", redirectUri);
  }

  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("response_type", "code");

  return res.status(200).json({ url: authUrl.toString() });
}
