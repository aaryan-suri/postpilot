import React from "react";
import GradientButton from "../shared/GradientButton";

export default function FinalCTASection({ onGetStarted }) {
  return (
    <div
      style={{
        position: "relative",
        margin: "0 24px 0",
        borderRadius: 20,
        padding: "80px 32px",
        background: "linear-gradient(135deg, rgba(232,89,49,0.12) 0%, rgba(232,185,49,0.06) 50%, transparent 100%)",
        border: "1px solid rgba(232,89,49,0.15)",
        boxShadow: "0 0 60px rgba(232,89,49,0.08)",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-1px",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Ready to automate your org's content?
        </h2>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Join student organizations that post consistently—without the daily grind.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <GradientButton onClick={onGetStarted} size="lg" withArrow>
            Get Started Free
          </GradientButton>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onGetStarted?.();
            }}
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            Or book a demo →
          </a>
        </div>
      </div>
    </div>
  );
}
