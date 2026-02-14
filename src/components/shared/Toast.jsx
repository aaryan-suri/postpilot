import React, { useEffect } from "react";

export default function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (!visible || !onHide) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(20,20,22,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "14px 24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
        fontWeight: 500,
        color: "#fff",
        animation: "toast-in 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: 18 }}>✓</span>
      {message}
    </div>
  );
}
