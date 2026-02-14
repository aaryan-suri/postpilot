import React from "react";
import { STYLES } from "../../utils/styles";

export default function EventCard({ event, hasContent, approvedCount, totalPosts, onGenerate }) {
  return (
    <div
      style={{
        ...STYLES.card,
        padding: "22px 26px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s",
        cursor: "pointer",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{event.title}</span>
          {hasContent && (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 50,
                fontSize: 11,
                background: "rgba(46,204,113,0.12)",
                color: "#2ECC71",
                fontWeight: 600,
              }}
            >
              {approvedCount}/{totalPosts} approved
            </span>
          )}
        </div>
        <div style={STYLES.sub}>
          📅 {event.date} · ⏰ {event.time} · 📍 {event.location}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onGenerate(event);
        }}
        style={{
          padding: "10px 22px",
          borderRadius: 50,
          background: hasContent ? "rgba(255,255,255,0.06)" : STYLES.grad,
          border: hasContent ? "1px solid rgba(255,255,255,0.1)" : "none",
          color: hasContent ? "rgba(255,255,255,0.6)" : "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.transform = "scale(1.04)")}
        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
      >
        {hasContent ? "View Posts ↗" : "Generate Content ✨"}
      </button>
    </div>
  );
}
