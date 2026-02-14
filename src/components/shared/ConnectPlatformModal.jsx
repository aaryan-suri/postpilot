import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import Modal from "./Modal";

const PLATFORM_BRANDING = {
  "Google Calendar": {
    icon: "📅",
    color: "#4285F4",
    bgGradient: "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)",
    name: "Google Calendar",
  },
  Instagram: {
    icon: "📸",
    color: "#E4405F",
    bgGradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    name: "Instagram",
  },
  TikTok: {
    icon: "🎵",
    color: "#00F2EA",
    bgGradient: "linear-gradient(135deg, #00F2EA 0%, #FF0050 100%)",
    name: "TikTok",
  },
  LinkedIn: {
    icon: "💼",
    color: "#0A66C2",
    bgGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
    name: "LinkedIn",
  },
  "Twitter/X": {
    icon: "🐦",
    color: "#000",
    bgGradient: "linear-gradient(135deg, #000 0%, #333 100%)",
    name: "X",
  },
};

export default function ConnectPlatformModal({ isOpen, onClose, platform, onSuccess }) {
  const [phase, setPhase] = useState("connecting"); // connecting | success

  const brand = PLATFORM_BRANDING[platform] || {
    icon: "📱",
    color: "#E85D31",
    bgGradient: STYLES.grad,
    name: platform || "Platform",
  };

  useEffect(() => {
    if (!isOpen) {
      setPhase("connecting");
      return;
    }
    const t = setTimeout(() => setPhase("success"), 2200);
    return () => clearTimeout(t);
  }, [isOpen]);

  const handleDone = () => {
    onSuccess?.(platform);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={phase === "success" ? handleDone : undefined}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div
          style={{
            width: 80,
            height: 80,
            margin: "0 auto 24px",
            borderRadius: 20,
            background: brand.bgGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
          }}
        >
          {brand.icon}
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Connect {brand.name}</h3>

        {phase === "connecting" ? (
          <>
            <div style={{ ...STYLES.sub, marginBottom: 28 }}>
              Redirecting you to {brand.name} to authorize PostPilot...
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: STYLES.grad,
                    animation: "connect-pulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "40%",
                  background: STYLES.grad,
                  borderRadius: 2,
                  animation: "connect-shimmer 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "rgba(46,204,113,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#2ECC71" }}>
              Connected!
            </div>
            <div style={{ ...STYLES.sub, marginBottom: 28 }}>
              {brand.name} is now linked to your PostPilot account.
            </div>
            <button
              onClick={handleDone}
              style={{
                background: STYLES.grad,
                border: "none",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
