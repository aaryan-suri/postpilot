import React, { useEffect } from "react";
import { STYLES } from "../../utils/styles";

export default function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          ...STYLES.card,
          maxWidth: 480,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 28,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
