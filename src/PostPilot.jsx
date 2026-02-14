import React, { useState, useEffect, useRef } from "react";
import { generateSmartContent } from "./utils/contentEngine";

import Landing from "./components/Landing/Landing";
import Onboarding from "./components/Onboarding/Onboarding";
import Dashboard from "./components/Dashboard/Dashboard";
import GenerateScreen from "./components/Generate/GenerateScreen";
import Profile from "./components/Profile/Profile";
import ConnectPlatformModal from "./components/shared/ConnectPlatformModal";
import Toast from "./components/shared/Toast";

const SAMPLE_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union, Room 2134", description: "First GBM of the semester! Come learn about upcoming events and meet the new e-board.", type: "gbm" },
  { id: 2, title: "Resume Workshop with Capital One", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall 1504", description: "Professional development workshop with Capital One recruiters. Bring your resume!", type: "workshop" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall Auditorium", description: "Join us for a chill movie night. Snacks and drinks provided.", type: "social" },
  { id: 4, title: "Hackathon Info Session", date: "2026-03-03", time: "6:00 PM", location: "IRB 0318", description: "Learn about our upcoming hackathon, form teams, and get ready to build something amazing.", type: "info" },
  { id: 5, title: "Alumni Networking Mixer", date: "2026-03-08", time: "4:00 PM", location: "Riggs Alumni Center", description: "Connect with alumni working in tech, finance, and consulting. Business casual attire.", type: "networking" },
];

