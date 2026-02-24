import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { generateSmartContent } from "./utils/contentEngine";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { useFacebookAuth } from "./hooks/useFacebookAuth";
import { track } from "./lib/analytics";
import { useAuth } from "./context/AuthContext.jsx";

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

export default function PostPilot({ initialScreen = "landing" }) {
  const navigate = useNavigate();
  const [pendingAuthRedirect, setPendingAuthRedirect] = useState(false);
  const handleTokensReceived = useCallback(() => setPendingAuthRedirect(true), []);
  const googleAuth = useGoogleAuth(handleTokensReceived);
  const facebookAuth = useFacebookAuth();
  const { isConnected: googleCalendarConnected, calendarId, fetchWithAuth } = googleAuth;

  const { user, orgs, activeOrgId, setActiveOrgId } = useAuth();

  const isDemoMode = !user && !googleCalendarConnected;

  const [screen, setScreen] = useState(initialScreen);
  const [screenHistory, setScreenHistory] = useState([initialScreen]);
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [tone, setTone] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [events, setEvents] = useState([]);
  const [demoEvents, setDemoEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [eventsLastSynced, setEventsLastSynced] = useState(null);
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
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [connectModalPlatform, setConnectModalPlatform] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);
  const demoIngestTrackedRef = useRef(false);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Restore onboarding state when returning from OAuth (saved before redirect)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pp_onboard_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orgName != null) setOrgName(parsed.orgName);
        if (parsed.orgDesc != null) setOrgDesc(parsed.orgDesc);
        if (parsed.tone != null) setTone(parsed.tone);
        if (Array.isArray(parsed.platforms)) setPlatforms(parsed.platforms);
        sessionStorage.removeItem("pp_onboard_state");
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // When returning from OAuth, go to onboarding to pick calendar
  useEffect(() => {
    if (pendingAuthRedirect && screen === "landing") {
      setPendingAuthRedirect(false);
      setScreenHistory((prev) => [...prev, "onboard"]);
      setScreen("onboard");
    }
  }, [pendingAuthRedirect, screen]);

  // Fetch events when dashboard loads with Google Calendar connected
  const fetchEvents = useCallback(async () => {
    if (!googleCalendarConnected || !calendarId || !fetchWithAuth) return;
    const id = ++fetchIdRef.current;
    setEventsLoading(true);
    setEventsError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const hardTimeoutId = setTimeout(() => {
      if (isMountedRef.current && id === fetchIdRef.current) {
        setEventsLoading(false);
        setEventsError("Request timed out. The API may not be running — use `npx vercel dev` and open http://localhost:3000");
      }
    }, 20000);

    try {
      const res = await fetchWithAuth(
        `/api/events?calendarId=${encodeURIComponent(calendarId)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      clearTimeout(hardTimeoutId);
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        if (isMountedRef.current && id === fetchIdRef.current) {
          setEventsError("Could not load calendar. Make sure you're running with `vercel dev` so API routes work.");
          setEvents([]);
        }
        return;
      }
      if (res.ok && data?.events) {
        const eventsFromCalendar = Array.isArray(data.events)
          ? data.events
          : [];
        if (isMountedRef.current && id === fetchIdRef.current) {
          setEvents(eventsFromCalendar);
          setEventsLastSynced(new Date());
          try {
            track(
              "event_ingested",
              {
                calendarSource: "google",
                count: eventsFromCalendar.length,
              },
              { orgId: activeOrgId || undefined }
            );
          } catch {
            // ignore analytics errors
          }
        }

        if (user && activeOrgId && eventsFromCalendar.length > 0) {
          // Best-effort: mirror Google Calendar events into org-scoped KV for authenticated users
          try {
            await fetch("/api/org-events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ items: eventsFromCalendar }),
            });
          } catch {
            // ignore persistence errors
          }
        }
      } else if (res.status === 401) {
        if (isMountedRef.current && id === fetchIdRef.current) setEvents([]);
      } else {
        if (isMountedRef.current && id === fetchIdRef.current) {
          setEventsError(data?.error || "Failed to load events");
          setEvents([]);
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      clearTimeout(hardTimeoutId);
      if (err?.name === "AbortError") {
        if (isMountedRef.current && id === fetchIdRef.current) setEventsError("Request timed out. Try again.");
      } else {
        if (isMountedRef.current && id === fetchIdRef.current) {
          setEventsError("Could not load calendar. Run with `vercel dev` (not `npm run dev`) for API routes.");
          setEvents([]);
        }
      }
    } finally {
      clearTimeout(hardTimeoutId);
      if (isMountedRef.current && id === fetchIdRef.current) setEventsLoading(false);
    }
  }, [googleCalendarConnected, calendarId, fetchWithAuth, user, activeOrgId]);

  useEffect(() => {
    if (screen !== "dashboard") return;
    // Logged-out demo mode
    if (!user) {
      if (googleCalendarConnected && calendarId) {
        fetchEvents();
      } else {
        setEvents([...SAMPLE_EVENTS, ...demoEvents]);
        setEventsError(null);
        setEventsLastSynced(null);
        if (!demoIngestTrackedRef.current) {
          demoIngestTrackedRef.current = true;
          try {
            track("event_ingested", {
              calendarSource: "demo",
              count: SAMPLE_EVENTS.length,
            });
          } catch {
            // ignore analytics errors
          }
        }
      }
    }
  }, [screen, googleCalendarConnected, calendarId, fetchEvents, demoEvents, user]);

  // Load org-scoped data for authenticated users
  useEffect(() => {
    if (!user || !activeOrgId) return;
    if (screen !== "dashboard" && screen !== "profile" && screen !== "generate") return;

    let cancelled = false;
    const load = async () => {
      try {
        const [orgsRes, eventsRes, postsRes, queueRes] = await Promise.all([
          fetch("/api/orgs", { credentials: "include" }),
          fetch("/api/org-events", { credentials: "include" }),
          fetch("/api/posts", { credentials: "include" }),
          fetch("/api/queue", { credentials: "include" }),
        ]);

        const orgsJson = orgsRes.ok ? await orgsRes.json().catch(() => ({})) : {};
        const eventsJson = eventsRes.ok ? await eventsRes.json().catch(() => ({})) : {};
        const postsJson = postsRes.ok ? await postsRes.json().catch(() => ({})) : {};
        const queueJson = queueRes.ok ? await queueRes.json().catch(() => ({})) : {};

        if (cancelled) return;

        if (Array.isArray(orgsJson.orgsDetailed)) {
          const activeOrg = orgsJson.orgsDetailed.find((o) => o.id === activeOrgId);
          if (activeOrg) {
            setOrgName(activeOrg.name || "");
            setOrgDesc(activeOrg.description || "");
            setTone(activeOrg.tone || "");
            if (Array.isArray(activeOrg.platforms)) {
              setPlatforms(activeOrg.platforms);
            }
          }
        }

        const orgEvents = Array.isArray(eventsJson.items) ? eventsJson.items : [];
        setEvents(orgEvents);

        const flatPosts = Array.isArray(postsJson.items) ? postsJson.items : [];
        const grouped = flatPosts.reduce((acc, p) => {
          if (!p.eventId) return acc;
          if (!acc[p.eventId]) acc[p.eventId] = [];
          acc[p.eventId].push(p);
          return acc;
        }, {});
        setGeneratedPosts(grouped);

        const q = Array.isArray(queueJson.items) ? queueJson.items : [];
        setContentQueue(q);
      } catch {
        // swallow errors; demo / calendar flows still work
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, activeOrgId, screen]);

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
    } else if (screen === "onboard") {
      navigate("/");
    }
  };

  const togglePlatform = (p) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const addEvent = () => {
    if (newEvent.title?.trim() && newEvent.date) {
      const createdEvent = {
        ...newEvent,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };

      setEvents((prev) => [...prev, createdEvent]);

      if (user && activeOrgId) {
        // Persist manual event server-side for authenticated orgs
        const persist = async () => {
          try {
            await fetch("/api/events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ item: createdEvent }),
            });
          } catch {
            // ignore persistence errors; local state remains
          }
        };
        persist();
      }

      try {
        track(
          "event_added_manual",
          {
            eventId: createdEvent.id,
          },
          { orgId: activeOrgId || undefined }
        );
      } catch {
        // ignore analytics errors
      }

      if (isDemoMode) {
        setDemoEvents((prev) => [...prev, createdEvent]);
      }

      setNewEvent({ title: "", date: "", time: "", location: "", description: "", type: "gbm" });
      setShowAddEvent(false);
    }
  };

  const updateEventType = (eventId, newType) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, type: newType } : e))
    );
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
    const generatedAt = new Date().toISOString();

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
            const postsWithMeta = posts.map((p) => ({
              ...p,
              generatedAt,
            }));
            setGeneratedPosts((prev) => ({ ...prev, [event.id]: postsWithMeta }));
            apiSuccess = true;
            try {
              const totalChars = posts.reduce(
                (sum, p) => sum + ((p.caption && p.caption.length) || 0),
                0
              );
              const avgLength =
                posts.length > 0 ? totalChars / posts.length : 0;
        track(
          "post_generated",
          {
            eventId: event.id,
            eventTitle: event.title,
            platform: "instagram",
            tone,
            hasImage: false,
            postLength: avgLength,
            postsCount: posts.length,
            generatedAt,
          },
          { orgId: activeOrgId || undefined }
        );
            } catch {
              // ignore analytics errors
            }
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
      const smartWithMeta = smartPosts.map((p) => ({
        ...p,
        generatedAt,
      }));
      setGeneratedPosts((prev) => ({ ...prev, [event.id]: smartWithMeta }));
      try {
        const totalChars = smartPosts.reduce(
          (sum, p) => sum + ((p.caption && p.caption.length) || 0),
          0
        );
        const avgLength =
          smartPosts.length > 0 ? totalChars / smartPosts.length : 0;
        track(
          "post_generated",
          {
            eventId: event.id,
            eventTitle: event.title,
            platform: "instagram",
            tone,
            hasImage: false,
            postLength: avgLength,
            postsCount: smartPosts.length,
            generatedAt,
          },
          { orgId: activeOrgId || undefined }
        );
      } catch {
        // ignore analytics errors
      }
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
      const approvedAt = new Date().toISOString();
      const approvedPost = { ...post, eventId, eventTitle, approvedAt };
      setApprovedPosts((prev) => [...prev, approvedPost]);
      const queued = { ...approvedPost, status: "scheduled" };
      setContentQueue((prev) => [...prev, queued]);

      if (user && activeOrgId) {
        const persist = async () => {
          try {
            await fetch("/api/queue", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ item: queued }),
            });
          } catch {
            // ignore
          }
        };
        persist();
      }
      setToastMessage("Post approved and queued!");
      try {
        const platform = (post.platform || "instagram").toLowerCase();
        track(
          "post_approved",
          {
            eventId,
            platform,
            generatedAt: post.generatedAt,
            approvedAt,
          },
          { orgId: activeOrgId || undefined }
        );
        track(
          "post_queued",
          {
            eventId,
            platform,
            approvedAt,
          },
          { orgId: activeOrgId || undefined }
        );
      } catch {
        // ignore analytics errors
      }
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
        <Landing onGetStarted={() => navigate("/onboard")} />
      </div>
    );
  }

  if (screen === "onboard") {
    const handleLaunch = async () => {
      if (user && (!orgs || orgs.length === 0)) {
        try {
          await fetch("/api/orgs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: orgName,
              description: orgDesc,
              tone,
              platforms,
            }),
          });
        } catch {
          // ignore org creation errors; user stays in local-only mode
        }
      }
      navigateTo("dashboard");
    };
    return (
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
        onLaunch={handleLaunch}
        googleAuth={googleAuth}
      />
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
          connectedPlatforms={[
            ...(googleCalendarConnected ? ["Google Calendar"] : []),
            ...(facebookAuth.isConnected ? ["Instagram"] : []),
            ...connectedPlatforms.filter((p) => p !== "Google Calendar" && p !== "Instagram"),
          ]}
          onConnectClick={setConnectModalPlatform}
          onInstagramConnectError={setToastMessage}
          googleAuth={googleAuth}
          facebookAuth={facebookAuth}
        />
        {connectModalPlatform && (
          <ConnectPlatformModal
            isOpen
            platform={connectModalPlatform}
            onClose={() => setConnectModalPlatform(null)}
            onSuccess={handlePlatformConnect}
          />
        )}
        <Toast message={toastMessage} visible={!!toastMessage} onHide={() => setToastMessage(null)} />
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
        orgs={orgs || []}
        activeOrgId={activeOrgId}
        onActiveOrgChange={setActiveOrgId}
        tone={tone}
        platforms={platforms}
        events={events}
        generatedPosts={generatedPosts}
        approvedPosts={approvedPosts}
        contentQueue={contentQueue}
        setContentQueue={setContentQueue}
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
        googleCalendarConnected={googleCalendarConnected}
        onConnectCalendar={googleAuth.connect}
        facebookAuth={facebookAuth}
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        eventsLastSynced={eventsLastSynced}
        onRefreshEvents={fetchEvents}
        isDemoMode={isDemoMode}
        onEventTypeChange={updateEventType}
      />
      <Toast
        message={toastMessage}
        visible={!!toastMessage}
        onHide={() => setToastMessage(null)}
      />
    </>
  );
}
