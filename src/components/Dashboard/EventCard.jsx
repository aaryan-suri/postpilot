import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import { getEventImage } from "../../utils/imageGenerator";

export default function EventCard({
  event,
  hasContent,
  approvedCount,
  totalPosts,
  onGenerate,
  onEventTypeChange,
  eventTypes = [],
  orgName = "",
}) {
  const [eventImage, setEventImage] = useState(null);
  
  useEffect(() => {
    // Generate image when component mounts or event changes
    try {
      const imageUrl = getEventImage(event, 'announcement', orgName);
      setEventImage(imageUrl);
    } catch (e) {
      console.warn('Failed to generate event image:', e);
      setEventImage(null);
    }
  }, [event.id, event.date, event.time, event.title, event.location, event.type, orgName]);
  
  return (
    <div
      style={{
        ...STYLES.card,
        padding: "22px 26px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        transition: "all 0.3s",
        cursor: "pointer",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {eventImage && (
        <img
          src={eventImage}
          alt={event.title}
          style={{
            width: 100,
            height: 100,
            objectFit: "cover",
            borderRadius: 12,
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      )}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={STYLES.sub}>📅 {event.date} · ⏰ {event.time} · 📍 {event.location}</span>
          {eventTypes.length > 0 && onEventTypeChange && (
            <select
              value={event.type || "gbm"}
              onChange={(e) => {
                e.stopPropagation();
                onEventTypeChange(event.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...STYLES.input,
                padding: "4px 10px",
                fontSize: 11,
                width: "auto",
                minWidth: 120,
              }}
            >
              {eventTypes.map((et) => (
                <option key={et.value} value={et.value}>
                  {et.label}
                </option>
              ))}
            </select>
          )}
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
