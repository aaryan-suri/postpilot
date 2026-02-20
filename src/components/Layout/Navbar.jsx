import React from "react";
import { STYLES } from "../../utils/styles";

function NavLogo({ onClick, showBack }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      onClick={onClick}
    >
      {showBack && (
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, marginRight: 2 }}>‹</span>
      )}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: STYLES.grad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        ✈
      </div>
      <span style={{ fontSize: 18, fontWeight: 700 }}>PostPilot</span>
    </div>
  );
}

export default function Navbar({
  onLogoClick,
  showBack = false,
  rightContent,
  style = {},
  scrolled = false,
}) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: scrolled ? "14px 48px" : "24px 48px",
        background: scrolled ? "rgba(10,10,11,0.75)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.2)" : "none",
        transition: "padding 0.2s ease-out, background 0.2s ease-out, backdrop-filter 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out",
        ...style,
      }}
    >
      <NavLogo onClick={onLogoClick} showBack={showBack} />
      {rightContent}
    </nav>
  );
}
