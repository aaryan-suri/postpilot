import React from "react";
import { STYLES } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import Navbar from "../Layout/Navbar";
import ConnectedAccounts from "./ConnectedAccounts";
import PlanUsage from "./PlanUsage";
import TeamMembers from "./TeamMembers";

export default function Profile({
  orgName,
  orgDesc,
  tone,
  platforms,
  events,
  approvedPosts,
  generatedPosts,
  onBack,
  connectedPlatforms = [],
  onConnectClick,
  googleAuth,
  facebookAuth,
}) {
  const totalGenerated = Object.values(generatedPosts || {}).flat().length;

  return (
    <div style={STYLES.page}>
      <Navbar
        onLogoClick={onBack}
        showBack
        rightContent={
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              padding: "8px 20px",
              borderRadius: 50,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            ← Back to Dashboard
          </button>
        }
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 36px" }}
      />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: STYLES.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {orgName?.charAt(0) || "?"}
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 4 }}>
              {orgName}
            </h1>
            <p style={STYLES.sub}>Member since February 2026 · Free Plan</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 36,
          }}
        >
          {[
            { label: "Events", value: events?.length || 0, icon: "📅" },
            { label: "Generated", value: totalGenerated, icon: "✍️" },
            { label: "Approved", value: approvedPosts?.length || 0, icon: "✅" },
            { label: "Est. Reach", value: (approvedPosts?.length || 0) * 120, icon: "👥" },
          ].map((s, i) => (
            <div key={i} style={{ ...STYLES.card, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...STYLES.card, padding: 28, marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            Organization Details
          </h3>
          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <div
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 500 }}
              >
                Name
              </div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{orgName}</div>
            </div>
            <div>
              <div
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 500 }}
              >
                Description
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                {orgDesc}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Brand Tone
                </div>
                <span
                  style={{
                    padding: "6px 16px",
                    borderRadius: 50,
                    background: "rgba(232,89,49,0.1)",
                    color: "#E8A031",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {tone}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Platforms
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {platforms?.map((p) => (
                    <span
                      key={p}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 50,
                        background: "rgba(232,89,49,0.1)",
                        color: "#E8A031",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {getPlatformIcon(p)} {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConnectedAccounts
          platforms={platforms}
          connectedPlatforms={connectedPlatforms}
          onConnectClick={onConnectClick}
          googleAuth={googleAuth}
          facebookAuth={facebookAuth}
        />
        <PlanUsage totalGenerated={totalGenerated} />
        <TeamMembers orgName={orgName} />
      </div>
    </div>
  );
}
