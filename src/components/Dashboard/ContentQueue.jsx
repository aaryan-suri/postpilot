import React, { useState, useCallback, useRef, useEffect } from "react";
import { STYLES, TYPE_COLORS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import { getEventImage } from "../../utils/imageGenerator";

export default function ContentQueue({
  queue,
  setContentQueue,
  facebookAuth,
  events = [],
  orgName = "",
}) {
  const [postingIndex, setPostingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const facebookAuthRef = useRef(facebookAuth);
  useEffect(() => {
    facebookAuthRef.current = facebookAuth;
  }, [facebookAuth]);

  const updateItemStatus = useCallback(
    (index, status, errorDetail) => {
      if (!setContentQueue) return;
      setContentQueue((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], status, errorDetail };
        }
        return next;
      });
    },
    [setContentQueue]
  );

  const handlePostToInstagram = useCallback(
    async (index) => {
      const item = queue[index];
      if (!item || item.platform !== "Instagram") return;
      const auth = facebookAuthRef.current;
      if (!auth?.isConnected || !auth?.accessToken || !auth?.igUserId) {
        setErrorMessage("Connect Instagram first (Profile → Connected Accounts).");
        return;
      }
      const event = events.find((e) => e.id === item.eventId);
      if (!event) {
        setErrorMessage("Event not found for this post.");
        return;
      }

      setPostingIndex(index);
      setErrorMessage(null);
      updateItemStatus(index, "posting");

      try {
        const dataUrl = getEventImage(event, item.type || "announcement", orgName);
        if (!dataUrl || !dataUrl.startsWith("data:image")) {
          throw new Error("Could not generate image for this post.");
        }

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Image upload failed.");
        }
        const publicUrl = uploadData.publicUrl;
        if (!publicUrl) throw new Error("No public URL returned from upload.");

        const currentAuth = facebookAuthRef.current;
        if (!currentAuth?.accessToken || !currentAuth?.igUserId) {
          throw new Error("Instagram session expired. Reconnect in Profile → Connected Accounts.");
        }
        const publishRes = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentAuth.accessToken}`,
          },
          body: JSON.stringify({
            imageUrl: publicUrl,
            caption: item.caption || "",
            igUserId: currentAuth.igUserId,
          }),
        });
        const publishData = await publishRes.json().catch(() => ({}));
        if (!publishRes.ok) {
          throw new Error(publishData.details || publishData.error || "Publish failed.");
        }

        updateItemStatus(index, "posted");
      } catch (err) {
        const msg = err.message || "Post to Instagram failed.";
        updateItemStatus(index, "failed", msg);
        setErrorMessage(msg);
      } finally {
        setPostingIndex(null);
      }
    },
    [queue, events, orgName, updateItemStatus]
  );

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
      {errorMessage && (
        <div
          style={{
            ...STYLES.card,
            padding: "12px 20px",
            background: "rgba(232,93,49,0.1)",
            border: "1px solid rgba(232,93,49,0.3)",
            color: "#E85D31",
            fontSize: 13,
          }}
        >
          {errorMessage}
        </div>
      )}
      {queue.map((post, i) => {
        const status = post.status || "scheduled";
        const isInstagram = post.platform === "Instagram";
        const canPost = isInstagram && facebookAuth?.isConnected && status === "scheduled";
        const isPosting = postingIndex === i;

        return (
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {status === "posted" && (
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: 50,
                    background: "rgba(46,204,113,0.1)",
                    color: "#2ECC71",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ Posted
                </span>
              )}
              {status === "failed" && (
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: 50,
                    background: "rgba(232,93,49,0.1)",
                    color: "#E85D31",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  title={post.errorDetail}
                >
                  Failed
                </span>
              )}
              {(status === "posting" || isPosting) && (
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: 50,
                    background: "rgba(232,185,49,0.1)",
                    color: "#E8B931",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Posting…
                </span>
              )}
              {status === "scheduled" && !isInstagram && (
                <span
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
                </span>
              )}
              {canPost && (
                <button
                  type="button"
                  onClick={() => handlePostToInstagram(i)}
                  disabled={isPosting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 600,
                    background: STYLES.grad,
                    border: "none",
                    color: "#fff",
                    cursor: isPosting ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Post to Instagram
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
