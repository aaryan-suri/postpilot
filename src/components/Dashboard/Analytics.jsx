import React, { useEffect, useState, useMemo } from "react";
import { STYLES } from "../../utils/styles";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { track } from "../../lib/analytics";
import { useAuth } from "../../context/AuthContext.jsx";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const CHART_COLORS = {
  generated: "#E8A031",
  approved: "#2ECC71",
  published: "#4DA3FF",
  failed: "#E85D31",
};

const PLATFORM_COLORS = ["#E1306C", "#1DA1F2", "#25D366", "#FF4500", "#9B59B6"];

const IS_DEV = import.meta.env?.MODE !== "production";

function formatPercent(value) {
  if (!value || Number.isNaN(value)) return "0%";
  return `${(value * 100).toFixed(0)}%`;
}

function formatMinutes(value) {
  if (!value || Number.isNaN(value)) return "–";
  return `${value.toFixed(1)} min`;
}

export default function Analytics() {
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const { activeOrgId } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics/summary?range=${encodeURIComponent(range)}&orgId=default`);
        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (!res.ok) {
          throw new Error(data?.error || `Request failed with status ${res.status}`);
        }
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load analytics");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const dailyChartData = useMemo(() => {
    if (!summary?.daily_rollups) return [];
    return summary.daily_rollups.map((d) => ({
      date: d.date.slice(5),
      generated: d.generated_count,
      approved: d.approved_count,
      published: d.published_count,
      failed: d.failed_publish_count,
    }));
  }, [summary]);

  const topEventsData = useMemo(() => {
    if (!summary?.top_events_by_posts) return [];
    return summary.top_events_by_posts.map((e) => ({
      name: e.title || e.eventId || "Unknown",
      count: e.count,
    }));
  }, [summary]);

  const platformData = useMemo(() => {
    if (!summary?.platform_breakdown) return [];
    return Object.entries(summary.platform_breakdown).map(([platform, info]) => ({
      name: platform,
      value: info.published || info.approved || info.generated || 0,
    }));
  }, [summary]);

  const totals = summary?.totals || {};
  const breakdown = totals.events_ingested_breakdown || {};

  const handleTestEvent = async () => {
    try {
      await track(
        "event_ingested",
        {
          calendarSource: "demo",
          count: 1,
          test: true,
        },
        { orgId: activeOrgId || undefined }
      );
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Analytics Overview
          </h2>
          <div style={STYLES.sub}>
            See how your generated content is flowing from events to published posts.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    range === opt.value ? "rgba(232,89,49,0.16)" : "transparent",
                  color:
                    range === opt.value ? "#E8A031" : "rgba(255,255,255,0.65)",
                  fontSize: 12,
                  fontWeight: range === opt.value ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {IS_DEV && (
            <button
              type="button"
              onClick={handleTestEvent}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px dashed rgba(255,255,255,0.25)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Emit test event
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div
          style={{
            ...STYLES.card,
            padding: 32,
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Loading analytics…
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            ...STYLES.card,
            padding: 20,
            border: "1px solid rgba(232,89,49,0.4)",
            background: "rgba(232,89,49,0.1)",
            fontSize: 13,
            color: "#fff",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                ✍️ Posts Generated
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-1px",
                }}
              >
                {totals.generated_count || 0}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                ✅ Approval Rate
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-1px",
                }}
              >
                {formatPercent(totals.approval_rate)}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                📣 Posts Published
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-1px",
                }}
              >
                {totals.published_count || 0}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                ⚠ Publish Failure Rate
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-1px",
                  color: totals.publish_failure_rate ? "#E85D31" : "#fff",
                }}
              >
                {formatPercent(totals.publish_failure_rate)}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                ⏱ Avg Generate → Approve
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-0.5px",
                }}
              >
                {formatMinutes(totals.avg_time_generate_to_approve)}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                ⏱ Avg Approve → Publish
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-0.5px",
                }}
              >
                {formatMinutes(totals.avg_time_approve_to_publish)}
              </div>
            </div>
            <div style={{ ...STYLES.card, padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 6,
                }}
              >
                📅 Events Ingested
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "-0.5px",
                  marginBottom: 4,
                }}
              >
                {totals.events_ingested_count || 0}
              </div>
              <div style={{ ...STYLES.sub, fontSize: 11 }}>
                Google: {breakdown.google || 0} · Demo: {breakdown.demo || 0} · Manual:{" "}
                {breakdown.manual || 0}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.2fr)",
              gap: 16,
              alignItems: "stretch",
            }}
          >
            <div style={{ ...STYLES.card, padding: 20, minHeight: 260 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Pipeline by Day
              </div>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.45)"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.45)"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20,20,22,0.95)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={24}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="generated"
                      name="Generated"
                      stroke={CHART_COLORS.generated}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      name="Approved"
                      stroke={CHART_COLORS.approved}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="published"
                      name="Published"
                      stroke={CHART_COLORS.published}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...STYLES.card, padding: 18, minHeight: 160 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Top Events by Posts
                </div>
                <div style={{ width: "100%", height: 130 }}>
                  {topEventsData.length === 0 ? (
                    <div style={{ ...STYLES.sub, fontSize: 12 }}>
                      No generated posts yet for this range.
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={topEventsData} layout="vertical" margin={{ left: 60 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.8)" }}
                        />
                        <Bar dataKey="count" fill={CHART_COLORS.generated} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div style={{ ...STYLES.card, padding: 18, minHeight: 160 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Platform Breakdown
                </div>
                <div style={{ width: "100%", height: 130 }}>
                  {platformData.length === 0 ? (
                    <div style={{ ...STYLES.sub, fontSize: 12 }}>
                      No platform activity yet for this range.
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={platformData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={2}
                        >
                          {platformData.map((entry, index) => (
                            <Cell
                              // eslint-disable-next-line react/no-array-index-key
                              key={`slice-${index}`}
                              fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          iconType="circle"
                          wrapperStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {summary?.recent_events && summary.recent_events.length > 0 && (
            <div style={{ ...STYLES.card, padding: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Recent Activity
              </div>
              <div
                style={{
                  maxHeight: 260,
                  overflowY: "auto",
                  fontSize: 12,
                }}
              >
                {summary.recent_events.map((evt) => (
                  <div
                    key={evt.id || `${evt.timestamp}-${evt.type}-${evt.sessionId}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{evt.type}</div>
                      <div
                        style={{
                          ...STYLES.sub,
                          fontSize: 11,
                          maxWidth: 420,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {evt.payload?.eventTitle || evt.payload?.eventId || evt.payload?.platform}
                      </div>
                    </div>
                    <div
                      style={{
                        ...STYLES.sub,
                        fontSize: 11,
                      }}
                    >
                      {new Date(evt.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

