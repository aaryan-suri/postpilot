import React, { useState } from "react";
import MarketingLayout from "../components/Layout/MarketingLayout";
import Navbar from "../components/Layout/Navbar";
import { STYLES } from "../utils/styles";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("sending");
    setError(null);
    try {
      await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <div style={STYLES.page}>
      <Navbar onLogoClick={() => (window.location.href = "/")} />
      <div
        style={{
          maxWidth: 480,
          margin: "40px auto 80px",
          padding: "32px 28px",
          borderRadius: 18,
          background: "rgba(15,15,18,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.6px",
            marginBottom: 6,
          }}
        >
          Sign in to PostPilot
        </h1>
        <p style={{ ...STYLES.sub, marginBottom: 24 }}>
          No password needed — we’ll email you a one-time magic link.
        </p>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={STYLES.label}>WORK OR SCHOOL EMAIL</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
            style={{ ...STYLES.input, padding: "12px 14px", fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              marginTop: 6,
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              background: STYLES.grad,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: status === "sending" ? "wait" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 12px 40px rgba(232,89,49,0.45)",
            }}
          >
            {status === "sending" ? "Sending link…" : "Email me a login link"}
          </button>
        </form>
        {status === "sent" && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(46,204,113,0.12)",
              border: "1px solid rgba(46,204,113,0.4)",
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Check your email for a link to sign in. In local dev, the link is also printed to
            the server console if email isn&apos;t configured.
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(232,93,49,0.12)",
              border: "1px solid rgba(232,93,49,0.4)",
              fontSize: 13,
              color: "#F7B199",
            }}
          >
            {error || "Something went wrong. Please try again."}
          </div>
        )}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <div>Just want to kick the tires?</div>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/onboard";
            }}
            style={{
              alignSelf: "flex-start",
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "transparent",
              color: "rgba(255,255,255,0.78)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Try demo without logging in →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <MarketingLayout>
      <LoginInner />
    </MarketingLayout>
  );
}

