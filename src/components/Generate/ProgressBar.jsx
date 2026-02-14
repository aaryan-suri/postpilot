import React from "react";
import { STYLES } from "../../utils/styles";

export default function ProgressBar({ progress, tone, orgName }) {
  const message =
    progress < 30
      ? "📡  Analyzing event details..."
      : progress < 60
      ? "🧠  Crafting content arcs..."
      : progress < 90
      ? "🎨  Optimizing for each platform..."
      : "✅  Finalizing posts...";

  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div
        style={{
          width: 240,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
          margin: "0 auto 28px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: 6,
            borderRadius: 3,
            background: STYLES.grad,
            transition: "width 0.4s ease-out",
          }}
        />
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{message}</div>
      <div style={STYLES.sub}>
        Generating {tone?.toLowerCase()} content tailored to {orgName}
      </div>
    </div>
  );
}
