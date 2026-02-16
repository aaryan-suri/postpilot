import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import { getEventImage } from "../../utils/imageGenerator";

const FEATURED_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union", type: "gbm" },
  { id: 2, title: "Resume Workshop", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall", type: "workshop" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall", type: "social" },
];

export default function FeaturedEvents() {
  const [eventImages, setEventImages] = useState({});
  const [visibleIndex, setVisibleIndex] = useState(-1);

  useEffect(() => {
    // Generate images for featured events
    const images = {};
    FEATURED_EVENTS.forEach(event => {
      try {
        images[event.id] = getEventImage(event, 'announcement', '');
      } catch (e) {
        console.warn('Failed to generate image for event:', event.id, e);
      }
    });
    setEventImages(images);
  }, []);

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
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: visibleIndex === -1 || visibleIndex >= index ? 1 : 0.3,
              transform: visibleIndex === -1 || visibleIndex >= index 
                ? "translateY(0)" 
                : "translateY(20px)",
            }}
            onMouseEnter={() => setVisibleIndex(index)}
            onMouseLeave={() => setVisibleIndex(-1)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.borderColor = "rgba(232,89,49,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            {eventImages[event.id] && (
              <img
                src={eventImages[event.id]}
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
