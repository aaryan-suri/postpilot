import React from "react";
import { STYLES, TYPE_COLORS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";

export default function ContentQueue({ queue }) {
  if (queue.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>No posts in queue yet</div>
        <div style={STYLES.sub}>Generate and approve content from your events to see them here</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {queue.map((post, i) => (
        <div
          key={i}
          style={{
            ...STYLES.card,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 22 }}>{getPlatformIcon(post.platform)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{post.eventTitle}</span>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 50,
                  fontSize: 10,
                  fontWeight: 600,
                  background: `${TYPE_COLORS[post.type] || "#666"}18`,
                  color: TYPE_COLORS[post.type] || "#666",
                  textTransform: "uppercase",
                }}
              >
                {post.type}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 400,
              }}
            >
              {post.caption}
            </div>
          </div>
          <div
            style={{
              padding: "5px 14px",
              borderRadius: 50,
              background: "rgba(46,204,113,0.1)",
              color: "#2ECC71",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Scheduled
          </div>
        </div>
      ))}
    </div>
  );
}
