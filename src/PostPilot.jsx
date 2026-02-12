import React, { useState, useEffect, useRef } from "react";

const SAMPLE_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union, Room 2134", description: "First GBM of the semester! Come learn about upcoming events and meet the new e-board." },
  { id: 2, title: "Resume Workshop with Capital One", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall 1504", description: "Professional development workshop with Capital One recruiters. Bring your resume!" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall Auditorium", description: "Join us for a chill movie night. Snacks and drinks provided." },
  { id: 4, title: "Hackathon Info Session", date: "2026-03-03", time: "6:00 PM", location: "IRB 0318", description: "Learn about our upcoming hackathon, form teams, and get ready to build something amazing." },
  { id: 5, title: "Alumni Networking Mixer", date: "2026-03-08", time: "4:00 PM", location: "Riggs Alumni Center", description: "Connect with alumni working in tech, finance, and consulting. Business casual attire." },
];

const TONES = ["Professional & Polished", "Casual & Fun", "Hype & Energetic", "Witty & Clever"];
const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Twitter/X"];

// Smooth animated counter
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function PostPilot() {
  const [screen, setScreen] = useState("landing"); // landing, onboard, dashboard, generate, calendar, content
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [tone, setTone] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState({});
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", location: "", description: "" });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [contentQueue, setContentQueue] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const contentRef = useRef(null);

  const togglePlatform = (p) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      setEvents(prev => [...prev, { ...newEvent, id: Date.now() }]);
      setNewEvent({ title: "", date: "", time: "", location: "", description: "" });
      setShowAddEvent(false);
    }
  };

  const generateContent = async (event) => {
    setSelectedEvent(event);
    setGenerating(true);
    setScreen("generate");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a social media manager for a student organization. Generate a content plan for an upcoming event.

Organization: ${orgName}
Description: ${orgDesc}
Tone: ${tone}
Target platforms: ${platforms.join(", ")}

Event: ${event.title}
Date: ${event.date}
Time: ${event.time}
Location: ${event.location}
Details: ${event.description}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "posts": [
    {
      "platform": "Instagram",
      "type": "announcement|reminder|story|recap",
      "timing": "description of when to post relative to event",
      "caption": "the full caption text with emojis",
      "hashtags": "#tag1 #tag2 #tag3",
      "visual_suggestion": "brief description of what the image/graphic should show"
    }
  ]
}

