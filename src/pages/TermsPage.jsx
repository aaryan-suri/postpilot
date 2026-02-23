import React from "react";
import { STYLES } from "../utils/styles";

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p style={{ ...STYLES.sub, marginBottom: 24 }}>
        <strong>Last updated:</strong> February 2026
      </p>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
        <Section title="1. Acceptance of Terms">
          By accessing or using PostPilot's website and services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
        </Section>
        <Section title="2. Description of Service">
          PostPilot provides AI-powered social media automation for student organizations. We connect to your Google Calendar and social media accounts (e.g., Instagram, Facebook) to generate, schedule, and publish content on your behalf, subject to your approval. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
        </Section>
        <Section title="3. Account and Eligibility">
          You must be at least 18 years old or have parental consent to use our services. You are responsible for maintaining the security of your account and for all activity under it. You represent that you have the authority to connect any calendars or social accounts on behalf of your organization.
        </Section>
        <Section title="4. Acceptable Use">
          You agree not to use our services for any unlawful purpose, to impersonate others, to spam, or to violate any platform's terms (e.g., Instagram, Facebook). You agree not to attempt to circumvent any security or access controls. We may suspend or terminate accounts that violate these terms.
        </Section>
        <Section title="5. Content and Intellectual Property">
          You retain ownership of your content. By using our services, you grant us a limited license to process, display, and publish your content as necessary to provide the service. We own the PostPilot platform, branding, and technology. AI-generated content is provided for your use but we do not claim ownership of the output.
        </Section>
        <Section title="6. Disclaimer">
          Our services are provided "as is." We do not guarantee uninterrupted access, accuracy of AI-generated content, or compatibility with third-party platforms. You are responsible for reviewing and approving all content before publication.
        </Section>
        <Section title="7. Limitation of Liability">
          To the maximum extent permitted by law, PostPilot shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
        </Section>
        <Section title="8. Governing Law">
          These terms are governed by the laws of the State of Maryland, United States. Any disputes shall be resolved in the courts of Maryland.
        </Section>
        <Section title="9. Contact">
          Questions? Contact us at{" "}
          <a href="mailto:legal@postpilot.company" style={{ color: "#E85D31", textDecoration: "none" }}>legal@postpilot.company</a>.
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
