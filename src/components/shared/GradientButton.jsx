import React, { useState } from "react";
import { STYLES } from "../../utils/styles";

export default function GradientButton({ children, onClick, disabled, style = {}, size = "md", withArrow = false }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const padding = size === "sm" ? "8px 20px" : size === "lg" ? "16px 44px" : "10px 28px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        background: disabled ? "rgba(255,255,255,0.08)" : hover
          ? "linear-gradient(135deg, #E8B931 0%, #E85D31 100%)"
          : STYLES.grad,
        border: "none",
        color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
        padding,
        borderRadius: 50,
        fontSize,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.18s ease-out",
        boxShadow: disabled ? "none" : hover
          ? "0 0 0 1px rgba(232,89,49,0.4), 0 8px 32px rgba(232,89,49,0.35), 0 0 24px rgba(232,89,49,0.15)"
          : "0 8px 32px rgba(232,89,49,0.25)",
        transform: pressed && !disabled ? "scale(0.97)" : "scale(1)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
      {withArrow && (
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.18s ease-out",
            transform: hover && !disabled ? "translateX(4px)" : "translateX(0)",
          }}
        >
          →
        </span>
      )}
    </button>
  );
}
