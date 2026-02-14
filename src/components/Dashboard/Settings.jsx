import React from "react";
import { STYLES } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";

export default function Settings({ orgName, tone, platforms = [] }) {
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>
        Settings
      </h2>
      <div style={{ ...STYLES.card, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={STYLES.label}>Organization</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{orgName || "—"}</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={STYLES.label}>Tone</div>
          <div style={{ fontSize: 14 }}>{tone || "—"}</div>
        </div>
        <div>
          <div style={STYLES.label}>Platforms</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(platforms || []).map((p) => (
            <span
              key={p}
              style={{
                padding: "5px 14px",
                borderRadius: 50,
                background: "rgba(232,89,49,0.1)",
                color: "#E8A031",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {getPlatformIcon(p)} {p}
            </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
