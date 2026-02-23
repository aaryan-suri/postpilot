import React from "react";
import { STYLES } from "../utils/styles";

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 32px 100px" }}>
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
        Legal
      </div>
      <h1
        style={{
          fontSize: "clamp(28px, 4vw, 36px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 40,
        }}
      >
        Privacy Policy
      </h1>
      <p style={{ ...STYLES.sub, marginBottom: 24 }}>
        <strong>Last updated:</strong> February 2026
      </p>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
        <Section title="1. Introduction">
          PostPilot ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services, including our AI-powered social media automation platform for student organizations.
        </Section>
        <Section title="2. Information We Collect">
          We collect information you provide directly (e.g., organization name, calendar data, social media account connections) and information from your use of our services (e.g., usage data, device information). We use Google OAuth to access your calendar and Meta/Facebook OAuth for Instagram—we only access data necessary to provide our services. We never post to your accounts without your explicit approval.
        </Section>
        <Section title="3. How We Use Your Information">
          We use your information to provide, maintain, and improve our services; to generate and schedule content on your behalf; to communicate with you; and to comply with legal obligations. We do not sell your data to third parties.
        </Section>
        <Section title="4. Data Sharing">
          We may share information with service providers that assist our operations (e.g., hosting, analytics). We require these providers to protect your data. We may disclose information if required by law or to protect our rights.
        </Section>
        <Section title="5. Data Security">
          We use industry-standard measures to protect your data, including encryption in transit and at rest. We never store your social media passwords—we use OAuth tokens that you can revoke at any time.
        </Section>
        <Section title="6. Your Rights">
          You may access, correct, or delete your data through your account settings or by contacting us. You may revoke our access to your Google Calendar or Instagram at any time. Residents of certain jurisdictions may have additional rights under applicable laws.
        </Section>
        <Section title="7. Contact">
          Questions about this policy? Contact us at{" "}
          <a href="mailto:privacy@postpilot.company" style={{ color: "#E85D31", textDecoration: "none" }}>privacy@postpilot.company</a>.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.9)" }}>{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
