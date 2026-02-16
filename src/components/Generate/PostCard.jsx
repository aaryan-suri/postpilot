import React, { useState, useEffect } from "react";
import { STYLES, TYPE_COLORS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import { getEventImage, generateCountdownImage } from "../../utils/imageGenerator";

function getPlatformFooter(platform, caption) {
  if (platform === "Instagram") {
    return (
      <div style={{ display: "flex", gap: 24, padding: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 18 }}>
        <span>♥</span><span>💬</span><span>↗</span>
      </div>
    );
  }
  if (platform === "TikTok") {
    return (
      <div style={{ display: "flex", gap: 12, padding: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        <span>🎵</span> Add sound
      </div>
    );
  }
  if (platform === "LinkedIn") {
    return (
      <div style={{ padding: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        Professional · 2nd degree
      </div>
    );
  }
  if (platform === "Twitter/X") {
    const len = (caption?.length || 0);
    return (
      <div style={{ padding: "8px 0 0", fontSize: 12, color: len > 280 ? "#E85D31" : "rgba(255,255,255,0.35)" }}>
        {len}/280
      </div>
    );
  }
  return null;
}

export default function PostCard({
  post,
  postIndex,
  isApproved,
  onApprove,
  onEdit,
  onUpdateCaption,
  selectedPhoto,
  eventPhotos,
  onSelectPhoto,
  event,
  orgName = "",
}) {
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [generatedImage, setGeneratedImage] = useState(null);
  // Tracks current calendar day so reminder countdown images refresh when the day changes
  const [todayKey, setTodayKey] = useState(() => new Date().toDateString());
  const typeColor = TYPE_COLORS[post.type] || "#666";
  const hasEventPhotos = eventPhotos && eventPhotos.length > 0;
  
  // Update todayKey when the calendar day changes (e.g. user keeps screen open past midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toDateString();
      setTodayKey((prev) => (prev !== now ? now : prev));
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!selectedPhoto && event) {
      // Generate image based on post type
      if (post.type === 'reminder' && event.date) {
        try {
          const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
          const imageUrl = generateCountdownImage(event, daysUntil, orgName);
          setGeneratedImage(imageUrl);
        } catch (e) {
          // Invalid date, fall back to regular image
          const imageUrl = getEventImage(event, post.type || 'announcement', orgName);
          setGeneratedImage(imageUrl);
        }
      } else {
        const imageUrl = getEventImage(event, post.type || 'announcement', orgName);
        setGeneratedImage(imageUrl);
      }
    } else {
      setGeneratedImage(null);
    }
  }, [post.type, event, selectedPhoto, orgName, todayKey]);

  const handleSaveEdit = () => {
    onUpdateCaption?.(editCaption);
    setEditing(false);
  };

  React.useEffect(() => {
    setEditCaption(post.caption);
  }, [post.caption]);

  const handleCancelEdit = () => {
    setEditCaption(post.caption);
    setEditing(false);
  };

  return (
    <div
      style={{
        ...STYLES.card,
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>{getPlatformIcon(post.platform)}</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{post.platform}</span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 600,
              background: `${typeColor}18`,
              color: typeColor,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {post.type}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>⏱ {post.timing}</div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {/* Visual / Photo picker */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: selectedPhoto || generatedImage ? "1px solid rgba(255,255,255,0.15)" : "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {selectedPhoto ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <img
                src={selectedPhoto.dataUrl}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {post.visual_suggestion}
                </div>
                {hasEventPhotos && (
                  <button
                    onClick={() => onSelectPhoto?.(null)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          ) : generatedImage ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <img
                src={generatedImage}
                alt={post.visual_suggestion}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {post.visual_suggestion}
                </div>
                {hasEventPhotos && (
                  <button
                    onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(232,89,49,0.4)",
                      background: "rgba(232,89,49,0.1)",
                      color: "#E8A031",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {showPhotoPicker ? "Cancel" : "📷 Use your photo instead"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ fontSize: 32, opacity: 0.3 }}>🖼️</span>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  {post.visual_suggestion}
                </div>
                {hasEventPhotos && (
                  <button
                    onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                    style={{
                      marginTop: 8,
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(232,89,49,0.4)",
                      background: "rgba(232,89,49,0.1)",
                      color: "#E8A031",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {showPhotoPicker ? "Cancel" : "📷 Pick a photo"}
                  </button>
                )}
              </div>
            </div>
          )}

          {showPhotoPicker && hasEventPhotos && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
                gap: 8,
              }}
            >
              {eventPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    onSelectPhoto?.(photo);
                    setShowPhotoPicker(false);
                  }}
                  style={{
                    padding: 0,
                    border: "2px solid transparent",
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "none",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(232,89,49,0.6)")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "transparent")}
                >
                  <img
                    src={photo.dataUrl}
                    alt=""
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {editing ? (
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                padding: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                color: "#fff",
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: "none",
                  background: STYLES.grad,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 12,
              whiteSpace: "pre-line",
            }}
          >
            {post.caption}
          </div>
        )}
        {post.hashtags && (
          <div style={{ fontSize: 13, color: "#E8A031", marginTop: 8 }}>{post.hashtags}</div>
        )}
        {getPlatformFooter(post.platform, post.caption)}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        {isApproved ? (
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 50,
              background: "rgba(46,204,113,0.12)",
              color: "#2ECC71",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✓ Approved & Queued
          </div>
        ) : (
          <>
            <button
              onClick={onApprove}
              style={{
                background: STYLES.grad,
                border: "none",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✓ Approve
            </button>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                padding: "8px 20px",
                borderRadius: 50,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              ✏️ Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
