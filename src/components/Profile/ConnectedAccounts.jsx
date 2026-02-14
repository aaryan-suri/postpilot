import React from "react";
import { STYLES } from "../../utils/styles";

const ACCOUNTS = [
  { name: "Google Calendar", icon: "📅", statusKey: "calendar" },
  { name: "Instagram", icon: "📸", statusKey: "instagram" },
  { name: "TikTok", icon: "🎵", statusKey: "tiktok" },
  { name: "LinkedIn", icon: "💼", statusKey: "linkedin" },
];

export default function ConnectedAccounts({ platforms }) {
  const getStatus = (key) => {
    if (key === "calendar") return { status: "connected", detail: "Demo mode" };
    const platformName = key === "instagram" ? "Instagram" : key === "tiktok" ? "TikTok" : "LinkedIn";
    const selected = platforms?.includes(platformName);
    return selected
      ? { status: "ready", detail: "Ready to connect" }
      : { status: "none", detail: "Not selected" };
  };

  return (
    <div style={{ ...STYLES.card, padding: 28, marginBottom: 20 }}>
      <h3
        style={{
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.35)",
          marginBottom: 20,
          fontWeight: 600,
        }}
      >
        Connected Accounts
      </h3>
      {ACCOUNTS.map((acct, i) => {
        const { status, detail } = getStatus(acct.statusKey);
        return (
          <div
            key={acct.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{acct.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{acct.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{detail}</div>
              </div>
            </div>
            <div
              style={{
                padding: "5px 14px",
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 600,
                background:
                  status === "connected"
                    ? "rgba(46,204,113,0.12)"
                    : status === "ready"
                    ? "rgba(232,185,49,0.12)"
                    : "rgba(255,255,255,0.05)",
                color:
                  status === "connected"
                    ? "#2ECC71"
                    : status === "ready"
                    ? "#E8B931"
                    : "rgba(255,255,255,0.3)",
              }}
            >
              {status === "connected" ? "✓ Connected" : status === "ready" ? "Connect →" : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
