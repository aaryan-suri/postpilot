import React from "react";
import { STYLES } from "../../utils/styles";

export default function GradientButton({ children, onClick, disabled, style = {}, size = "md" }) {
  const padding = size === "sm" ? "8px 20px" : size === "lg" ? "16px 44px" : "10px 28px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(255,255,255,0.08)" : STYLES.grad,
        border: "none",
        color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
        padding,
        borderRadius: 50,
        fontSize,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: disabled ? "none" : "0 8px 32px rgba(232,89,49,0.25)",
        ...style,
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.target.style.transform = "scale(1.03)";
          e.target.style.boxShadow = "0 12px 40px rgba(232,89,49,0.35)";
        }
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = disabled ? "none" : "0 8px 32px rgba(232,89,49,0.25)";
      }}
      onMouseDown={(e) => {
        if (!disabled) e.target.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        if (!disabled) e.target.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}
