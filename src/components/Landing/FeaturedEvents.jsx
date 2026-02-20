import React, { useState } from "react";
import { STYLES } from "../../utils/styles";

// Static event graphics (custom-designed posters)
const EVENT_IMAGES = {
  1: "/events/spring-gbm.png",
  2: "/events/resume-workshop.png",
  3: "/events/movie-night.png",
};

const FEATURED_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union", type: "gbm" },
  { id: 2, title: "Resume Workshop", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall", type: "workshop" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall", type: "social" },
];

export default function FeaturedEvents({ visible }) {
  const [visibleIndex, setVisibleIndex] = useState(-1);

  return (
    <div style={{ maxWidth: 1200, margin: "80px auto", padding: "0 32px" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "rgba(255,255,255,0.3)",
          marginBottom: 16,
          fontWeight: 500,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        Featured Events
      </h2>
      <h3
        style={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: 48,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease-out 80ms, transform 0.6s ease-out 80ms",
        }}
      >
        Every event gets a{" "}
        <span
          style={{
            background: STYLES.grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          custom graphic
        </span>
      </h3>
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {FEATURED_EVENTS.map((event, index) => (
          <div
            key={event.id}
            style={{
              ...STYLES.card,
              padding: 0,
              overflow: "hidden",
              cursor: "pointer",
              willChange: "transform",
              opacity: visibleIndex === -1 || visibleIndex >= index ? 1 : 0.3,
              transform: visibleIndex === -1 || visibleIndex >= index 
                ? "translateY(0) scale(1)" 
                : "translateY(20px) scale(1)",
              transition: "transform 0.25s ease-out, opacity 0.25s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease-out",
            }}
            onMouseEnter={() => setVisibleIndex(index)}
            onMouseLeave={() => setVisibleIndex(-1)}
            onMouseOver={(e) => {
              if (visibleIndex === -1 || visibleIndex >= index) {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(232,89,49,0.25)";
                e.currentTarget.style.borderColor = "rgba(232,89,49,0.35)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            {EVENT_IMAGES[event.id] && (
              <img
                src={EVENT_IMAGES[event.id]}
                alt={event.title}
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            <div style={{ padding: "24px" }}>
              <h4
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </h4>
              <div style={{ ...STYLES.sub, marginBottom: 6 }}>
                📅 {event.date} · ⏰ {event.time}
              </div>
              <div style={STYLES.sub}>📍 {event.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