export default function PostPilot() {
  const [screen, setScreen] = useState("landing");
  const [screenHistory, setScreenHistory] = useState(["landing"]);
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [tone, setTone] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState({});
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", location: "", description: "", type: "gbm" });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [contentQueue, setContentQueue] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [postPhotoAssignments, setPostPhotoAssignments] = useState({});
  const [connectedPlatforms, setConnectedPlatforms] = useState(["Google Calendar"]); // Demo: calendar always connected
  const [connectModalPlatform, setConnectModalPlatform] = useState(null);
  const [showCalendarConnectOnOnboard, setShowCalendarConnectOnOnboard] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const navigateTo = (s) => {
    setScreenHistory((prev) => [...prev, s]);
    setScreen(s);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const h = [...screenHistory];
      h.pop();
      setScreenHistory(h);
      setScreen(h[h.length - 1]);
    }
  };

  const togglePlatform = (p) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const addEvent = () => {
    if (newEvent.title?.trim() && newEvent.date) {
      setEvents((prev) => [...prev, { ...newEvent, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }]);
      setNewEvent({ title: "", date: "", time: "", location: "", description: "", type: "gbm" });
      setShowAddEvent(false);
    }
  };

  const generateContent = async (event) => {
    setSelectedEvent(event);
    setGenerating(true);
    setGenerationProgress(0);
    navigateTo("generate");

    const steps = [
      { pct: 15, delay: 400 },
      { pct: 35, delay: 700 },
      { pct: 60, delay: 500 },
      { pct: 80, delay: 600 },
      { pct: 95, delay: 400 },
    ];
    let apiSuccess = false;

    const progressPromise = (async () => {
      for (const s of steps) {
        await new Promise((r) => setTimeout(r, s.delay));
        if (!isMountedRef.current) return;
        setGenerationProgress(s.pct);
      }
    })();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a social media manager for "${orgName}", a student org at UMD. Tone: ${tone}. Description: ${orgDesc}. Generate content for: ${event.title} on ${event.date} at ${event.time}, ${event.location}. ${event.description}\n\nReturn ONLY valid JSON: {"posts":[{"platform":"Instagram","type":"announcement|reminder|story|recap","timing":"when to post","caption":"full caption with emojis","hashtags":"#tags","visual_suggestion":"image desc"}]}\n\nGenerate 4-5 posts. Make captions feel like a real student org social media chair — authentic, engaging, platform-native. ${tone} tone. Platforms: ${platforms.join(", ")}.`
          }]
        }),
      });
      const data = await res.json();
      if (res.ok && data?.content && Array.isArray(data.content)) {
        try {
          const text = data.content.map((i) => i.text || "").join("\n");
          const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
          const posts = Array.isArray(parsed?.posts) ? parsed.posts : null;
          if (posts && posts.length > 0 && isMountedRef.current) {
            setGeneratedPosts((prev) => ({ ...prev, [event.id]: posts }));
            apiSuccess = true;
          }
        } catch (parseErr) {
          console.warn("API returned invalid JSON structure, using fallback:", parseErr);
        }
      }
    } catch (err) {
      console.error("API error:", err);
    }

    await progressPromise;

    if (!apiSuccess && isMountedRef.current) {
      const smartPosts = generateSmartContent(event, orgName, orgDesc, tone, platforms);
      setGeneratedPosts((prev) => ({ ...prev, [event.id]: smartPosts }));
    }

    if (isMountedRef.current) setGenerationProgress(100);
    await new Promise((r) => setTimeout(r, 300));
    if (isMountedRef.current) setGenerating(false);
  };

  const handlePlatformConnect = (platform) => {
    setConnectedPlatforms((prev) => (prev.includes(platform) ? prev : [...prev, platform]));
    setConnectModalPlatform(null);
  };

  const assignPhoto = (eventId, postIndex, photo) => {
    setPostPhotoAssignments((prev) => {
      const eventAssignments = { ...(prev[eventId] || {}) };
      if (photo) {
        eventAssignments[postIndex] = photo.id;
      } else {
        delete eventAssignments[postIndex];
      }
      const next = { ...prev };
      if (Object.keys(eventAssignments).length > 0) {
        next[eventId] = eventAssignments;
      } else {
        delete next[eventId];
      }
      return next;
    });
  };

  const approvePost = (eventId, postIndex) => {
    const post = generatedPosts[eventId]?.[postIndex];
    if (!post) return;
    const already = approvedPosts.some((a) => a.eventId === eventId && a.caption === post.caption);
    if (!already) {
      const eventTitle = events.find((e) => e.id === eventId)?.title || "";
      setApprovedPosts((prev) => [...prev, { ...post, eventId, eventTitle }]);
      setContentQueue((prev) => [...prev, { ...post, eventId, eventTitle, status: "scheduled" }]);
      setToastMessage("Post approved and queued!");
    }
  };

  const updatePostCaption = (eventId, postIndex, newCaption) => {
    setGeneratedPosts((prev) => {
      const posts = prev[eventId];
      if (!posts || !posts[postIndex]) return prev;
      const updated = [...posts];
      updated[postIndex] = { ...updated[postIndex], caption: newCaption };
      return { ...prev, [eventId]: updated };
    });
  };

  if (screen === "landing") {
    return (
      <div style={{ animation: "screen-fade 0.35s ease-out" }}>
        <Landing onGetStarted={() => navigateTo("onboard")} />
      </div>
    );
  }

  if (screen === "onboard") {
    return (
      <>
        <Onboarding
          orgName={orgName}
          setOrgName={setOrgName}
          orgDesc={orgDesc}
          setOrgDesc={setOrgDesc}
          tone={tone}
          setTone={setTone}
          platforms={platforms}
          togglePlatform={togglePlatform}
          onBack={goBack}
          onLaunch={() => {
            setShowCalendarConnectOnOnboard(true);
          }}
        />
        {showCalendarConnectOnOnboard && (
          <ConnectPlatformModal
            isOpen
            platform="Google Calendar"
            onClose={() => {
              setShowCalendarConnectOnOnboard(false);
              navigateTo("dashboard");
            }}
            onSuccess={() => setShowCalendarConnectOnOnboard(false)}
          />
        )}
      </>
    );
  }

  if (screen === "profile") {
    return (
      <>
        <Profile
          orgName={orgName}
          orgDesc={orgDesc}
          tone={tone}
          platforms={platforms}
          events={events}
          approvedPosts={approvedPosts}
          generatedPosts={generatedPosts}
          onBack={goBack}
          connectedPlatforms={connectedPlatforms}
          onConnectClick={setConnectModalPlatform}
        />
        {connectModalPlatform && (
          <ConnectPlatformModal
            isOpen
            platform={connectModalPlatform}
            onClose={() => setConnectModalPlatform(null)}
            onSuccess={handlePlatformConnect}
          />
        )}
      </>
    );
  }

  if (screen === "generate") {
    const posts = generatedPosts[selectedEvent?.id] || [];
    const eventPhotos = photos.filter(
      (p) => p.tagEventId === selectedEvent?.id || p.tag === selectedEvent?.title
    );
    return (
      <>
        <div style={{ animation: "screen-fade 0.35s ease-out" }}>
          <GenerateScreen
            selectedEvent={selectedEvent}
            posts={posts}
            generating={generating}
            generationProgress={generationProgress}
            tone={tone}
            orgName={orgName}
            approvedPosts={approvedPosts}
            onBack={goBack}
            onApprovePost={approvePost}
            onEditPost={(post, index) => {}}
            onUpdateCaption={(postIndex, newCaption) =>
              updatePostCaption(selectedEvent?.id, postIndex, newCaption)
            }
            onRegenerate={() => selectedEvent && generateContent(selectedEvent)}
            eventPhotos={eventPhotos}
            postPhotoAssignments={postPhotoAssignments}
            onAssignPhoto={assignPhoto}
          />
        </div>
        <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage(null)} />
      </>
    );
  }

  return (
    <>
    <Dashboard
      orgName={orgName}
      tone={tone}
      platforms={platforms}
      events={events}
      generatedPosts={generatedPosts}
      approvedPosts={approvedPosts}
      contentQueue={contentQueue}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onProfileClick={() => navigateTo("profile")}
      onLandingClick={() => navigateTo("landing")}
      onGenerateContent={generateContent}
      showAddEvent={showAddEvent}
      setShowAddEvent={setShowAddEvent}
      newEvent={newEvent}
      setNewEvent={setNewEvent}
      addEvent={addEvent}
      photos={photos}
      onPhotosChange={setPhotos}
    />
    <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage(null)} />
    </>
  );
}
