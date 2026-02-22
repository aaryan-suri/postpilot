// Vercel Serverless Function — generates Meta/Facebook OAuth authorization URL for Instagram
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    console.error("Meta OAuth env vars missing (META_APP_ID, META_REDIRECT_URI)");
    return res.status(500).json({
      error: "OAuth not configured",
      message: "Instagram auth isn't configured (META_APP_ID / META_REDIRECT_URI missing).",
    });
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
