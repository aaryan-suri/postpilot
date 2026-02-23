import React from "react";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles";
import GradientButton from "../components/shared/GradientButton";

const FEATURES = [
  {
    icon: "📅",
    title: "Calendar Sync",
    desc: "Connect your Google Calendar. PostPilot automatically reads your events and creates a content arc for each one—no manual entry required.",
  },
  {
    icon: "🧠",
    title: "AI Content Generation",
    desc: "Smart content arcs for every event: teasers, reminders, recaps, and day-of posts. Tone matches your org's brand—professional, casual, hype, or witty.",
  },
  {
    icon: "🎨",
    title: "Custom Event Graphics",
    desc: "Every event gets a custom graphic. Our AI generates on-brand visuals for announcements, reminders, and recaps across Instagram, Facebook, TikTok, and more.",
  },
  {
    icon: "✅",
    title: "Review & Approve",
    desc: "Nothing posts without your approval. Review, edit, or regenerate any post. One click to schedule across all connected platforms.",
  },
  {
    icon: "📱",
    title: "Multi-Platform Publishing",
    desc: "Post to Instagram, Facebook, TikTok, and Twitter/X from one dashboard. Platform-native formatting and best practices built in.",
  },
  {
    icon: "📈",
    title: "Analytics & Insights",
    desc: "Track engagement, optimize posting times, and see what resonates with your audience. Data-driven recommendations for growth.",
  },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 100px" }}>
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
        Features
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 16,
          lineHeight: 1.15,
        }}
      >
        Everything you need to run your org's social
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.6,
          marginBottom: 56,
          maxWidth: 600,
        }}
      >
        PostPilot turns your Google Calendar into a fully managed social media presence. No design skills. No content planning. No daily effort.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
          marginBottom: 60,
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            style={{
              ...STYLES.card,
              padding: "28px 24px",
              transition: "transform 0.25s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease-out",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.2)";
              e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ ...STYLES.sub, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <GradientButton onClick={() => navigate("/onboard")} size="lg" withArrow>
          Get Started Free
        </GradientButton>
      </div>
    </div>
  );
}
