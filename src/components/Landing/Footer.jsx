import React from "react";
import { Link, useLocation } from "react-router-dom";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Demo", path: "/demo" },
  ],
  Company: [
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Careers", path: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
  ],
};

const SOCIAL_ICONS = [
  { label: "Instagram", href: "#", icon: "📸" },
  { label: "LinkedIn", href: "#", icon: "💼" },
  { label: "Twitter", href: "#", icon: "🐦" },
];

export default function Footer() {
  const location = useLocation();
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 32px 32px",
        marginTop: 60,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 40,
          marginBottom: 40,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              marginBottom: 24,
            }}
          >
            PostPilot
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {SOCIAL_ICONS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  fontSize: 18,
                  opacity: 0.5,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = 1;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = 0.5;
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {Object.entries(FOOTER_LINKS).map(([col, links]) => (
          <div key={col}>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "rgba(255,255,255,0.3)",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {col}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {links.map((link) => (
                <li key={link.label} style={{ marginBottom: 10 }}>
                  <Link
                    to={link.path}
                    style={{
                      fontSize: 13,
                      color: location.pathname === link.path ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (location.pathname !== link.path) e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                    }}
                    onMouseOut={(e) => {
                      if (location.pathname !== link.path) e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        © {new Date().getFullYear()} PostPilot. All rights reserved.
      </div>
    </footer>
  );
}
