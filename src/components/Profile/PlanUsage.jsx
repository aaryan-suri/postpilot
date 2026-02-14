import React from "react";
import { STYLES } from "../../utils/styles";

export default function PlanUsage({ totalGenerated }) {
  const usage = [
    { label: "Posts This Month", used: totalGenerated, max: 8 },
    { label: "Calendars", used: 1, max: 1 },
  ];

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
        Plan & Usage
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Free Plan</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            1 calendar · 8 posts/month · 1 platform
          </div>
        </div>
        <button
          style={{
            background: STYLES.grad,
            border: "none",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 50,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Upgrade to Pro →
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {usage.map((u, i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
              {u.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {u.used}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>/ {u.max}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (u.used / u.max) * 100)}%`,
                  height: 4,
                  borderRadius: 2,
                  background: STYLES.grad,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
