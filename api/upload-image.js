// Vercel Serverless Function — uploads data URL to public host (Vercel Blob), returns publicUrl for IG API
import { put } from "@vercel/blob";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel body limit ~4.5 MB)
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, base64] = match;
  if (!ALLOWED_TYPES.includes(mime)) return null;
  try {
    const buf = Buffer.from(base64, "base64");
    if (buf.length > MAX_SIZE) return null;
    const ext = mime === "image/png" ? "png" : "jpg";
    return { buffer: buf, mime, ext };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const dataUrl = body.dataUrl ?? body.data_url;
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    return res.status(400).json({
      error: "Invalid or missing dataUrl. Send { dataUrl: 'data:image/jpeg;base64,...' } (JPEG or PNG, max 4MB).",
    });
  }

  try {
    const filename = `postpilot/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${parsed.ext}`;
    const blob = await put(filename, parsed.buffer, {
      access: "public",
      contentType: parsed.mime,
    });
    return res.status(200).json({ publicUrl: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      error: "Upload failed. Ensure BLOB_READ_WRITE_TOKEN is set if using Vercel Blob.",
    });
  }
}
