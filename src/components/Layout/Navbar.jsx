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
}) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 48px",
        ...style,
      }}
    >
      <NavLogo onClick={onLogoClick} showBack={showBack} />
      {rightContent}
    </nav>
  );
}
