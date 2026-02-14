import React from "react";
import { STYLES } from "../../utils/styles";

const STATS = [
  ["800+", "Orgs at UMD"],
  ["73%", "Have no content strategy"],
  ["3 weeks", "Lost each leadership transition"],
];

export default function StatsSection() {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 60, padding: "50px 32px 30px", flexWrap: "wrap" }}>
      {STATS.map(([value, label], i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              background: STYLES.grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 300 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
