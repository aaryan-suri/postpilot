import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";

const ACCOUNTS = [
  { name: "Google Calendar", icon: "📅", statusKey: "calendar" },
  { name: "Instagram", icon: "📸", statusKey: "instagram" },
  { name: "TikTok", icon: "🎵", statusKey: "tiktok" },
  { name: "LinkedIn", icon: "💼", statusKey: "linkedin" },
  { name: "Twitter/X", icon: "🐦", statusKey: "twitter" },
];

export default function ConnectedAccounts({
  platforms,
  connectedPlatforms = [],
  onConnectClick,
  googleAuth,
  facebookAuth,
}) {
  const [calendarName, setCalendarName] = useState(null);
  const isGoogleConnected = googleAuth?.isConnected;
  const calendarId = googleAuth?.calendarId;
  const isInstagramConnected = facebookAuth?.isConnected;

  useEffect(() => {
    if (isGoogleConnected && calendarId && googleAuth?.fetchWithAuth) {
      googleAuth.fetchWithAuth("/api/calendars")
        .then((r) => r.json())
        .then((d) => {
          const cal = d?.calendars?.find((c) => c.id === calendarId);
          if (cal) setCalendarName(cal.name);
        })
        .catch(() => {});
    } else {
      setCalendarName(null);
    }
  }, [isGoogleConnected, calendarId, googleAuth?.fetchWithAuth]);

  const getStatus = (key) => {
    if (key === "calendar") {
      if (isGoogleConnected) {
        return {
          status: "connected",
          detail: calendarName || "Connected",
          canClick: true,
          canDisconnect: true,
        };
      }
      return { status: "ready", detail: "Connect to sync events", canClick: true, platformName: "Google Calendar" };
    }
    const platformName = key === "instagram" ? "Instagram" : key === "tiktok" ? "TikTok" : key === "twitter" ? "Twitter/X" : "LinkedIn";
    const selected = platforms?.includes(platformName);
    const connected = key === "instagram" ? isInstagramConnected : connectedPlatforms?.includes(platformName);
    if (connected) return { status: "connected", detail: "Connected", canClick: true, canDisconnect: key === "instagram" };
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
        const { status, detail, canClick, platformName, canDisconnect } = getStatus(acct.statusKey);
        const isCalendar = acct.statusKey === "calendar";
        const badge = (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {status === "connected" && (
              <span
                style={{
                  padding: "5px 14px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(46,204,113,0.12)",
                  color: "#2ECC71",
                }}
              >
                ✓ Connected
              </span>
            )}
            {status === "ready" && (
              <div
                style={{
                  padding: "5px 14px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(232,185,49,0.12)",
                  color: "#E8B931",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isCalendar && googleAuth?.connect) return googleAuth.connect();
                  if (acct.statusKey === "instagram" && facebookAuth?.connect) return facebookAuth.connect();
                  onConnectClick?.(platformName);
                }}
              >
                Connect →
              </div>
            )}
            {status === "none" && (
              <span
                style={{
                  padding: "5px 14px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                —
              </span>
            )}
            {canDisconnect && isCalendar && googleAuth?.disconnect && (
              <button
                type="button"
                onClick={googleAuth.disconnect}
                style={{
                  padding: "5px 12px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Disconnect
              </button>
            )}
            {canDisconnect && acct.statusKey === "instagram" && facebookAuth?.disconnect && (
              <button
                type="button"
                onClick={facebookAuth.disconnect}
                style={{
                  padding: "5px 12px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Disconnect
              </button>
            )}
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
