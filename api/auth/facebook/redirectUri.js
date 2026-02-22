/**
 * Single source of truth for Meta OAuth redirect URI.
 * Used by both /api/auth/facebook/url and /api/auth/facebook/callback so they always match.
 *
 * Precedence:
 * - META_REDIRECT_URI if set
 * - else FRONTEND_URL + /api/auth/facebook/callback
 * - else https://${VERCEL_URL} + /api/auth/facebook/callback (Vercel prod/preview)
 * - else http://localhost:3000/api/auth/facebook/callback (local dev)
 */
const META_CALLBACK_PATH = "/api/auth/facebook/callback";

function getBaseUrl() {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_ENV === "production" ? "https" : "https";
    return `${protocol}://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Returns the redirect URI to use for Meta OAuth.
 * @returns {{ redirectUri: string, derived: boolean }} redirectUri and whether it was derived (not from META_REDIRECT_URI)
 */
export function getMetaRedirectUri() {
  if (process.env.META_REDIRECT_URI) {
    return { redirectUri: process.env.META_REDIRECT_URI.trim(), derived: false };
  }
  const base = getBaseUrl();
  const redirectUri = `${base}${META_CALLBACK_PATH}`;
  return { redirectUri, derived: true };
}
