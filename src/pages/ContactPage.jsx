import React, { useState } from "react";
import { STYLES } from "../utils/styles";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 32px 100px" }}>
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
        Contact
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 16,
        }}
      >
        Get in touch
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.6,
          marginBottom: 40,
        }}
      >
        Have questions about PostPilot? Want to schedule a demo for your org? We'd love to hear from you.
      </p>
      <div style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ ...STYLES.sub, marginRight: 8 }}>Email:</span>
          <a href="mailto:hello@postpilot.company" style={{ color: "#E85D31", textDecoration: "none", fontWeight: 500 }}>
            hello@postpilot.company
          </a>
        </div>
        <div>
          <span style={{ ...STYLES.sub, marginRight: 8 }}>For support or partnerships:</span>
          <a href="mailto:support@postpilot.company" style={{ color: "#E85D31", textDecoration: "none", fontWeight: 500 }}>
            support@postpilot.company
          </a>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={STYLES.label}>Name</label>
          <input type="text" name="name" required placeholder="Your name" style={STYLES.input} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={STYLES.label}>Email</label>
          <input type="email" name="email" required placeholder="you@example.com" style={STYLES.input} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={STYLES.label}>Organization (optional)</label>
          <input type="text" name="org" placeholder="Your student org" style={STYLES.input} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={STYLES.label}>Message</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            style={{ ...STYLES.input, resize: "vertical", lineHeight: 1.5 }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: STYLES.grad,
            border: "none",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: 50,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {submitted ? "Thanks! We'll be in touch." : "Send Message"}
        </button>
      </form>
      {submitted && (
        <p style={{ marginTop: 20, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
          Your message has been submitted. We typically respond within 1–2 business days.
        </p>
      )}
    </div>
  );
}