Generate 4-5 posts across the event lifecycle (teaser, announcement, reminder, day-of, recap). Make the captions authentic to the tone, not generic. Include platform-specific formatting (e.g. shorter for Twitter, professional for LinkedIn).`
          }]
        })
      });

      const data = await response.json();
      const text = data.content.map(i => i.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setGeneratedPosts(prev => ({ ...prev, [event.id]: parsed.posts }));
    } catch (err) {
      console.error("Generation error:", err);
      // Fallback content
      setGeneratedPosts(prev => ({
        ...prev,
        [event.id]: [
          { platform: platforms[0] || "Instagram", type: "announcement", timing: "5 days before event", caption: `📢 Mark your calendars! ${event.title} is coming up on ${event.date} at ${event.time}. ${event.description} See you there! 🎉`, hashtags: `#${orgName.replace(/\s/g, "")} #UMD #Terps`, visual_suggestion: "Eye-catching graphic with event details and org branding" },
          { platform: platforms[0] || "Instagram", type: "reminder", timing: "1 day before event", caption: `⏰ TOMORROW! Don't forget about ${event.title}! ${event.location} at ${event.time}. Bring your friends! 👥`, hashtags: `#${orgName.replace(/\s/g, "")} #UMD`, visual_suggestion: "Countdown-style graphic or story with location pin" },
          { platform: platforms[0] || "Instagram", type: "story", timing: "Day of event, 2 hours before", caption: `We're setting up for ${event.title} right now! 🔥 Slide up if you're coming tonight!`, hashtags: "", visual_suggestion: "Behind-the-scenes photo or boomerang of setup" },
          { platform: platforms[1] || "Instagram", type: "recap", timing: "Day after event", caption: `What an incredible turnout at ${event.title}! 🙌 Thanks to everyone who came out. Stay tuned for more events coming soon! Tag yourself in the comments 👇`, hashtags: `#${orgName.replace(/\s/g, "")} #UMD #CampusLife`, visual_suggestion: "Photo carousel of event highlights, group photos" },
        ]
      }));
    }
    setGenerating(false);
  };

  const approvePost = (eventId, postIndex) => {
    const post = generatedPosts[eventId][postIndex];
    setApprovedPosts(prev => [...prev, { ...post, eventId, eventTitle: events.find(e => e.id === eventId)?.title }]);
    setContentQueue(prev => [...prev, { ...post, eventId, status: "scheduled" }]);
  };

  const getTypeColor = (type) => {
    const colors = { announcement: "#E8B931", reminder: "#E85D31", story: "#9B59B6", recap: "#2ECC71" };
    return colors[type] || "#666";
  };

  const getPlatformIcon = (platform) => {
    const icons = { Instagram: "📸", TikTok: "🎵", LinkedIn: "💼", "Twitter/X": "🐦" };
    return icons[platform] || "📱";
  };

  // ============ LANDING ============
  if (screen === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0B", color: "#fff", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", position: "relative" }}>

        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,89,49,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,185,49,0.1) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #E85D31, #E8B931)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈</div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>PostPilot</span>
          </div>
          <button onClick={() => setScreen("onboard")} style={{ background: "linear-gradient(135deg, #E85D31, #E8B931)", border: "none", color: "#fff", padding: "10px 28px", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s", letterSpacing: "0.3px" }} onMouseOver={e => e.target.style.transform = "scale(1.05)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>
            Get Started →
          </button>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "80px 32px 40px" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 50, border: "1px solid rgba(232,185,49,0.3)", background: "rgba(232,185,49,0.08)", fontSize: 13, color: "#E8B931", fontWeight: 500, marginBottom: 28, letterSpacing: "0.5px" }}>
            🚀 Built for student organizations
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2px", margin: "0 0 24px" }}>
            Your calendar posts.<br />
            <span style={{ background: "linear-gradient(135deg, #E85D31, #E8B931)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Automatically.</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.6, fontWeight: 300 }}>
            PostPilot turns your org's Google Calendar into a fully managed social media presence. No design skills. No content planning. No daily effort.
          </p>
          <button onClick={() => setScreen("onboard")} style={{ background: "linear-gradient(135deg, #E85D31, #E8B931)", border: "none", color: "#fff", padding: "16px 44px", borderRadius: 50, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 32px rgba(232,89,49,0.3)", transition: "all 0.3s", letterSpacing: "0.3px" }} onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(232,89,49,0.4)"; }} onMouseOut={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 32px rgba(232,89,49,0.3)"; }}>
            Launch Demo →
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 60, padding: "50px 32px 30px", flexWrap: "wrap" }}>
          {[["800+", "Orgs at UMD"], ["73%", "Have no content strategy"], ["3 weeks", "Lost each leadership transition"]].map(([stat, label], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono', monospace", background: "linear-gradient(135deg, #E85D31, #E8B931)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 300 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ maxWidth: 900, margin: "60px auto 0", padding: "0 32px 80px" }}>
          <h2 style={{ textAlign: "center", fontSize: 14, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 48, fontWeight: 500 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: "📅", title: "Connect Calendar", desc: "Sync your Google Calendar. PostPilot reads your events automatically." },
              { icon: "🧠", title: "AI Generates Content", desc: "Smart content arcs for each event — teasers, reminders, recaps." },
              { icon: "✅", title: "Review & Approve", desc: "Quick approve or edit. One click to schedule across platforms." },
              { icon: "📈", title: "Watch It Grow", desc: "Track engagement, optimize timing, and grow your audience." },
            ].map((step, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "32px 24px", transition: "all 0.3s", cursor: "default" }} onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, letterSpacing: "-0.3px" }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 300 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============ ONBOARDING ============
  if (screen === "onboard") {
    const canProceed = orgName.trim() && orgDesc.trim() && tone && platforms.length > 0;
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0B", color: "#fff", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,89,49,0.12) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

        <nav style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 48px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #E85D31, #E8B931)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>PostPilot</span>
        </nav>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 32px 80px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8 }}>Set up your org</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 40, fontSize: 15, fontWeight: 300 }}>Tell PostPilot about your organization so it can match your voice.</p>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8, letterSpacing: "0.5px" }}>ORGANIZATION NAME</label>
            <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Terrapin Tech Club" style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "rgba(232,89,49,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8, letterSpacing: "0.5px" }}>DESCRIPTION</label>
            <textarea value={orgDesc} onChange={e => setOrgDesc(e.target.value)} placeholder="What does your org do? Who are your members? What's your vibe?" rows={3} style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5, transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "rgba(232,89,49,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12, letterSpacing: "0.5px" }}>BRAND TONE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)} style={{ padding: "10px 20px", borderRadius: 50, border: tone === t ? "1.5px solid #E85D31" : "1px solid rgba(255,255,255,0.1)", background: tone === t ? "rgba(232,89,49,0.12)" : "rgba(255,255,255,0.03)", color: tone === t ? "#E8A031" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12, letterSpacing: "0.5px" }}>PLATFORMS</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => togglePlatform(p)} style={{ padding: "10px 20px", borderRadius: 50, border: platforms.includes(p) ? "1.5px solid #E85D31" : "1px solid rgba(255,255,255,0.1)", background: platforms.includes(p) ? "rgba(232,89,49,0.12)" : "rgba(255,255,255,0.03)", color: platforms.includes(p) ? "#E8A031" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>
                  {getPlatformIcon(p)} {p}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Google Calendar Connect */}
          <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📅</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Google Calendar</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Demo mode — loaded with sample events</div>
              </div>
            </div>
            <div style={{ padding: "6px 16px", borderRadius: 50, background: "rgba(46,204,113,0.15)", color: "#2ECC71", fontSize: 12, fontWeight: 600 }}>
              ✓ Connected
            </div>
          </div>

          <button onClick={() => canProceed && setScreen("dashboard")} style={{ width: "100%", padding: "16px", background: canProceed ? "linear-gradient(135deg, #E85D31, #E8B931)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, color: canProceed ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 600, cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.3s", letterSpacing: "0.3px", boxShadow: canProceed ? "0 8px 32px rgba(232,89,49,0.25)" : "none" }}>
            Launch Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // ============ GENERATE SCREEN ============
  if (screen === "generate") {
    const posts = generatedPosts[selectedEvent?.id] || [];
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0B", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #E85D31, #E8B931)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈</div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>PostPilot</span>
          </div>
          <button onClick={() => setScreen("dashboard")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "8px 20px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            ← Back to Dashboard
          </button>
        </nav>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 500 }}>Content Arc For</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 6 }}>{selectedEvent?.title}</h1>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300 }}>
              📅 {selectedEvent?.date} · ⏰ {selectedEvent?.time} · 📍 {selectedEvent?.location}
            </div>
          </div>

          {generating ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#E85D31", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Generating content arc...</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8, fontWeight: 300 }}>
                AI is crafting platform-optimized posts for your event lifecycle
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {posts.map((post, i) => {
                const isApproved = approvedPosts.some(a => a.eventId === selectedEvent.id && a.caption === post.caption);
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 0, overflow: "hidden", transition: "border-color 0.3s" }} onMouseOver={e => e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                    {/* Post header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{getPlatformIcon(post.platform)}</span>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{post.platform}</span>
                          <span style={{ display: "inline-block", marginLeft: 10, padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600, background: `${getTypeColor(post.type)}18`, color: getTypeColor(post.type), textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {post.type}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>⏱ {post.timing}</div>
                    </div>

                    {/* Post body */}
                    <div style={{ padding: "20px 24px" }}>
                      {/* Visual suggestion */}
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20, opacity: 0.5 }}>🖼️</span>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", fontWeight: 300, lineHeight: 1.5 }}>{post.visual_suggestion}</div>
                      </div>

                      {/* Caption */}
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 300 }}>
                        {post.caption}
                      </div>

                      {post.hashtags && (
                        <div style={{ fontSize: 13, color: "#E8A031", fontWeight: 300 }}>
                          {post.hashtags}
                        </div>
                      )}
                    </div>

                    {/* Post actions */}
                    <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                      {isApproved ? (
                        <div style={{ padding: "8px 20px", borderRadius: 50, background: "rgba(46,204,113,0.12)", color: "#2ECC71", fontSize: 13, fontWeight: 600 }}>
                          ✓ Approved & Queued
                        </div>
                      ) : (
                        <>
                          <button onClick={() => approvePost(selectedEvent.id, i)} style={{ padding: "8px 20px", borderRadius: 50, background: "linear-gradient(135deg, #E85D31, #E8B931)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s" }} onMouseOver={e => e.target.style.transform = "scale(1.04)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>
                            ✓ Approve
                          </button>
                          <button style={{ padding: "8px 20px", borderRadius: 50, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                            ✏️ Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ DASHBOARD ============
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Dashboard Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #E85D31, #E8B931)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈</div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>PostPilot</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8, fontWeight: 300 }}>/ {orgName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #E85D31, #E8B931)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {orgName.charAt(0)}
          </div>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 71px)" }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px", flexShrink: 0 }}>
          {[
            { label: "Upcoming Events", tab: "upcoming", icon: "📅" },
            { label: "Content Queue", tab: "queue", icon: "📝" },
            { label: "Analytics", tab: "analytics", icon: "📊" },
            { label: "Photo Library", tab: "photos", icon: "📸" },
            { label: "Settings", tab: "settings", icon: "⚙️" },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: activeTab === item.tab ? "rgba(232,89,49,0.1)" : "transparent", color: activeTab === item.tab ? "#E8A031" : "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === item.tab ? 600 : 400, textAlign: "left", marginBottom: 4, transition: "all 0.2s" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
            {[
              { label: "Upcoming Events", value: events.length, icon: "📅" },
              { label: "Posts Generated", value: Object.values(generatedPosts).flat().length, icon: "✍️" },
              { label: "Approved & Queued", value: approvedPosts.length, icon: "✅" },
              { label: "Est. Reach", value: approvedPosts.length * 120, icon: "👥" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 500, letterSpacing: "0.5px" }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "-1px" }}>
                  <AnimatedNumber value={stat.value} />
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "upcoming" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Upcoming Events</h2>
                <button onClick={() => setShowAddEvent(true)} style={{ background: "linear-gradient(135deg, #E85D31, #E8B931)", border: "none", color: "#fff", padding: "10px 22px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s" }} onMouseOver={e => e.target.style.transform = "scale(1.04)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>
                  + Add Event
                </button>
              </div>

              {/* Add Event Modal */}
              {showAddEvent && (
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Add New Event</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <input placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} style={{ gridColumn: "1 / -1", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", colorScheme: "dark" }} />
                    <input placeholder="Time (e.g. 7:00 PM)" value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                    <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent(p => ({...p, location: e.target.value}))} style={{ gridColumn: "1 / -1", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                    <textarea placeholder="Event description" value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} rows={2} style={{ gridColumn: "1 / -1", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button onClick={addEvent} style={{ padding: "10px 24px", borderRadius: 50, background: "linear-gradient(135deg, #E85D31, #E8B931)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Event</button>
                    <button onClick={() => setShowAddEvent(false)} style={{ padding: "10px 24px", borderRadius: 50, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Event Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {events.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => {
                  const hasContent = generatedPosts[event.id];
                  const approvedCount = approvedPosts.filter(p => p.eventId === event.id).length;
                  return (
                    <div key={event.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s", cursor: "pointer" }} onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{event.title}</span>
                          {hasContent && (
                            <span style={{ padding: "2px 10px", borderRadius: 50, fontSize: 11, background: "rgba(46,204,113,0.12)", color: "#2ECC71", fontWeight: 600 }}>
                              {approvedCount}/{generatedPosts[event.id].length} approved
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
                          📅 {event.date} · ⏰ {event.time} · 📍 {event.location}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); generateContent(event); }} style={{ padding: "10px 22px", borderRadius: 50, background: hasContent ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #E85D31, #E8B931)", border: hasContent ? "1px solid rgba(255,255,255,0.1)" : "none", color: hasContent ? "rgba(255,255,255,0.6)" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "transform 0.2s" }} onMouseOver={e => e.target.style.transform = "scale(1.04)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>
                        {hasContent ? "View Posts ↗" : "Generate Content ✨"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "queue" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>Content Queue</h2>
              {contentQueue.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>No posts in queue yet</div>
                  <div style={{ fontSize: 13, fontWeight: 300, marginTop: 6 }}>Generate and approve content from your events to see them here</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {contentQueue.map((post, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 22 }}>{getPlatformIcon(post.platform)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{post.eventTitle}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 50, fontSize: 10, fontWeight: 600, background: `${getTypeColor(post.type)}18`, color: getTypeColor(post.type), textTransform: "uppercase" }}>{post.type}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{post.caption}</div>
                      </div>
                      <div style={{ padding: "5px 14px", borderRadius: 50, background: "rgba(46,204,113,0.1)", color: "#2ECC71", fontSize: 12, fontWeight: 600 }}>Scheduled</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "analytics" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>Analytics</h2>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Analytics coming soon</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                  Once your posts go live, you'll see engagement metrics, follower growth, best posting times, and conversion tracking from impressions to event attendance.
                </div>
              </div>
            </>
          )}

          {activeTab === "photos" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>Photo Library</h2>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16, padding: "50px", textAlign: "center", cursor: "pointer", transition: "all 0.3s" }} onMouseOver={e => e.currentTarget.style.borderColor = "rgba(232,89,49,0.3)"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Drop photos here or click to upload</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                  Upload photos from past events. PostPilot's AI will auto-tag them and intelligently select the best photos to match each post's content and mood.
                </div>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 24 }}>Settings</h2>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Organization</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{orgName}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Tone</div>
                  <div style={{ fontSize: 14 }}>{tone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Platforms</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {platforms.map(p => (
                      <span key={p} style={{ padding: "5px 14px", borderRadius: 50, background: "rgba(232,89,49,0.1)", color: "#E8A031", fontSize: 13, fontWeight: 500 }}>
                        {getPlatformIcon(p)} {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
