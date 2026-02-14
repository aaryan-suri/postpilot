import React from "react";
import { STYLES } from "../../utils/styles";

const ACCOUNTS = [
  { name: "Google Calendar", icon: "📅", statusKey: "calendar" },
  { name: "Instagram", icon: "📸", statusKey: "instagram" },
  { name: "TikTok", icon: "🎵", statusKey: "tiktok" },
  { name: "LinkedIn", icon: "💼", statusKey: "linkedin" },
  { name: "Twitter/X", icon: "🐦", statusKey: "twitter" },
];

export default function ConnectedAccounts({ platforms, connectedPlatforms = [], onConnectClick }) {
  const getStatus = (key) => {
    if (key === "calendar") return { status: "connected", detail: "Demo mode", canClick: false };
    const platformName = key === "instagram" ? "Instagram" : key === "tiktok" ? "TikTok" : key === "twitter" ? "Twitter/X" : "LinkedIn";
    const selected = platforms?.includes(platformName);
    const connected = connectedPlatforms?.includes(platformName);
    if (connected) return { status: "connected", detail: "Connected", canClick: false };
    if (selected) return { status: "ready", detail: "Ready to connect", canClick: true, platformName };
    return { status: "none", detail: "Not selected", canClick: false };
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
        const { status, detail, canClick, platformName } = getStatus(acct.statusKey);
        const badge = (
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
              cursor: canClick ? "pointer" : "default",
            }}
            onClick={canClick ? () => onConnectClick?.(platformName) : undefined}
            onMouseOver={(e) => canClick && (e.currentTarget.style.background = "rgba(232,185,49,0.2)")}
            onMouseOut={(e) => canClick && (e.currentTarget.style.background = "rgba(232,185,49,0.12)")}
          >
            {status === "connected" ? "✓ Connected" : status === "ready" ? "Connect →" : "—"}
          </div>
        );
        return (
          <div
            key={acct.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: i < ACCOUNTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{acct.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{acct.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{detail}</div>
              </div>
            </div>
            {badge}
          </div>
        );
      })}
    </div>
  );
}
