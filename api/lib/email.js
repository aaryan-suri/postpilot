const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const DEFAULT_FROM =
  process.env.EMAIL_FROM || "PostPilot <no-reply@postpilot.local>";

export async function sendMagicLink(email, url) {
  const to = String(email || "").trim();
  if (!to || !url) return;

  if (!RESEND_API_KEY) {
    // Dev fallback: log link so developers can click it locally.
    // eslint-disable-next-line no-console
    console.log(
      `[PostPilot][MagicLink] Login link for ${to}: ${url} (RESEND_API_KEY not set)`
    );
    return;
  }

  const body = {
    from: DEFAULT_FROM,
    to,
    subject: "Your PostPilot login link",
    html: `
      <p>Click the button below to sign in to PostPilot.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#E85D31;color:#fff;text-decoration:none;font-weight:600;">Sign in to PostPilot</a></p>
      <p style="font-size:13px;color:#555;">Or paste this URL into your browser:<br/><code>${url}</code></p>
      <p style="font-size:12px;color:#777;">This link will expire in about 15 minutes. If you didn’t request it, you can safely ignore this email.</p>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error(
        "[PostPilot][MagicLink] Resend API error",
        res.status,
        text
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[PostPilot][MagicLink] Failed to send email", err);
  }
}

