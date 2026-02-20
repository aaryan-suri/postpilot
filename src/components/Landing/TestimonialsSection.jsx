import React from "react";
import { STYLES } from "../../utils/styles";

const TESTIMONIALS = [
  {
    quote: "PostPilot cut our content creation time by 80%. We finally post consistently without the burnout.",
    name: "Sarah Chen",
    role: "President",
    org: "Tech Club at UMD",
    initials: "SC",
  },
  {
    quote: "The AI gets our tone perfectly. Our followers think we have a full marketing team.",
    name: "Marcus Johnson",
    role: "VP of Marketing",
    org: "Business Society",
    initials: "MJ",
  },
  {
    quote: "Set up in 10 minutes. Now our events actually get the promotion they deserve.",
    name: "Elena Rodriguez",
    role: "Social Chair",
    org: "Campus Events Board",
    initials: "ER",
  },
];

const LOGO_ORGS = ["UMD Tech Club", "Terps Business Society", "Campus Events", "Greek Life Council"];

export default function TestimonialsSection({ visible }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "60px 32px 80px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "rgba(255,255,255,0.3)",
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        Trusted by student organizations
      </h2>
      <h3
        style={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          marginBottom: 48,
        }}
      >
        What organizers are saying
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          marginBottom: 48,
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            style={{
              ...STYLES.card,
              padding: "28px 24px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.6s ease-out ${i * 80}ms, transform 0.6s ease-out ${i * 80}ms, box-shadow 0.25s ease-out, transform 0.25s ease-out`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
            }}
          >
            <p
              style={{
                ...STYLES.sub,
                fontSize: 14,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              "{t.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(232,89,49,0.3), rgba(232,185,49,0.2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {t.initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div style={{ ...STYLES.sub, fontSize: 12 }}>
                  {t.role}, {t.org}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 32,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {LOGO_ORGS.map((org, i) => (
          <div
            key={i}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 500,
            }}
          >
            {org}
          </div>
        ))}
      </div>
    </div>
  );
}
