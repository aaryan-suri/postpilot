import React, { useState, useMemo } from "react";
import { STYLES } from "../../utils/styles";
import { useEventImage } from "../../hooks/useEventImage";

function PreviewTile({ event, orgName }) {
  const {
    src,
    loading,
    error,
  } = useEventImage(event, event?.type || "announcement", orgName);

  return (
    <div
      style={{
        width: 140,
        flexShrink: 0,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,10,11,0.9)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 120,
          background: "rgba(255,255,255,0.03)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 100%)",
              backgroundSize: "200% 100%",
              animation: "pp-image-skeleton 1.2s ease-in-out infinite",
            }}
          />
        )}
        {!loading && src && !error && (
          <img
            src={src}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {!loading && (!src || error) && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: 28,
            }}
          >
            🖼️
          </div>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={event.title}
        >
          {event.title}
        </div>
        <div style={{ ...STYLES.sub, fontSize: 11, marginTop: 2 }}>
          📅 {event.date} · ⏰ {event.time}
        </div>
      </div>
    </div>
  );
}

export default function GeneratedPreviewStrip({ events, orgName }) {
  const [showAll, setShowAll] = useState(false);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const ad = a.date ? new Date(a.date) : new Date(0);
        const bd = b.date ? new Date(b.date) : new Date(0);
        return ad - bd;
      }),
    [events]
  );

  if (!sortedEvents.length) return null;

  const MAX_INITIAL = 6;
  const visibleEvents = showAll ? sortedEvents : sortedEvents.slice(0, MAX_INITIAL);

  return (
    <div
      style={{
        ...STYLES.card,
        padding: "18px 18px 14px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Generated Previews
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            Live event graphics based on your upcoming events
          </div>
        </div>
        {sortedEvents.length > MAX_INITIAL && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {showAll ? "Show fewer" : `Show all ${sortedEvents.length}`}
          </button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingTop: 6,
          paddingBottom: 2,
        }}
      >
        {visibleEvents.map((event) => (
          <PreviewTile key={event.id} event={event} orgName={orgName} />
        ))}
      </div>
    </div>
  );
}

