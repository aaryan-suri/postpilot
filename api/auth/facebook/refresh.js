// Vercel Serverless Function — stub for Meta token refresh (MVP: long-lived token exchange can be added later)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(501).json({
    error: "Token refresh not implemented for MVP. Use long-lived Page token in production.",
  });
}
