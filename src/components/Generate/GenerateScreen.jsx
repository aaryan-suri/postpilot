import React from "react";
import { STYLES } from "../../utils/styles";
import Navbar from "../Layout/Navbar";
import ProgressBar from "./ProgressBar";
import PostCard from "./PostCard";

export default function GenerateScreen({
  selectedEvent,
  posts,
  generating,
  generationProgress,
  tone,
  orgName,
  approvedPosts,
  onBack,
  onApprovePost,
  onEditPost,
}) {
  return (
    <div style={STYLES.page}>
      <Navbar
        onLogoClick={onBack}
        showBack
        rightContent={
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              padding: "8px 20px",
              borderRadius: 50,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            ← Back to Dashboard
          </button>
        }
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 36px" }}
      />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 10,
              fontWeight: 500,
            }}
          >
            Content Arc For
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 6 }}>
            {selectedEvent?.title}
          </h1>
          <div style={STYLES.sub}>
            📅 {selectedEvent?.date} · ⏰ {selectedEvent?.time} · 📍 {selectedEvent?.location}
          </div>
        </div>

        {generating ? (
          <ProgressBar
            progress={generationProgress}
            tone={tone}
            orgName={orgName}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {posts.map((post, i) => {
              const isApproved = approvedPosts.some(
                (a) => a.eventId === selectedEvent?.id && a.caption === post.caption
              );
              return (
                <PostCard
                  key={i}
                  post={post}
                  isApproved={isApproved}
                  onApprove={() => onApprovePost(selectedEvent?.id, i)}
                  onEdit={() => onEditPost?.(post, i)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
