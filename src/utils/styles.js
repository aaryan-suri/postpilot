// Shared style constants and helpers for PostPilot

export const GRADIENT = "linear-gradient(135deg, #E85D31, #E8B931)";

export const STYLES = {
  page: {
    minHeight: "100vh",
    background: "#0A0A0B",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
  },
  grad: GRADIENT,
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
  },
  pill: (active) => ({
    padding: "10px 20px",
    borderRadius: 50,
    border: active ? "1.5px solid #E85D31" : "1px solid rgba(255,255,255,0.1)",
    background: active ? "rgba(232,89,49,0.12)" : "rgba(255,255,255,0.03)",
    color: active ? "#E8A031" : "rgba(255,255,255,0.5)",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "all 0.2s",
  }),
  input: {
    width: "100%",
    padding: "14px 18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    display: "block",
    marginBottom: 8,
    letterSpacing: "0.5px",
  },
  sub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 300,
    lineHeight: 1.6,
  },
};

export const TYPE_COLORS = {
  announcement: "#E8B931",
  reminder: "#E85D31",
  story: "#9B59B6",
  recap: "#2ECC71",
};

export const PLATFORM_ICONS = {
  Instagram: "📸",
  TikTok: "🎵",
  LinkedIn: "💼",
  "Twitter/X": "🐦",
};

export const TONES = ["Professional & Polished", "Casual & Fun", "Hype & Energetic", "Witty & Clever"];
export const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Twitter/X"];
