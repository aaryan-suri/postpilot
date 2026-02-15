import React, { useState, useEffect } from "react";
import { STYLES, TONES, PLATFORMS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import Navbar from "../Layout/Navbar";

export default function Onboarding({
  orgName,
  setOrgName,
  orgDesc,
  setOrgDesc,
  tone,
  setTone,
  platforms,
  togglePlatform,
  onBack,
  onLaunch,
  googleAuth,
}) {
  const { isConnected, connect, calendarId, setCalendarId, fetchWithAuth } = googleAuth || {};
  const [calendars, setCalendars] = useState([]);
  const [calendarsLoading, setCalendarsLoading] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const hasGoogleAuth = !!googleAuth && typeof googleAuth?.connect === "function";
  const canProceed =
    orgName?.trim() &&
    orgDesc?.trim() &&
    tone &&
    platforms?.length > 0 &&
    (!hasGoogleAuth || (isConnected && !!calendarId));

  useEffect(() => {
    if (isConnected && fetchWithAuth) {
      setCalendarsLoading(true);
      fetchWithAuth("/api/calendars")
        .then((r) => r.json())
        .then((d) => {
          if (d?.calendars) setCalendars(d.calendars);
        })
        .catch(console.error)
        .finally(() => setCalendarsLoading(false));
    }
  }, [isConnected, fetchWithAuth]);

  return (
    <div style={STYLES.page}>
      <Navbar
        onLogoClick={onBack}
        showBack
        rightContent={
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              padding: "8px 20px",
              borderRadius: 50,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            ← Back
          </button>
        }
      />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 32px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8 }}>
          Set up your org
        </h1>
        <p style={{ ...STYLES.sub, marginBottom: 40, fontSize: 15 }}>
          Tell PostPilot about your organization so it can match your voice.
        </p>
        <div style={{ marginBottom: 28 }}>
          <label style={STYLES.label}>ORGANIZATION NAME</label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Terrapin Tech Club"
            style={STYLES.input}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={STYLES.label}>DESCRIPTION</label>
          <textarea
            value={orgDesc}
            onChange={(e) => setOrgDesc(e.target.value)}
            placeholder="What does your org do? Who are your members? What's your vibe?"
            rows={3}
            style={{ ...STYLES.input, resize: "vertical", lineHeight: 1.5 }}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ ...STYLES.label, marginBottom: 12 }}>BRAND TONE</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)} style={STYLES.pill(tone === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 40 }}>
          <label style={{ ...STYLES.label, marginBottom: 12 }}>PLATFORMS</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                style={STYLES.pill(platforms.includes(p))}
              >
                {getPlatformIcon(p)} {p}
              </button>
            ))}
          </div>
        </div>

        {/* Google Calendar section */}
        <div
          style={{
            ...STYLES.card,
            padding: "20px 24px",
            marginBottom: 36,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {!hasGoogleAuth ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Google Calendar</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      Demo mode — loaded with sample events
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 16px",
                    borderRadius: 50,
                    background: "rgba(46,204,113,0.15)",
                    color: "#2ECC71",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ Connected
                </div>
              </div>
            </>
          ) : !isConnected ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Google Calendar</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      Connect to import your upcoming events
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setConnectError(null);
                    try {
                      if (connect) await connect();
                    } catch (err) {
                      setConnectError(err?.message || "Connect failed");
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#fff",
                    color: "#333",
                    border: "1px solid rgba(0,0,0,0.1)",
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path
                      fill="#4285F4"
                      d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                    />
                    <path
                      fill="#34A853"
                      d="M17.64 9.23c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
                    />
                    <path
                      fill="#EA4335"
                      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"
                    />
                  </svg>
                  Connect Google Calendar
                </button>
              </div>
              {connectError && (
                <div style={{ color: "#E85D31", fontSize: 13, marginTop: 4 }}>
                  {connectError}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Google Calendar</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      {calendarId
                        ? calendars.find((c) => c.id === calendarId)?.name || "Calendar selected"
                        : "Choose a calendar to sync"}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 16px",
                    borderRadius: 50,
                    background: "rgba(46,204,113,0.15)",
                    color: "#2ECC71",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ Connected
                </div>
              </div>
              {!calendarId ? (
                <div>
                  <div style={{ ...STYLES.label, marginBottom: 8 }}>Choose a calendar to sync</div>
                  {calendarsLoading ? (
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                      Loading calendars...
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {calendars.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCalendarId(c.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            color: "#fff",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: c.color || "#4285f4",
                            }}
                          />
                          {c.name}
                        </button>
                      ))}
                      {calendars.length === 0 && !calendarsLoading && (
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                          No calendars found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        calendars.find((c) => c.id === calendarId)?.color || "#4285f4",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                    {calendars.find((c) => c.id === calendarId)?.name}
                  </span>
                  <button
                    onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#E85D31",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 500,
                    }}
                  >
                    Change
                  </button>
                  {showCalendarPicker && (
                    <div
                      style={{
                        position: "absolute",
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        background: "rgba(20,20,22,0.98)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: 8,
                        zIndex: 10,
                      }}
                    >
                      {calendars.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCalendarId(c.id);
                            setShowCalendarPicker(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: "transparent",
                            border: "none",
                            borderRadius: 6,
                            color: "#fff",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 13,
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: c.color || "#4285f4",
                            }}
                          />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => canProceed && onLaunch()}
          disabled={!canProceed}
          style={{
            background: canProceed ? STYLES.grad : "rgba(255,255,255,0.08)",
            border: "none",
            width: "100%",
            padding: 16,
            borderRadius: 14,
            color: canProceed ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 16,
            fontWeight: 600,
            cursor: canProceed ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            boxShadow: canProceed ? "0 8px 32px rgba(232,89,49,0.25)" : "none",
          }}
        >
          Launch Dashboard →
        </button>
      </div>
    </div>
  );
}
