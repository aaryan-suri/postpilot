import React from "react";
import { STYLES } from "../../utils/styles";
import GradientButton from "../shared/GradientButton";

export default function HeroSection({ onGetStarted }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "80px 32px 40px" }}>
      <div
        style={{
          display: "inline-block",
          padding: "6px 18px",
          borderRadius: 50,
          border: "1px solid rgba(232,185,49,0.3)",
          background: "rgba(232,185,49,0.08)",
          fontSize: 13,
          color: "#E8B931",
          fontWeight: 500,
          marginBottom: 28,
        }}
      >
        🚀 Built for student organizations
      </div>
      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: "-2px",
          margin: "0 0 24px",
        }}
      >
        Your calendar posts.
        <br />
        <span
          style={{
            background: STYLES.grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Automatically.
        </span>
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.55)",
          maxWidth: 520,
          margin: "0 auto 44px",
          lineHeight: 1.6,
          fontWeight: 300,
        }}
      >
        PostPilot turns your org's Google Calendar into a fully managed social media presence. No
        design skills. No content planning. No daily effort.
      </p>
      <GradientButton onClick={onGetStarted} size="lg">
        Launch Demo →
      </GradientButton>
    </div>
  );
}
