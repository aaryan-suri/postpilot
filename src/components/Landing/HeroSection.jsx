import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import GradientButton from "../shared/GradientButton";

export default function HeroSection({ onGetStarted }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setAnimated(true);
  }, []);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          padding: "100px 32px 60px",
        }}
      >
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
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
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
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s",
          }}
        >
          Your calendar posts.
          <br />
          <span
            style={{
              background: STYLES.grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              animation: "gradient-shift 3s ease-in-out infinite",
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
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s",
          }}
        >
          PostPilot turns your org's Google Calendar into a fully managed social media presence. No
          design skills. No content planning. No daily effort.
        </p>
        <div
          style={{
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s",
          }}
        >
          <GradientButton onClick={onGetStarted} size="lg">
            Launch Demo →
          </GradientButton>
        </div>
      </div>
      
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
