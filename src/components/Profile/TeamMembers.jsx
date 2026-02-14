import React from "react";
import { STYLES } from "../../utils/styles";

export default function TeamMembers({ orgName }) {
  return (
    <div style={{ ...STYLES.card, padding: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
          }}
        >
          Team Members
        </h3>
        <button
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            padding: "6px 16px",
            borderRadius: 50,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          + Invite
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: STYLES.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {orgName?.charAt(0) || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>You</div>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 50,
            background: "rgba(232,89,49,0.1)",
            color: "#E8A031",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Admin
        </span>
      </div>
    </div>
  );
}
