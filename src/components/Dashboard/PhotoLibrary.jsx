import React, { useState, useRef } from "react";
import { STYLES } from "../../utils/styles";

const ACCEPT_TYPES = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_SIZE_MB = 5;

function PhotoGridItem({ photo, events, onTagChange, onRemove }) {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        aspectRatio: "1",
        background: "rgba(255,255,255,0.03)",
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <img
        src={photo.dataUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {hovering && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagDropdown(!showTagDropdown);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {photo.tag ? `📌 ${photo.tag}` : "Tag event"}
            </button>
            <button
              onClick={() => onRemove(photo.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: "rgba(231,76,60,0.8)",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
          {showTagDropdown && (
            <div
              style={{
                background: "rgba(20,20,22,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: 8,
                maxHeight: 160,
                overflowY: "auto",
              }}
            >
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    onTagChange(photo.id, ev.title, ev.id);
                    setShowTagDropdown(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    border: "none",
                    background: photo.tag === ev.title ? "rgba(232,89,49,0.2)" : "transparent",
                    color: "#fff",
                    fontSize: 13,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    borderRadius: 6,
                  }}
                >
                  {ev.title}
                </button>
              ))}
              <button
                onClick={() => {
                  onTagChange(photo.id, null, null);
                  setShowTagDropdown(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: 6,
                }}
              >
                Clear tag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PhotoLibrary({ photos, events, onPhotosChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFiles = (fileList) => {
    setError(null);
    const accepted = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const files = Array.from(fileList).filter((f) => {
      if (!accepted.includes(f.type)) {
        setError(`Skipped ${f.name}: only JPG, PNG, WebP allowed`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Skipped ${f.name}: max ${MAX_SIZE_MB}MB`);
        return false;
      }
      return true;
    });

    if (files.length === 0) return;

    let done = 0;
    const results = [];

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        results.push({
          id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`,
          dataUrl: e.target.result,
          tag: null,
          tagEventId: null,
        });
        done++;
        if (done === files.length) {
          onPhotosChange([...photos, ...results]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleTagChange = (photoId, tagTitle, tagEventId) => {
    onPhotosChange(
      photos.map((p) =>
        p.id === photoId ? { ...p, tag: tagTitle, tagEventId: tagEventId ?? null } : p
      )
    );
  };

  const handleRemove = (photoId) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          ...STYLES.card,
          border: `2px dashed ${dragActive ? "rgba(232,89,49,0.5)" : "rgba(255,255,255,0.1)"}`,
          padding: 50,
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Drop photos here or click to upload
        </div>
        <div style={{ ...STYLES.sub, maxWidth: 400, margin: "0 auto" }}>
          JPG, PNG, or WebP — max {MAX_SIZE_MB}MB each
        </div>
        {error ? (
          <div style={{ color: "#E85D31", fontSize: 13, marginTop: 12 }}>{error}</div>
        ) : null}
      </div>

      {photos.length > 0 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 28, marginBottom: 16 }}>
            Your photos ({photos.length})
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 16,
            }}
          >
            {photos.map((photo) => (
              <PhotoGridItem
                key={photo.id}
                photo={photo}
                events={events}
                onTagChange={handleTagChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
