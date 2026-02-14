import React from "react";
import { STYLES } from "../../utils/styles";

const STEPS = [
  { icon: "📅", title: "Connect Calendar", desc: "Sync your Google Calendar. PostPilot reads your events automatically." },
  { icon: "🧠", title: "AI Generates Content", desc: "Smart content arcs for each event — teasers, reminders, recaps." },
  { icon: "✅", title: "Review & Approve", desc: "Quick approve or edit. One click to schedule across platforms." },
  { icon: "📈", title: "Watch It Grow", desc: "Track engagement, optimize timing, and grow your audience." },
];

export default function HowItWorks() {
  return (
    <div style={{ maxWidth: 900, margin: "60px auto 0", padding: "0 32px 80px" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "rgba(255,255,255,0.3)",
          marginBottom: 48,
          fontWeight: 500,
        }}
      >
        How it works
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              ...STYLES.card,
              padding: "32px 24px",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>{step.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{step.title}</div>
            <div style={STYLES.sub}>{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
