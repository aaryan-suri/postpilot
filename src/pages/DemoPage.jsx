import React from "react";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles";
import GradientButton from "../components/shared/GradientButton";

export default function DemoPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 32px 100px" }}>
      <div
        style={{
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "rgba(255,255,255,0.3)",
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        Demo
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 24,
          lineHeight: 1.15,
        }}
      >
        Try PostPilot in 60 seconds
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginBottom: 40,
        }}
      >
        Launch our interactive demo and experience PostPilot without connecting your calendar. You'll see sample events from a student org, generate AI content, and explore the full workflow—from content arcs to approval and scheduling.
      </p>
      <div
        style={{
          ...STYLES.card,
          padding: 32,
          marginBottom: 40,
          borderLeft: "4px solid #E85D31",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>What you'll experience</h3>
        <ul style={{ ...STYLES.sub, listStyle: "none", padding: 0, margin: 0 }}>
          {[
            "Sample events (GBM, workshops, socials) with custom graphics",
            "AI-generated content arcs for each event",
            "Review & approve flow with editing",
            "Content queue and scheduling preview",
            "Dashboard and analytics views",
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#E85D31" }}>✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <GradientButton onClick={() => navigate("/onboard")} size="lg" withArrow>
          Launch Demo
        </GradientButton>
        <p style={{ ...STYLES.sub, fontSize: 13 }}>
          No sign-up required. Connect Google Calendar later to use your real events.
        </p>
      </div>
    </div>
  );
}
