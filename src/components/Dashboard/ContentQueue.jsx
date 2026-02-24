import React, { useState, useCallback, useRef, useEffect } from "react";
import { STYLES, TYPE_COLORS } from "../../utils/styles";
import { getPlatformIcon } from "../shared/PlatformIcon";
import { useEventImage } from "../../hooks/useEventImage";
import { getEventImageSrc } from "../../utils/eventImageService";

export default function ContentQueue({
  queue,
  setContentQueue,
  facebookAuth,
  events = [],
  orgName = "",
}) {
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
    async (index, imageSrcFromHook) => {
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

      setErrorMessage(null);
      updateItemStatus(index, "posting");

      try {
        let dataUrl = imageSrcFromHook;

        if (!dataUrl) {
          dataUrl = await getEventImageSrc(event, item.type || "announcement", orgName);
        }

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
      {queue.map((post, i) => (
        <QueueItemRow
          key={i}
          index={i}
          post={post}
          events={events}
          orgName={orgName}
          facebookAuth={facebookAuth}
          onPost={handlePostToInstagram}
        />
      ))}
    </div>
  );
}

function QueueItemRow({ index, post, events, orgName, facebookAuth, onPost }) {
  const status = post.status || "scheduled";
  const isInstagram = post.platform === "Instagram";
  const canPost = isInstagram && facebookAuth?.isConnected && status === "scheduled";
  const event = events.find((e) => e.id === post.eventId);
  const {
    src: previewSrc,
    loading: imageLoading,
    error: imageError,
  } = useEventImage(event || null, post.type || "announcement", orgName);

  return (
    <div
      style={{
        ...STYLES.card,
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {imageLoading && (
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
        {!imageLoading && previewSrc && !imageError && (
          <img
            src={previewSrc}
            alt={post.eventTitle}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {!imageLoading && (!previewSrc || imageError) && (
          <span style={{ fontSize: 26, opacity: 0.35 }}>🖼️</span>
        )}
      </div>
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
        {status === "posting" && (
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
            onClick={() => onPost(index, previewSrc)}
            disabled={status === "posting"}
            style={{
              padding: "8px 16px",
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 600,
              background: STYLES.grad,
              border: "none",
              color: "#fff",
              cursor: status === "posting" ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Post to Instagram
          </button>
        )}
      </div>
    </div>
  );
}

