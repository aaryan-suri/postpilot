import React from "react";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles";
import GradientButton from "../components/shared/GradientButton";

export default function AboutPage() {
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
        About
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
        We're built for student organizations
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginBottom: 32,
        }}
      >
        PostPilot was founded to solve a real problem: student orgs have the events, the energy, and the community—but they often lack the time and resources to maintain a consistent social media presence. Leadership transitions, busy schedules, and limited design skills make it hard to post regularly.
      </p>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginBottom: 32,
        }}
      >
        We built PostPilot to bridge that gap. Connect your Google Calendar, and we handle the rest: AI-generated content arcs, custom event graphics, and one-click scheduling across Instagram, Facebook, TikTok, and more. Your org's events get the promotion they deserve—without the daily grind.
      </p>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        PostPilot is designed for university clubs, Greek life, professional societies, cultural organizations, and any group that runs on events and wants to grow their audience. We're starting with student orgs at University of Maryland and expanding to campuses nationwide.
      </p>
      <GradientButton onClick={() => navigate("/contact")} size="md" withArrow>
        Get in Touch
      </GradientButton>
    </div>
  );
}
