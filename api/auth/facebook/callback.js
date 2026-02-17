// Vercel Serverless Function — exchanges Meta auth code for tokens, gets Page + IG user, redirects to frontend
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;
  const code = req.query?.code;

  if (!appId || !appSecret || !redirectUri) {
    console.error("Meta OAuth env vars missing");
    return res.redirect("/?meta_auth_error=config");
  }

  if (!code) {
    return res.redirect("/?meta_auth_error=no_code");
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json().catch(() => ({}));

    const userAccessToken = tokenData.access_token;
    if (!userAccessToken) {
      console.error("Meta token exchange failed:", tokenData);
      return res.redirect("/?meta_auth_error=no_token");
    }

    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,access_token,instagram_business_account&access_token=${encodeURIComponent(userAccessToken)}`
    );
    const accountsData = await accountsRes.json().catch(() => ({}));
    const pages = accountsData.data || [];

    const pageWithIg = pages.find((p) => p.instagram_business_account?.id);
    if (!pageWithIg) {
      return res.redirect("/?meta_auth_error=no_instagram_account");
    }

    const pageAccessToken = pageWithIg.access_token;
    const igUserId = pageWithIg.instagram_business_account.id;

    const base = process.env.FRONTEND_URL || new URL(redirectUri).origin;
    const params = new URLSearchParams({
      meta_access_token: pageAccessToken,
      meta_ig_user_id: igUserId,
    });
    return res.redirect(302, `${base}/?${params.toString()}`);
  } catch (error) {
    console.error("Meta OAuth callback error:", error);
    return res.redirect("/?meta_auth_error=exchange_failed");
  }
}
