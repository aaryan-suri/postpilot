import React from "react";
import { STYLES } from "../../utils/styles";
import GradientButton from "../shared/GradientButton";

const PLANS = [
  {
    name: "Free",
    price: "Free during beta",
    desc: "Perfect for getting started",
    features: ["Up to 5 events/month", "AI-generated content", "Instagram & Facebook", "Basic analytics"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "Contact us",
    desc: "For growing organizations",
    features: ["Unlimited events", "Priority support", "Custom branding", "Advanced analytics", "Multi-calendar"],
    cta: "Book Demo",
    popular: true,
  },
];

export default function PricingSection({ visible, onGetStarted, onBookDemo }) {
  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "80px 32px 60px",
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
        Simple pricing
      </h2>
      <h3
        style={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 48,
        }}
      >
        Start free. Scale when you're ready.
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          justifyContent: "center",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        {PLANS.map((plan, i) => (
          <div
            key={i}
            style={{
              ...STYLES.card,
              padding: "32px 28px",
              position: "relative",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.6s ease-out ${i * 100}ms, transform 0.6s ease-out ${i * 100}ms`,
              borderColor: plan.popular ? "rgba(232,89,49,0.35)" : undefined,
              boxShadow: plan.popular ? "0 0 0 1px rgba(232,89,49,0.2)" : undefined,
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: STYLES.grad,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 50,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Most Popular
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{plan.name}</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                marginBottom: 4,
              }}
            >
              {plan.price}
            </div>
            <div style={{ ...STYLES.sub, marginBottom: 24 }}>{plan.desc}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
              {plan.features.map((f, j) => (
                <li
                  key={j}
                  style={{
                    ...STYLES.sub,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ color: "#E85D31" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <GradientButton
              onClick={plan.popular ? onBookDemo : onGetStarted}
              size="md"
              withArrow={plan.popular}
              style={{ width: "100%" }}
            >
              {plan.cta}
            </GradientButton>
          </div>
        ))}
      </div>
    </div>
  );
}
