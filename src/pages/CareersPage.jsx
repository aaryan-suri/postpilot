import React from "react";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles";
import GradientButton from "../components/shared/GradientButton";

const OPENINGS = [
  {
    title: "Frontend Developer",
    team: "Engineering",
    type: "Part-time",
    location: "In-person (UMD)",
    desc: "Build and polish the PostPilot web app. You'll work on React components, UI/UX, and the dashboard that student orgs use daily. Must be a current UMD student. In-person work required.",
  },
];

export default function CareersPage() {
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
        Careers
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 16,
        }}
      >
        Join the team
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        We're a small team building tools that help student organizations thrive. If you're passionate about community, content, and technology, we'd love to hear from you.
      </p>
      <div style={{ marginBottom: 48 }}>
        {OPENINGS.map((job, i) => (
          <div
            key={i}
            style={{
              ...STYLES.card,
              padding: 28,
              marginBottom: 20,
              cursor: "pointer",
              transition: "border-color 0.25s, transform 0.25s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(232,89,49,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => navigate("/contact")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{job.title}</h3>
              <span style={{ ...STYLES.sub, fontSize: 12 }}>{job.type} · {job.location}</span>
            </div>
            <div style={{ ...STYLES.sub, marginTop: 8, marginBottom: 12 }}>{job.team}</div>
            <p style={{ ...STYLES.sub, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{job.desc}</p>
            <span style={{ fontSize: 13, color: "#E85D31", fontWeight: 500 }}>Apply →</span>
          </div>
        ))}
      </div>
      <p style={{ ...STYLES.sub, marginBottom: 24 }}>
        Don't see a fit? We're always open to meeting talented people. Reach out at{" "}
        <a href="mailto:careers@postpilot.company" style={{ color: "#E85D31", textDecoration: "none" }}>
          careers@postpilot.company
        </a>
      </p>
      <GradientButton onClick={() => navigate("/contact")} size="md" withArrow>
        Get in Touch
      </GradientButton>
    </div>
  );
}
