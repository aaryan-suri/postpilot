/**
 * Dev helper: GET /api/auth/facebook/redirect-uri
 * Returns the computed redirect URI so you can copy it into Meta app "Valid OAuth Redirect URIs".
 * Safe to call in production (returns same value the OAuth flow uses).
 */
import { getMetaRedirectUri } from "./redirectUri.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { redirectUri, derived } = getMetaRedirectUri();
  return res.status(200).json({
    redirectUri: redirectUri || null,
    derived,
    hint: redirectUri
      ? "Add this exact URL to your Meta app → Facebook Login → Valid OAuth Redirect URIs"
      : "Could not derive redirect URI. Set META_REDIRECT_URI, FRONTEND_URL, or deploy to Vercel (VERCEL_URL).",
  });
}
