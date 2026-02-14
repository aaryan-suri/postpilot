import React from "react";

const SIDEBAR_ITEMS = [
  { label: "Upcoming Events", tab: "upcoming", icon: "📅" },
  { label: "Content Queue", tab: "queue", icon: "📝" },
  { label: "Analytics", tab: "analytics", icon: "📊" },
  { label: "Photo Library", tab: "photos", icon: "📸" },
  { label: "Settings", tab: "settings", icon: "⚙️" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div
      className="sidebar-nav"
      style={{
        width: 220,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 16px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {SIDEBAR_ITEMS.map((item) => (
        <button
          key={item.tab}
          onClick={() => onTabChange(item.tab)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: activeTab === item.tab ? "rgba(232,89,49,0.1)" : "transparent",
            color: activeTab === item.tab ? "#E8A031" : "rgba(255,255,255,0.45)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: activeTab === item.tab ? 600 : 400,
            textAlign: "left",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
