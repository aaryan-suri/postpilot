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

function formatTimeAgo(date) {
  if (!date) return "";
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  return `${Math.floor(sec / 86400)} days ago`;
}

export default function Dashboard({
  orgName,
  tone,
  platforms,
  events,
  generatedPosts,
  approvedPosts,
  contentQueue,
  setContentQueue,
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
  googleCalendarConnected,
  onConnectCalendar,
  facebookAuth,
  eventsLoading,
  eventsError,
  eventsLastSynced,
  onRefreshEvents,
  isDemoMode,
  onEventTypeChange,
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
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
                    Upcoming Events
                  </h2>
                  {googleCalendarConnected && eventsLastSynced && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                      Last synced: {formatTimeAgo(eventsLastSynced)}
                    </div>
                  )}
                  {isDemoMode && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(232,185,49,0.9)",
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      Demo Mode — using sample events
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {googleCalendarConnected && onRefreshEvents && (
                    <button
                      onClick={onRefreshEvents}
                      disabled={eventsLoading}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.7)",
                        padding: "8px 16px",
                        borderRadius: 50,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: eventsLoading ? "wait" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {eventsLoading ? "Syncing..." : "Refresh Events"}
                    </button>
                  )}
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
              </div>

              {!googleCalendarConnected && onConnectCalendar && (
                <div
                  style={{
                    ...STYLES.card,
                    padding: 28,
                    marginBottom: 24,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    Connect your Google Calendar
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 8,
                      maxWidth: 400,
                      margin: "0 auto 8px",
                    }}
                  >
                    Link your calendar to automatically import upcoming events.
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
                    During development, only approved test users can connect. You can use demo events until then.
                  </p>
                  <button
                    onClick={onConnectCalendar}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#fff",
                      color: "#333",
                      border: "1px solid rgba(0,0,0,0.1)",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 18 18">
                      <path
                        fill="#4285F4"
                        d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                      />
                      <path
                        fill="#34A853"
                        d="M17.64 9.23c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
                      />
                      <path
                        fill="#EA4335"
                        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"
                      />
                    </svg>
                    Connect Google Calendar →
                  </button>
                </div>
              )}

              {googleCalendarConnected && eventsLoading && events.length === 0 && !eventsError && (
                <div
                  style={{
                    ...STYLES.card,
                    padding: 40,
                    marginBottom: 24,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Loading events from your calendar...
                </div>
              )}

              {googleCalendarConnected && eventsError && (
                <div
                  style={{
                    ...STYLES.card,
                    padding: 28,
                    marginBottom: 24,
                    textAlign: "center",
                    border: "1px solid rgba(232,89,49,0.3)",
                    background: "rgba(232,89,49,0.08)",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 12 }}>⚠️</div>
                  <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 16, fontSize: 14 }}>
                    {eventsError}
                  </p>
                  {onRefreshEvents && (
                    <button
                      onClick={onRefreshEvents}
                      style={{
                        background: STYLES.grad,
                        border: "none",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {googleCalendarConnected && !eventsLoading && !eventsError && events.length === 0 && (
                <div
                  style={{
                    ...STYLES.card,
                    padding: 40,
                    marginBottom: 24,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>📅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    No upcoming events
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      maxWidth: 400,
                      margin: "0 auto",
                    }}
                  >
                    Your calendar is connected but there are no events in the next 60 days. Add
                    events to your Google Calendar and they&apos;ll show up here automatically.
                  </p>
                </div>
              )}

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
                        onEventTypeChange={onEventTypeChange}
                        eventTypes={EVENT_TYPES}
                        orgName={orgName}
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
              <ContentQueue
                queue={contentQueue}
                setContentQueue={setContentQueue}
                facebookAuth={facebookAuth}
                events={events}
                orgName={orgName}
              />
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
