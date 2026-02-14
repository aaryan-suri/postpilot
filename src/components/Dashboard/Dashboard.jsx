import React from "react";
import { STYLES } from "../../utils/styles";
import Navbar from "../Layout/Navbar";
import Sidebar from "../Layout/Sidebar";
import StatsRow from "./StatsRow";
import EventCard from "./EventCard";
import ContentQueue from "./ContentQueue";
import Analytics from "./Analytics";
import PhotoLibrary from "./PhotoLibrary";
import Settings from "./Settings";

const EVENT_TYPES = [
  { value: "gbm", label: "GBM / General Meeting" },
  { value: "workshop", label: "Workshop / Professional Dev" },
  { value: "social", label: "Social / Hangout" },
  { value: "info", label: "Info Session" },
  { value: "networking", label: "Networking / Mixer" },
];

export default function Dashboard({
  orgName,
  events,
  generatedPosts,
  approvedPosts,
  contentQueue,
  activeTab,
  setActiveTab,
  onProfileClick,
  onLandingClick,
  onGenerateContent,
  showAddEvent,
  setShowAddEvent,
  newEvent,
  setNewEvent,
  addEvent,
  photos = [],
  onPhotosChange,
}) {
  const stats = [
    { label: "Upcoming Events", value: events.length, icon: "📅" },
    { label: "Posts Generated", value: Object.values(generatedPosts).flat().length, icon: "✍️" },
    { label: "Approved & Queued", value: approvedPosts.length, icon: "✅" },
    { label: "Est. Reach", value: approvedPosts.length * 120, icon: "👥" },
  ];

  return (
    <div style={STYLES.page}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 36px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={onLandingClick}
        >
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginRight: 8 }}>
            {orgName}
          </span>
          <div
            onClick={onProfileClick}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: STYLES.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(232,89,49,0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {orgName?.charAt(0) || "?"}
          </div>
        </div>
      </nav>
      <div className="dashboard-layout" style={{ display: "flex", minHeight: "calc(100vh - 71px)" }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          <StatsRow stats={stats} />

          {activeTab === "upcoming" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
                  Upcoming Events
                </h2>
                <button
                  onClick={() => setShowAddEvent(true)}
                  style={{
                    background: STYLES.grad,
                    border: "none",
                    color: "#fff",
                    padding: "10px 22px",
                    borderRadius: 50,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Add Event
                </button>
              </div>

              {showAddEvent && (
                <div style={{ ...STYLES.card, padding: 28, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Add New Event</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <input
                      placeholder="Event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                      style={{ ...STYLES.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14 }}
                    />
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                      style={{ ...STYLES.input, padding: "12px 16px", fontSize: 14, colorScheme: "dark" }}
                    />
                    <input
                      placeholder="Time (e.g. 7:00 PM)"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))}
                      style={{ ...STYLES.input, padding: "12px 16px", fontSize: 14 }}
                    />
                    <input
                      placeholder="Location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))}
                      style={{ ...STYLES.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14 }}
                    />
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))}
                      style={{
                        ...STYLES.input,
                        gridColumn: "1 / -1",
                        padding: "12px 16px",
                        fontSize: 14,
                        colorScheme: "dark",
                      }}
                    >
                      {EVENT_TYPES.map((et) => (
                        <option key={et.value} value={et.value}>
                          {et.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      style={{
                        ...STYLES.input,
                        gridColumn: "1 / -1",
                        padding: "12px 16px",
                        fontSize: 14,
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button
                      onClick={addEvent}
                      style={{
                        background: STYLES.grad,
                        border: "none",
                        color: "#fff",
                        padding: "10px 24px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => setShowAddEvent(false)}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)",
                        padding: "10px 24px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[...events]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((event) => {
                    const hasContent = generatedPosts[event.id];
                    const approvedCount = approvedPosts.filter((p) => p.eventId === event.id).length;
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        hasContent={!!hasContent}
                        approvedCount={approvedCount}
                        totalPosts={hasContent ? generatedPosts[event.id].length : 0}
                        onGenerate={onGenerateContent}
                      />
                    );
                  })}
              </div>
            </>
          )}

          {activeTab === "queue" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>
                Content Queue
              </h2>
              <ContentQueue queue={contentQueue} />
            </>
          )}

          {activeTab === "analytics" && <Analytics />}
          {activeTab === "photos" && (
              <PhotoLibrary
                photos={photos}
                events={events}
                onPhotosChange={onPhotosChange || (() => {})}
              />
            )}
          {activeTab === "settings" && (
            <Settings orgName={orgName} tone={tone} platforms={platforms} />
          )}
        </div>
      </div>
    </div>
  );
}
