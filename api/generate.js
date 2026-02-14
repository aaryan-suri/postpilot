// Vercel Serverless Function — proxies requests to Anthropic API
// This keeps your ANTHROPIC_API_KEY safe on the server side

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  // Validate request body (Vercel parses JSON automatically, but body can be undefined for malformed requests)
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Propagate Anthropic error status so frontend can handle 4xx/5xx gracefully
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Anthropic API error:", error);
    return res.status(500).json({ error: "Failed to call Anthropic API" });
  }
}
