import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import GradientButton from "../shared/GradientButton";

export default function HeroSection({ onGetStarted }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setAnimated(true);
  }, []);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        textAlign: "center",
        padding: "100px 32px 60px",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Ambient background layers - extend beyond container for smooth blend */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(180vw, 1400px)",
          height: "min(80vh, 600px)",
          background: `radial-gradient(ellipse 80% 70% at center,
            rgba(232,89,49,0.12) 0%,
            rgba(232,185,49,0.08) 35%,
            rgba(232,185,49,0.03) 60%,
            transparent 85%)`,
          animation: "hero-glow-pulse 8s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Soft edge halo - prevents harsh cutoff */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(200vw, 1800px)",
          height: "min(100vh, 800px)",
          background: `radial-gradient(ellipse 60% 50% at center, transparent 50%, rgba(232,89,49,0.03) 75%, transparent 100%)`,
          animation: "hero-glow-drift 12s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Floating accent orbs */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${30 + i * 25}%`,
            left: `${15 + i * 35}%`,
            width: 80 + i * 40,
            height: 80 + i * 40,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(232,185,49,${0.04 - i * 0.01}) 0%, transparent 70%)`,
            filter: "blur(25px)",
            pointerEvents: "none",
            zIndex: 0,
            animation: `float-orb 15s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
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
        @keyframes hero-glow-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 1;
          }
        }
        @keyframes hero-glow-drift {
          0%, 100% {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 0.6;
          }
          33% {
            transform: translate(-50%, -50%) translate(2%, 1%);
            opacity: 0.8;
          }
          66% {
            transform: translate(-50%, -50%) translate(-1%, 2%);
            opacity: 0.7;
          }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(8px, -12px) scale(1.05); opacity: 0.8; }
          50% { transform: translate(-5px, 6px) scale(0.95); opacity: 0.5; }
          75% { transform: translate(10px, 8px) scale(1.02); opacity: 0.7; }
        }
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
