import React from "react";
import { STYLES, TONES, PLATFORMS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import Navbar from "../Layout/Navbar";
import GradientButton from "../shared/GradientButton";

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
}) {
  const canProceed = orgName?.trim() && orgDesc?.trim() && tone && platforms?.length > 0;

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
        <div
          style={{
            ...STYLES.card,
            padding: "20px 24px",
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
        <button
          onClick={() => canProceed && onLaunch()}
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
