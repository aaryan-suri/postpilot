// Vercel Serverless Function — creates IG media container and publishes (Instagram Graph API)
const IG_API_VERSION = "v21.0";
const IG_HOST = "https://graph.facebook.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <token>" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { imageUrl, caption, igUserId } = body;
  const igUserIdFromBody = igUserId || body.ig_user_id;
  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "imageUrl is required" });
  }
  if (!igUserIdFromBody) {
    return res.status(400).json({ error: "igUserId is required (from Meta OAuth)" });
  }

  const igId = String(igUserIdFromBody).trim();
  const captionStr = caption != null ? String(caption) : "";

  try {
    const createRes = await fetch(
      `${IG_HOST}/${IG_API_VERSION}/${igId}/media?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: captionStr,
        }),
      }
    );
    const createData = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      return res.status(createRes.status).json({
        error: "Instagram media creation failed",
        details: createData.error?.message || createData.error || createRes.statusText,
      });
    }

    const containerId = createData.id;
    if (!containerId) {
      return res.status(500).json({ error: "No container ID returned from Instagram" });
    }

    const publishRes = await fetch(
      `${IG_HOST}/${IG_API_VERSION}/${igId}/media_publish?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerId }),
      }
    );
    const publishData = await publishRes.json().catch(() => ({}));

    if (!publishRes.ok) {
      return res.status(publishRes.status).json({
        error: "Instagram publish failed",
        details: publishData.error?.message || publishData.error || publishRes.statusText,
      });
    }

    return res.status(200).json({
      success: true,
      mediaId: publishData.id,
    });
  } catch (err) {
    console.error("Instagram publish error:", err);
    return res.status(500).json({
      error: "Publish request failed",
      details: err.message,
    });
  }
}
