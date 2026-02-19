import React, { useState, useEffect } from "react";
import { STYLES } from "../../utils/styles";
import { getEventImage } from "../../utils/imageGenerator";

const SAMPLE_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union, Room 2134", type: "gbm" },
  { id: 2, title: "Resume Workshop with Capital One", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall 1504", type: "workshop" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall Auditorium", type: "social" },
  { id: 4, title: "Hackathon Info Session", date: "2026-03-03", time: "6:00 PM", location: "IRB 0318", type: "info" },
  { id: 5, title: "Alumni Networking Mixer", date: "2026-03-08", time: "4:00 PM", location: "Riggs Alumni Center", type: "networking" },
];

export default function EventGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eventImages, setEventImages] = useState({});

  useEffect(() => {
    // Generate images for all events
    const images = {};
    SAMPLE_EVENTS.forEach(event => {
      try {
        images[event.id] = getEventImage(event, 'announcement', '');
      } catch (e) {
        console.warn('Failed to generate image for event:', event.id, e);
      }
    });
    setEventImages(images);
  }, []);

  useEffect(() => {
    // Auto-rotate carousel
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SAMPLE_EVENTS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SAMPLE_EVENTS.length) % SAMPLE_EVENTS.length);
  };

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
        See It In Action
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
        Beautiful event graphics,{" "}
        <span
          style={{
            background: STYLES.grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          automatically generated
        </span>
      </h3>
      
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {SAMPLE_EVENTS.map((event) => (
            <div
              key={event.id}
              style={{
                minWidth: "100%",
                display: "flex",
                alignItems: "center",
                gap: 40,
                padding: "40px",
                flexWrap: "wrap",
              }}
            >
              {eventImages[event.id] && (
                <img
                  src={eventImages[event.id]}
                  alt={event.title}
                  style={{
                    width: 320,
                    maxWidth: "100%",
                    height: 320,
                    objectFit: "cover",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: "1 1 260px", minWidth: 200 }}>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 12,
                  }}
                >
                  Sample Event
                </div>
                <h4 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
                  {event.title}
                </h4>
                <div style={{ ...STYLES.sub, marginBottom: 8 }}>
                  📅 {event.date} · ⏰ {event.time}
                </div>
                <div style={STYLES.sub}>📍 {event.location}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(10,10,11,0.8)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(10,10,11,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(10,10,11,0.8)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(10,10,11,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          →
        </button>
        
        {/* Dots indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          {SAMPLE_EVENTS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: currentIndex === index ? STYLES.grad : "rgba(255,255,255,0.2)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
