import React from "react";

const TRUST_ITEMS = [
  { icon: "🔐", text: "Secure Google OAuth integration." },
  { icon: "✓", text: "We never post without approval." },
  { icon: "🔒", text: "Your data is never shared." },
  { icon: "🛡️", text: "Enterprise-grade infrastructure." },
];

export default function TrustSection() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 32px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px 40px",
        }}
      >
        {TRUST_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 400,
            }}
          >
            <span style={{ fontSize: 16, opacity: 0.8 }}>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
