import React, { useState, useEffect, useRef } from "react";

const SAMPLE_EVENTS = [
  { id: 1, title: "Spring General Body Meeting", date: "2026-02-18", time: "7:00 PM", location: "Stamp Student Union, Room 2134", description: "First GBM of the semester! Come learn about upcoming events and meet the new e-board.", type: "gbm" },
  { id: 2, title: "Resume Workshop with Capital One", date: "2026-02-22", time: "5:30 PM", location: "Van Munching Hall 1504", description: "Professional development workshop with Capital One recruiters. Bring your resume!", type: "workshop" },
  { id: 3, title: "Movie Night Social", date: "2026-02-27", time: "8:00 PM", location: "Tawes Hall Auditorium", description: "Join us for a chill movie night. Snacks and drinks provided.", type: "social" },
  { id: 4, title: "Hackathon Info Session", date: "2026-03-03", time: "6:00 PM", location: "IRB 0318", description: "Learn about our upcoming hackathon, form teams, and get ready to build something amazing.", type: "info" },
  { id: 5, title: "Alumni Networking Mixer", date: "2026-03-08", time: "4:00 PM", location: "Riggs Alumni Center", description: "Connect with alumni working in tech, finance, and consulting. Business casual attire.", type: "networking" },
];

const TONES = ["Professional & Polished", "Casual & Fun", "Hype & Energetic", "Witty & Clever"];
const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Twitter/X"];

// ==================== SMART CONTENT ENGINE ====================
function generateSmartContent(event, orgName, orgDesc, tone, platforms) {
  const tag = orgName ? `#${orgName.replace(/\s+/g, "")}` : "#OurOrg";
  const plat1 = platforms[0] || "Instagram";
  const plat2 = platforms[1] || platforms[0] || "Instagram";

  const dateObj = new Date(event.date + "T12:00:00");
  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const toneMap = {
    "Professional & Polished": { excitement: "We're excited to announce", cta: "Register now to secure your spot.", reminder: "A friendly reminder", recap: "We're grateful for the incredible turnout", emoji: "✨", vibe: "polished" },
    "Casual & Fun": { excitement: "Yooo guess what's coming up", cta: "Come through!! Bring your friends 🫶", reminder: "Don't forget!!", recap: "Last night was actually so fun", emoji: "🎉", vibe: "chill" },
    "Hype & Energetic": { excitement: "THIS IS NOT A DRILL", cta: "Pull up or regret it. No in between. 😤", reminder: "TOMORROW. NO EXCUSES.", recap: "WE JUST DID THAT.", emoji: "🔥", vibe: "hype" },
    "Witty & Clever": { excitement: "Plot twist:", cta: "Your future self will thank you for showing up.", reminder: "This is your sign", recap: "So that happened (and it was amazing)", emoji: "👀", vibe: "witty" },
  };
  const t = toneMap[tone] || toneMap["Casual & Fun"];

  const contentByType = {
    gbm: {
      teaser: {
        caption: t.vibe === "hype"
          ? `🚨 ${t.excitement} 🚨\n\nOur Spring GBM is locked in. New semester. New events. New energy.\n\nIf you've been waiting for a sign to get involved — this is it.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : t.vibe === "witty"
          ? `${t.excitement} we're actually doing stuff this semester ${t.emoji}\n\nSpring GBM is coming and we've got plans. Big ones. The kind we can't spoil yet but trust — you'll want to be in the room.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : t.vibe === "polished"
          ? `${t.excitement} our Spring General Body Meeting ${t.emoji}\n\nJoin us as we kick off the new semester, introduce our upcoming event lineup, and welcome new members to the team.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : `${t.excitement} ${t.emoji}\n\nSpring GBM is pulling up and we've got a LOT in store this semester. New events, new collabs, new everything.\n\nWhether you've been here since day one or this is your first time — come through!\n\n📅 ${monthDay} at ${event.time}\n📍 ${event.location}\n\n${t.cta}`,
        visual: "Split layout: left side shows bold event title + date/time, right side shows candid photos from last semester's events in a collage grid"
      },
      reminder: {
        caption: t.vibe === "hype"
          ? `⏰ ${t.reminder}\n\n${event.title} is TOMORROW at ${event.time}.\n\n📍 ${event.location}\n\nWe're not doing the whole "wish I went to that" thing this semester. See you there. 💪`
          : t.vibe === "witty"
          ? `${t.reminder} to actually leave your dorm tomorrow ${t.emoji}\n\n${event.title}\n📍 ${event.location} · ${event.time}\n\nYour Netflix queue isn't going anywhere. We are.`
          : `${t.reminder} — our GBM is tomorrow! ${t.emoji}\n\n📍 ${event.location}\n⏰ ${event.time}\n\nWe can't wait to see everyone there. Bring a friend!`,
        visual: "Story-format countdown graphic: '1 DAY' in large bold text, event details below, use org brand colors with a gradient"
      },
      dayof: {
        caption: t.vibe === "hype"
          ? `IT'S GO TIME 🔥\n\nDoors open in 2 hours. ${event.location}.\n\nSee you there or see you never (jk but seriously come).`
          : `Today's the day! ${t.emoji}\n\nWe're getting set up at ${event.location} right now. Doors open at ${event.time}.\n\nSlide through!`,
        visual: "Behind-the-scenes setup photo: chairs being arranged, laptop on podium, name tags laid out — authentic, not staged"
      },
      recap: {
        caption: t.vibe === "hype"
          ? `${t.recap} 🔥🔥🔥\n\nInsane turnout at our Spring GBM. This semester is about to be one for the books.\n\nIf you missed it — don't worry, we've got SO much more coming. Stay locked in.\n\nTag yourself 👇`
          : t.vibe === "witty"
          ? `${t.recap} ${t.emoji}\n\nOur Spring GBM had the vibes, the people, and exactly zero awkward icebreakers (okay maybe one).\n\nMissed it? We forgive you. But our next event? Non-negotiable.\n\nTag your crew 👇`
          : `${t.recap} at our Spring GBM! ${t.emoji}\n\nThank you to everyone who came out and helped us kick off an incredible semester. We can't wait for what's ahead.\n\nStay tuned for upcoming events — you won't want to miss what we have planned.\n\nTag yourselves below! 👇`,
        visual: "Photo carousel (5-6 slides): wide shot of full room, e-board presenting, candid audience reactions, group photo, close-up of food/merch table"
      }
    },
    workshop: {
      teaser: {
        caption: t.vibe === "hype"
          ? `YOUR RESUME NEEDS WORK. (said with love) 💼\n\n${event.title} is coming and this is your chance to get real feedback from actual recruiters.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : t.vibe === "witty"
          ? `Your resume said "proficient in Microsoft Word" and we need to talk ${t.emoji}\n\n${event.title} — actual recruiters, actual feedback, actually useful.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : t.vibe === "polished"
          ? `${t.excitement} ${event.title} ${t.emoji}\n\nJoin us for an exclusive workshop where you'll receive professional resume feedback and industry insights directly from recruiters.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : `Tryna land that internship this summer? 👀\n\n${event.title} is your shot to get real eyes on your resume from people who actually make hiring decisions.\n\n📅 ${monthDay} at ${event.time}\n📍 ${event.location}\n\nBring your resume (yes, printed) 📄`,
        visual: "Professional graphic with company logo, event title in bold, subtle briefcase/document icon, clean corporate-meets-campus aesthetic"
      },
      reminder: {
        caption: t.vibe === "hype"
          ? `TOMORROW 📋\n\n${event.title} — ${event.time} at ${event.location}.\n\nBring your resume. Bring your A-game. Leave with a better shot at your dream job. 🎯`
          : `Quick reminder — ${event.title} is tomorrow! ${t.emoji}\n\n📍 ${event.location} · ${event.time}\n\nDon't forget to bring a printed copy of your resume!`,
        visual: "Clean story graphic: 'TOMORROW' header, event name, a checklist: '☑ Resume ☑ Pen ☑ Questions to ask'"
      },
      dayof: {
        caption: `We're set up and ready! ${t.emoji}\n\n${event.title} starts in 2 hours at ${event.location}.\n\nLast chance to print that resume and pull up. See you soon!`,
        visual: "Quick photo of venue setup: tables arranged, company banners visible, name tags ready"
      },
      recap: {
        caption: t.vibe === "hype"
          ? `THE CONNECTIONS WERE MADE 🤝\n\nMassive thanks for an incredible workshop. Resumes were reviewed, advice was given, and LinkedIn connections were exchanged.\n\nThis is what ${orgName} is about. More events loading soon... 👀`
          : t.vibe === "witty"
          ? `Resumes: reviewed ✅\nConfidence: boosted ✅\nLinkedIn connections: sent at suspicious speed ✅\n\nHuge thanks to everyone who came through. This is why you show up to ${orgName} events ${t.emoji}\n\nStay tuned for more 📌`
          : `What an incredible session! ${t.emoji}\n\nOur members had the opportunity to receive hands-on resume feedback from industry professionals. Events like these are at the core of what ${orgName} does.\n\nMore professional development opportunities coming soon — stay tuned!`,
        visual: "Photo carousel: students talking with recruiters, someone reviewing a resume, group photo with company reps"
      }
    },
    social: {
      teaser: {
        caption: t.vibe === "hype"
          ? `NO HOMEWORK. NO STRESS. JUST VIBES. 🍿\n\n${event.title} is happening and you literally have no excuse not to come.\n\nSnacks provided. Friends provided. Good time guaranteed.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\nPull. Up.`
          : t.vibe === "witty"
          ? `Your Netflix algorithm is getting stale and we have a solution ${t.emoji}\n\n${event.title} — big screen, free snacks, and people who actually laugh at the same parts you do.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : t.vibe === "polished"
          ? `Looking for a fun way to unwind this week? Join us for ${event.title}! ${t.emoji}\n\nWe'll have snacks and drinks provided. It's a great opportunity to relax and connect with fellow members.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : `movie night movie night MOVIE NIGHT 🎬🍿\n\ncome hang with us this ${dayOfWeek}! we've got the big screen, we've got snacks, and we've got the vibes.\n\n📅 ${monthDay} at ${event.time}\n📍 ${event.location}\n\nvote for the movie in our story poll! ⬆️`,
        visual: "Fun, casual graphic: popcorn emoji + movie clapboard aesthetic, dark background with neon-glow text, event details prominent"
      },
      reminder: {
        caption: t.vibe === "hype"
          ? `TOMORROW NIGHT 🍿🔥\n\n${event.title} — ${event.time} at ${event.location}.\n\nFree snacks. Good company. Zero regrets.\n\nBring your blanket if you're that person. We respect it.`
          : `${event.title} is TOMORROW! 🎬\n\n📍 ${event.location} · ${event.time}\n\nSnacks are on us. Just bring yourself (and maybe a friend)! ${t.emoji}`,
        visual: "Story countdown: '1 DAY' with popcorn and movie ticket graphics, warm/cozy color palette"
      },
      dayof: {
        caption: `Lights are dimming in 2 hours 🎬\n\n${event.location} · ${event.time}\n\nWe've got the snacks stocked and the screen ready. See you tonight! ${t.emoji}`,
        visual: "Boomerang/photo of snack table setup, cozy venue with screen visible"
      },
      recap: {
        caption: t.vibe === "hype"
          ? `MOVIE NIGHT WAS A MOVIE (literally) 🎬🔥\n\nThe vibes were immaculate. The snacks were demolished. The company was elite.\n\nIf you weren't there... you fumbled. But we'll give you another chance soon 😤\n\nTag your movie night crew 👇`
          : t.vibe === "witty"
          ? `Rating our own event 5 stars on Letterboxd ${t.emoji}\n\nMovie night was exactly what we all needed this week. Good film, better people, best snacks (gone in 20 minutes btw).\n\nMore chill events coming — stay posted 📌\n\nTag who you were with 👇`
          : `${event.title} was a hit! ${t.emoji}\n\nNothing beats winding down with a great movie and even better company. Thanks to everyone who came out!\n\nMore social events coming soon — keep an eye on our page!\n\nTag yourself 👇`,
        visual: "Photo carousel: audience watching screen (dark/moody shot), close-up of snack spread, candid laughing photos, group selfie"
      }
    },
    info: {
      teaser: {
        caption: t.vibe === "hype"
          ? `BUILDERS WANTED 🛠️\n\n${event.title} — this is where it starts. Come find your team, hear about what we're building, and lock in.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\nWhether you code, design, or just have wild ideas — we need you. ${t.cta}`
          : t.vibe === "witty"
          ? `You know that project idea you've been sitting on? ${t.emoji}\n\n${event.title} is your excuse to finally do something about it. Teams are forming, prizes are real, and the energy is going to be unmatched.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\n${t.cta}`
          : `Interested in our upcoming hackathon? ${t.emoji}\n\n${event.title} will cover everything you need to know — format, prizes, team formation, and timeline.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\nAll skill levels welcome. ${t.cta}`,
        visual: "Tech-forward graphic: code brackets, hackathon theme, event details on dark background with accent color highlights"
      },
      reminder: {
        caption: `${event.title} is TOMORROW ${t.emoji}\n\n📍 ${event.location} · ${event.time}\n\nCome with ideas, leave with a team. All experience levels welcome!`,
        visual: "Story graphic with countdown, hackathon logo/branding, 'TOMORROW' in bold"
      },
      dayof: {
        caption: `T-minus 2 hours until ${event.title} ${t.emoji}\n\nWe're at ${event.location} getting everything ready. Come find your team tonight!`,
        visual: "Quick venue setup photo with laptops visible, tech/hacker aesthetic"
      },
      recap: {
        caption: t.vibe === "hype"
          ? `The teams are LOCKED IN 🔒\n\n${event.title} was electric. We've got builders, designers, and visionaries all ready to create something insane.\n\nHackathon details dropping soon. You're not ready for this. 👀`
          : `${event.title} was a success! ${t.emoji}\n\nTeams are formed, ideas are flowing, and we can't wait to see what everyone builds. Stay tuned for hackathon details!\n\nMissed it? DM us — there's still time to get involved.`,
        visual: "Photo carousel: engaged audience, whiteboard with ideas, people networking/forming teams, excited group shots"
      }
    },
    networking: {
      teaser: {
        caption: t.vibe === "hype"
          ? `YOUR NETWORK = YOUR NET WORTH 💰\n\n${event.title} — alumni from tech, finance, and consulting are coming back to campus to connect with YOU.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\nBusiness casual. Bring your questions. Bring your energy. ${t.cta}`
          : t.vibe === "witty"
          ? `LinkedIn stalking is cool but have you tried... talking to people? ${t.emoji}\n\n${event.title} — meet alumni who've actually been where you're trying to go.\n\n📅 ${monthDay} · ${event.time}\n📍 ${event.location}\n\nBusiness casual · ${t.cta}`
          : t.vibe === "polished"
          ? `${t.excitement} ${event.title} ${t.emoji}\n\nConnect with distinguished alumni working across technology, finance, and consulting. This is a unique opportunity to expand your professional network and gain valuable career insights.\n\n📅 ${dayOfWeek}, ${monthDay}\n⏰ ${event.time}\n📍 ${event.location}\n\nBusiness casual attire requested. ${t.cta}`
          : `Alumni Mixer this ${dayOfWeek}! 🤝\n\nWe've got alumni from some amazing companies coming back to campus to chat, share advice, and connect.\n\n📅 ${monthDay} at ${event.time}\n📍 ${event.location}\n\nDress business casual and bring your curiosity! ${t.cta}`,
        visual: "Sophisticated graphic: professional color palette, silhouettes networking, company logos of represented industries, clean typography"
      },
      reminder: {
        caption: t.vibe === "hype"
          ? `TOMORROW — Don't miss this one 🎯\n\n${event.title}\n📍 ${event.location} · ${event.time}\n\nPro tip: have your elevator pitch ready and your LinkedIn QR code pulled up. Let's get it. 💼`
          : `Reminder: ${event.title} is tomorrow! ${t.emoji}\n\n📍 ${event.location} · ${event.time}\n\nDon't forget — business casual! See you there.`,
        visual: "Clean story: 'TOMORROW' + event details + 'Pro tip: Prepare 2-3 questions for alumni'"
      },
      dayof: {
        caption: `We're setting up at ${event.location} right now ${t.emoji}\n\n${event.title} starts at ${event.time}. Business casual.\n\nCome ready to make connections that matter. See you in a few hours!`,
        visual: "Venue setup: tables with name cards, welcome signage, professional but warm atmosphere"
      },
      recap: {
        caption: t.vibe === "hype"
          ? `CONNECTIONS WERE MADE. MOVES WERE PLOTTED. 🤝💼\n\n${event.title} brought out incredible alumni and even more incredible conversations.\n\nThis is what sets ${orgName} apart. We don't just talk about it — we make it happen.\n\nMore career events loading soon 👀`
          : `What an evening! ${t.emoji}\n\n${event.title} was an incredible opportunity to connect with alumni across multiple industries. Thank you to everyone who attended and to our alumni for sharing their time and wisdom.\n\nStay tuned for more networking and career events this semester!`,
        visual: "Photo carousel: alumni chatting with students, exchanging business cards, wide room shot, group photo"
      }
    }
  };

  const eventType = event.type || "gbm";
  const content = contentByType[eventType] || contentByType.gbm;

  const posts = [
    { platform: plat1, type: "announcement", timing: "5-7 days before event", caption: content.teaser.caption, hashtags: `${tag} #UMD #Terps #CampusLife #StudentOrgs`, visual_suggestion: content.teaser.visual },
    { platform: plat1, type: "reminder", timing: "1 day before event", caption: content.reminder.caption, hashtags: `${tag} #UMD`, visual_suggestion: content.reminder.visual },
    { platform: plat2, type: "story", timing: "Day of event, 2 hours before", caption: content.dayof.caption, hashtags: "", visual_suggestion: content.dayof.visual },
    { platform: plat1, type: "recap", timing: "Day after event", caption: content.recap.caption, hashtags: `${tag} #UMD #Terps #CampusLife`, visual_suggestion: content.recap.visual },
  ];

  if (platforms.includes("LinkedIn")) {
    const liCaptions = {
      gbm: `Excited to kick off the spring semester with ${orgName}'s General Body Meeting!\n\nWe welcomed both returning and new members as we shared our vision for the semester ahead. From professional development workshops to networking mixers, we have an incredible lineup planned.\n\nInterested in getting involved? Feel free to reach out.\n\n${tag} #StudentLeadership #UniversityOfMaryland`,
      workshop: `Great turnout at our ${event.title}!\n\nOur members had the opportunity to receive hands-on resume feedback from industry professionals. Events like these are at the core of what ${orgName} does — bridging the gap between campus and career.\n\n${tag} #CareerDevelopment #Networking #UMD`,
      social: `Community building is just as important as career building.\n\nOur ${event.title} reminded us why ${orgName} is more than a professional organization — it's a community. Looking forward to more events that bring our members together.\n\n${tag} #StudentLife #Community #UMD`,
      info: `Innovation starts with a team.\n\nAt our ${event.title}, we saw incredible energy as students from diverse backgrounds came together to form hackathon teams. Can't wait to see what they build.\n\n${tag} #Innovation #Hackathon #UMD`,
      networking: `Grateful for the alumni who came back to campus for our ${event.title}.\n\nOur members connected with professionals across tech, finance, and consulting — gaining insights that no textbook can provide.\n\n${tag} #AlumniNetworking #CareerGrowth #UMD`,
    };
    posts.push({ platform: "LinkedIn", type: "announcement", timing: "1-2 days after event (professional recap)", caption: liCaptions[eventType] || liCaptions.gbm, hashtags: "", visual_suggestion: "Professional group photo or polished event highlight — LinkedIn-appropriate, well-lit, shows engaged participants" });
  }

  if (platforms.includes("TikTok") && plat1 !== "TikTok" && plat2 !== "TikTok") {
    const tikTokCaptions = {
      gbm: `POV: you actually show up to your org's GBM this semester 🫡\n\n#${orgName.replace(/\s+/g, "")} #UMD #StudentOrgs #CollegeLife #ClubLife #GBM`,
      workshop: `asking recruiters what they ACTUALLY look for on a resume 😳📋\n\n#${orgName.replace(/\s+/g, "")} #ResumeTips #CareerTok #UMD #CollegeLife`,
      social: `movie night with the org >>> movie night alone 🍿🎬\n\n#${orgName.replace(/\s+/g, "")} #MovieNight #CollegeLife #UMD #StudentOrgs`,
      info: `when you find your hackathon team at the info session 🤝🔥\n\n#${orgName.replace(/\s+/g, "")} #Hackathon #TechTok #UMD #BuildInPublic`,
      networking: `networking tip: just be genuinely curious about people 🤝\n\nalso this mixer was insane\n\n#${orgName.replace(/\s+/g, "")} #NetworkingTips #CareerTok #UMD`,
    };
    posts.push({ platform: "TikTok", type: "story", timing: "Day of event (capture authentic moments)", caption: tikTokCaptions[eventType] || tikTokCaptions.gbm, hashtags: "", visual_suggestion: "Quick-cut TikTok: setup timelapse → first attendees arriving → highlight moments → packed room reveal. Trending audio overlay." });
  }

  return posts;
}

// Smooth animated counter
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

// ==================== MAIN COMPONENT ====================
export default function PostPilot() {
  const [screen, setScreen] = useState("landing");
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
  const [screenHistory, setScreenHistory] = useState(["landing"]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const navigateTo = (s) => { setScreenHistory(prev => [...prev, s]); setScreen(s); };
  const goBack = () => {
    if (screenHistory.length > 1) {
      const h = [...screenHistory]; h.pop();
      setScreenHistory(h); setScreen(h[h.length - 1]);
    }
  };

  const togglePlatform = (p) => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      setEvents(prev => [...prev, { ...newEvent, id: Date.now() }]);
      setNewEvent({ title: "", date: "", time: "", location: "", description: "", type: "gbm" });
      setShowAddEvent(false);
    }
  };

  const generateContent = async (event) => {
    setSelectedEvent(event);
    setGenerating(true);
    setGenerationProgress(0);
    navigateTo("generate");

    // Progress animation
    const steps = [
      { pct: 15, delay: 400 }, { pct: 35, delay: 700 },
      { pct: 60, delay: 500 }, { pct: 80, delay: 600 }, { pct: 95, delay: 400 },
    ];
    let apiSuccess = false;

    const progressPromise = (async () => {
      for (const s of steps) {
        await new Promise(r => setTimeout(r, s.delay));
        setGenerationProgress(s.pct);
      }
    })();

    // Try API in parallel
    try {
      let data;
      const endpoints = ["/api/generate", "https://api.anthropic.com/v1/messages"];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514", max_tokens: 1000,
              messages: [{ role: "user", content: `You are a social media manager for "${orgName}", a student org at UMD. Tone: ${tone}. Description: ${orgDesc}. Generate content for: ${event.title} on ${event.date} at ${event.time}, ${event.location}. ${event.description}\n\nReturn ONLY valid JSON: {"posts":[{"platform":"Instagram","type":"announcement|reminder|story|recap","timing":"when to post","caption":"full caption with emojis","hashtags":"#tags","visual_suggestion":"image desc"}]}\n\nGenerate 4-5 posts. Make captions feel like a real student org social media chair — authentic, engaging, platform-native. ${tone} tone. Platforms: ${platforms.join(", ")}.` }]
            })
          });
          if (res.ok) { data = await res.json(); break; }
        } catch (e) { continue; }
      }
      if (data && data.content) {
        const text = data.content.map(i => i.text || "").join("\n");
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setGeneratedPosts(prev => ({ ...prev, [event.id]: parsed.posts }));
        apiSuccess = true;
      }
    } catch (err) { console.error("API error:", err); }

    await progressPromise;

    if (!apiSuccess) {
      const smartPosts = generateSmartContent(event, orgName, orgDesc, tone, platforms);
      setGeneratedPosts(prev => ({ ...prev, [event.id]: smartPosts }));
    }

    setGenerationProgress(100);
    await new Promise(r => setTimeout(r, 300));
    setGenerating(false);
  };

  const approvePost = (eventId, postIndex) => {
    const post = generatedPosts[eventId][postIndex];
    const already = approvedPosts.some(a => a.eventId === eventId && a.caption === post.caption);
    if (!already) {
      const eventTitle = events.find(e => e.id === eventId)?.title;
      setApprovedPosts(prev => [...prev, { ...post, eventId, eventTitle }]);
      setContentQueue(prev => [...prev, { ...post, eventId, eventTitle, status: "scheduled" }]);
    }
  };

  const getTypeColor = (type) => ({ announcement: "#E8B931", reminder: "#E85D31", story: "#9B59B6", recap: "#2ECC71" }[type] || "#666");
  const getPlatformIcon = (p) => ({ Instagram: "📸", TikTok: "🎵", LinkedIn: "💼", "Twitter/X": "🐦" }[p] || "📱");

  // Shared styles
  const S = {
    page: { minHeight: "100vh", background: "#0A0A0B", color: "#fff", fontFamily: "'DM Sans', sans-serif" },
    grad: "linear-gradient(135deg, #E85D31, #E8B931)",
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 },
    pill: (active) => ({ padding: "10px 20px", borderRadius: 50, border: active ? "1.5px solid #E85D31" : "1px solid rgba(255,255,255,0.1)", background: active ? "rgba(232,89,49,0.12)" : "rgba(255,255,255,0.03)", color: active ? "#E8A031" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }),
    input: { width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    label: { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8, letterSpacing: "0.5px" },
    sub: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300, lineHeight: 1.6 },
  };

  const NavLogo = ({ onClick, showBack }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onClick}>
      {showBack && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, marginRight: 2 }}>‹</span>}
      <div style={{ width: 32, height: 32, borderRadius: 8, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈</div>
      <span style={{ fontSize: 18, fontWeight: 700 }}>PostPilot</span>
    </div>
  );

  // ============ LANDING ============
  if (screen === "landing") {
    return (
      <div style={{ ...S.page, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,89,49,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,185,49,0.1) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", position: "relative", zIndex: 10 }}>
          <NavLogo onClick={() => {}} />
          <button onClick={() => navigateTo("onboard")} style={{ background: S.grad, border: "none", color: "#fff", padding: "10px 28px", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s" }} onMouseOver={e => e.target.style.transform = "scale(1.05)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>Get Started →</button>
        </nav>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "80px 32px 40px" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 50, border: "1px solid rgba(232,185,49,0.3)", background: "rgba(232,185,49,0.08)", fontSize: 13, color: "#E8B931", fontWeight: 500, marginBottom: 28 }}>🚀 Built for student organizations</div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2px", margin: "0 0 24px" }}>
            Your calendar posts.<br /><span style={{ background: S.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Automatically.</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.6, fontWeight: 300 }}>PostPilot turns your org's Google Calendar into a fully managed social media presence. No design skills. No content planning. No daily effort.</p>
          <button onClick={() => navigateTo("onboard")} style={{ background: S.grad, border: "none", color: "#fff", padding: "16px 44px", borderRadius: 50, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 32px rgba(232,89,49,0.3)", transition: "all 0.3s" }} onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(232,89,49,0.4)"; }} onMouseOut={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 32px rgba(232,89,49,0.3)"; }}>Launch Demo →</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 60, padding: "50px 32px 30px", flexWrap: "wrap" }}>
          {[["800+", "Orgs at UMD"], ["73%", "Have no content strategy"], ["3 weeks", "Lost each leadership transition"]].map(([stat, label], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono', monospace", background: S.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 300 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 900, margin: "60px auto 0", padding: "0 32px 80px" }}>
          <h2 style={{ textAlign: "center", fontSize: 14, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 48, fontWeight: 500 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: "📅", title: "Connect Calendar", desc: "Sync your Google Calendar. PostPilot reads your events automatically." },
              { icon: "🧠", title: "AI Generates Content", desc: "Smart content arcs for each event — teasers, reminders, recaps." },
              { icon: "✅", title: "Review & Approve", desc: "Quick approve or edit. One click to schedule across platforms." },
              { icon: "📈", title: "Watch It Grow", desc: "Track engagement, optimize timing, and grow your audience." },
            ].map((step, i) => (
              <div key={i} style={{ ...S.card, padding: "32px 24px", transition: "all 0.3s" }} onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{step.title}</div>
                <div style={S.sub}>{step.desc}</div>
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
      <div style={S.page}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px" }}>
          <NavLogo onClick={goBack} showBack />
          <button onClick={goBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "8px 20px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>← Back</button>
        </nav>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 32px 80px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8 }}>Set up your org</h1>
          <p style={{ ...S.sub, marginBottom: 40, fontSize: 15 }}>Tell PostPilot about your organization so it can match your voice.</p>
          <div style={{ marginBottom: 28 }}>
            <label style={S.label}>ORGANIZATION NAME</label>
            <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Terrapin Tech Club" style={S.input} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={S.label}>DESCRIPTION</label>
            <textarea value={orgDesc} onChange={e => setOrgDesc(e.target.value)} placeholder="What does your org do? Who are your members? What's your vibe?" rows={3} style={{ ...S.input, resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ ...S.label, marginBottom: 12 }}>BRAND TONE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {TONES.map(t => <button key={t} onClick={() => setTone(t)} style={S.pill(tone === t)}>{t}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 40 }}>
            <label style={{ ...S.label, marginBottom: 12 }}>PLATFORMS</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)} style={S.pill(platforms.includes(p))}>{getPlatformIcon(p)} {p}</button>)}
            </div>
          </div>
          <div style={{ ...S.card, padding: "20px 24px", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📅</span>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>Google Calendar</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Demo mode — loaded with sample events</div></div>
            </div>
            <div style={{ padding: "6px 16px", borderRadius: 50, background: "rgba(46,204,113,0.15)", color: "#2ECC71", fontSize: 12, fontWeight: 600 }}>✓ Connected</div>
          </div>
          <button onClick={() => canProceed && navigateTo("dashboard")} style={{ background: canProceed ? S.grad : "rgba(255,255,255,0.08)", border: "none", width: "100%", padding: 16, borderRadius: 14, color: canProceed ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 600, cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: canProceed ? "0 8px 32px rgba(232,89,49,0.25)" : "none" }}>Launch Dashboard →</button>
        </div>
      </div>
    );
  }

  // ============ PROFILE ============
  if (screen === "profile") {
    const totalGenerated = Object.values(generatedPosts).flat().length;
    return (
      <div style={S.page}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <NavLogo onClick={goBack} showBack />
          <button onClick={goBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "8px 20px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>← Back to Dashboard</button>
        </nav>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 32px 80px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>{orgName.charAt(0)}</div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 4 }}>{orgName}</h1>
              <p style={S.sub}>Member since February 2026 · Free Plan</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
            {[
              { label: "Events", value: events.length, icon: "📅" },
              { label: "Generated", value: totalGenerated, icon: "✍️" },
              { label: "Approved", value: approvedPosts.length, icon: "✅" },
              { label: "Est. Reach", value: approvedPosts.length * 120, icon: "👥" },
            ].map((s, i) => (
              <div key={i} style={{ ...S.card, padding: "18px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Org Details */}
          <div style={{ ...S.card, padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginBottom: 20, fontWeight: 600 }}>Organization Details</h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 500 }}>Name</div><div style={{ fontSize: 15, fontWeight: 500 }}>{orgName}</div></div>
              <div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 500 }}>Description</div><div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{orgDesc}</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 500 }}>Brand Tone</div><span style={{ padding: "6px 16px", borderRadius: 50, background: "rgba(232,89,49,0.1)", color: "#E8A031", fontSize: 13, fontWeight: 500 }}>{tone}</span></div>
                <div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 500 }}>Platforms</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{platforms.map(p => <span key={p} style={{ padding: "5px 12px", borderRadius: 50, background: "rgba(232,89,49,0.1)", color: "#E8A031", fontSize: 12, fontWeight: 500 }}>{getPlatformIcon(p)} {p}</span>)}</div></div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div style={{ ...S.card, padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginBottom: 20, fontWeight: 600 }}>Connected Accounts</h3>
            {[
              { name: "Google Calendar", icon: "📅", status: "connected", detail: "Demo mode" },
              { name: "Instagram", icon: "📸", status: platforms.includes("Instagram") ? "ready" : "none", detail: platforms.includes("Instagram") ? "Ready to connect" : "Not selected" },
              { name: "TikTok", icon: "🎵", status: platforms.includes("TikTok") ? "ready" : "none", detail: platforms.includes("TikTok") ? "Ready to connect" : "Not selected" },
              { name: "LinkedIn", icon: "💼", status: platforms.includes("LinkedIn") ? "ready" : "none", detail: platforms.includes("LinkedIn") ? "Ready to connect" : "Not selected" },
            ].map((acct, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{acct.icon}</span>
                  <div><div style={{ fontSize: 14, fontWeight: 500 }}>{acct.name}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{acct.detail}</div></div>
                </div>
                <div style={{ padding: "5px 14px", borderRadius: 50, fontSize: 11, fontWeight: 600, background: acct.status === "connected" ? "rgba(46,204,113,0.12)" : acct.status === "ready" ? "rgba(232,185,49,0.12)" : "rgba(255,255,255,0.05)", color: acct.status === "connected" ? "#2ECC71" : acct.status === "ready" ? "#E8B931" : "rgba(255,255,255,0.3)" }}>
                  {acct.status === "connected" ? "✓ Connected" : acct.status === "ready" ? "Connect →" : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Plan */}
          <div style={{ ...S.card, padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginBottom: 20, fontWeight: 600 }}>Plan & Usage</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
              <div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Free Plan</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>1 calendar · 8 posts/month · 1 platform</div></div>
              <button style={{ background: S.grad, border: "none", color: "#fff", padding: "10px 24px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Upgrade to Pro →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[{ label: "Posts This Month", used: totalGenerated, max: 8 }, { label: "Calendars", used: 1, max: 1 }].map((u, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{u.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{u.used}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>/ {u.max}</span>
                  </div>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 8 }}>
                    <div style={{ width: `${Math.min(100, (u.used / u.max) * 100)}%`, height: 4, borderRadius: 2, background: S.grad }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Team Members</h3>
              <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>+ Invite</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{orgName.charAt(0)}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>You</div></div>
              <span style={{ padding: "4px 12px", borderRadius: 50, background: "rgba(232,89,49,0.1)", color: "#E8A031", fontSize: 11, fontWeight: 600 }}>Admin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ GENERATE SCREEN ============
  if (screen === "generate") {
    const posts = generatedPosts[selectedEvent?.id] || [];
    return (
      <div style={S.page}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <NavLogo onClick={goBack} showBack />
          <button onClick={goBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "8px 20px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>← Back to Dashboard</button>
        </nav>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 500 }}>Content Arc For</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 6 }}>{selectedEvent?.title}</h1>
            <div style={S.sub}>📅 {selectedEvent?.date} · ⏰ {selectedEvent?.time} · 📍 {selectedEvent?.location}</div>
          </div>

          {generating ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 240, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", margin: "0 auto 28px", overflow: "hidden" }}>
                <div style={{ width: `${generationProgress}%`, height: 6, borderRadius: 3, background: S.grad, transition: "width 0.4s ease-out" }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                {generationProgress < 30 ? "📡  Analyzing event details..." : generationProgress < 60 ? "🧠  Crafting content arcs..." : generationProgress < 90 ? "🎨  Optimizing for each platform..." : "✅  Finalizing posts..."}
              </div>
              <div style={S.sub}>Generating {tone.toLowerCase()} content tailored to {orgName}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {posts.map((post, i) => {
                const isApproved = approvedPosts.some(a => a.eventId === selectedEvent.id && a.caption === post.caption);
                return (
                  <div key={i} style={{ ...S.card, overflow: "hidden", transition: "border-color 0.3s" }} onMouseOver={e => e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                    {/* Post header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{getPlatformIcon(post.platform)}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{post.platform}</span>
                        <span style={{ padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600, background: `${getTypeColor(post.type)}18`, color: getTypeColor(post.type), textTransform: "uppercase", letterSpacing: "0.5px" }}>{post.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>⏱ {post.timing}</div>
                    </div>
                    {/* Post body */}
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span style={{ fontSize: 18, opacity: 0.5, flexShrink: 0 }}>🖼️</span>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", lineHeight: 1.5 }}>{post.visual_suggestion}</div>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginBottom: 12, whiteSpace: "pre-line" }}>{post.caption}</div>
                      {post.hashtags && <div style={{ fontSize: 13, color: "#E8A031", marginTop: 8 }}>{post.hashtags}</div>}
                    </div>
                    {/* Post actions */}
                    <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                      {isApproved ? (
                        <div style={{ padding: "8px 20px", borderRadius: 50, background: "rgba(46,204,113,0.12)", color: "#2ECC71", fontSize: 13, fontWeight: 600 }}>✓ Approved & Queued</div>
                      ) : (
                        <>
                          <button onClick={() => approvePost(selectedEvent.id, i)} style={{ background: S.grad, border: "none", color: "#fff", padding: "8px 20px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✓ Approve</button>
                          <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "8px 20px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>✏️ Edit</button>
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
  const EVENT_TYPES = [
    { value: "gbm", label: "GBM / General Meeting" }, { value: "workshop", label: "Workshop / Professional Dev" },
    { value: "social", label: "Social / Hangout" }, { value: "info", label: "Info Session" }, { value: "networking", label: "Networking / Mixer" },
  ];

  return (
    <div style={S.page}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <NavLogo onClick={() => navigateTo("landing")} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginRight: 8 }}>{orgName}</span>
          <div onClick={() => navigateTo("profile")} style={{ width: 34, height: 34, borderRadius: "50%", background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(232,89,49,0.4)"; }} onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>{orgName.charAt(0)}</div>
        </div>
      </nav>
      <div style={{ display: "flex", minHeight: "calc(100vh - 71px)" }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px", flexShrink: 0 }}>
          {[
            { label: "Upcoming Events", tab: "upcoming", icon: "📅" }, { label: "Content Queue", tab: "queue", icon: "📝" },
            { label: "Analytics", tab: "analytics", icon: "📊" }, { label: "Photo Library", tab: "photos", icon: "📸" }, { label: "Settings", tab: "settings", icon: "⚙️" },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: activeTab === item.tab ? "rgba(232,89,49,0.1)" : "transparent", color: activeTab === item.tab ? "#E8A031" : "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === item.tab ? 600 : 400, textAlign: "left", marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
            {[
              { label: "Upcoming Events", value: events.length, icon: "📅" },
              { label: "Posts Generated", value: Object.values(generatedPosts).flat().length, icon: "✍️" },
              { label: "Approved & Queued", value: approvedPosts.length, icon: "✅" },
              { label: "Est. Reach", value: approvedPosts.length * 120, icon: "👥" },
            ].map((stat, i) => (
              <div key={i} style={{ ...S.card, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 500 }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "-1px" }}><AnimatedNumber value={stat.value} /></div>
              </div>
            ))}
          </div>

          {activeTab === "upcoming" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Upcoming Events</h2>
                <button onClick={() => setShowAddEvent(true)} style={{ background: S.grad, border: "none", color: "#fff", padding: "10px 22px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add Event</button>
              </div>

              {showAddEvent && (
                <div style={{ ...S.card, padding: 28, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Add New Event</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <input placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} style={{ ...S.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14 }} />
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} style={{ ...S.input, padding: "12px 16px", fontSize: 14, colorScheme: "dark" }} />
                    <input placeholder="Time (e.g. 7:00 PM)" value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))} style={{ ...S.input, padding: "12px 16px", fontSize: 14 }} />
                    <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent(p => ({...p, location: e.target.value}))} style={{ ...S.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14 }} />
                    <select value={newEvent.type} onChange={e => setNewEvent(p => ({...p, type: e.target.value}))} style={{ ...S.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14, colorScheme: "dark" }}>
                      {EVENT_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
                    </select>
                    <textarea placeholder="Event description" value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} rows={2} style={{ ...S.input, gridColumn: "1 / -1", padding: "12px 16px", fontSize: 14, resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button onClick={addEvent} style={{ background: S.grad, border: "none", color: "#fff", padding: "10px 24px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Event</button>
                    <button onClick={() => setShowAddEvent(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "10px 24px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {events.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => {
                  const hasContent = generatedPosts[event.id];
                  const approvedCount = approvedPosts.filter(p => p.eventId === event.id).length;
                  return (
                    <div key={event.id} style={{ ...S.card, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s", cursor: "pointer" }} onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(232,89,49,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{event.title}</span>
                          {hasContent && <span style={{ padding: "2px 10px", borderRadius: 50, fontSize: 11, background: "rgba(46,204,113,0.12)", color: "#2ECC71", fontWeight: 600 }}>{approvedCount}/{generatedPosts[event.id].length} approved</span>}
                        </div>
                        <div style={S.sub}>📅 {event.date} · ⏰ {event.time} · 📍 {event.location}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); generateContent(event); }} style={{ padding: "10px 22px", borderRadius: 50, background: hasContent ? "rgba(255,255,255,0.06)" : S.grad, border: hasContent ? "1px solid rgba(255,255,255,0.1)" : "none", color: hasContent ? "rgba(255,255,255,0.6)" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "transform 0.2s" }} onMouseOver={e => e.target.style.transform = "scale(1.04)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>{hasContent ? "View Posts ↗" : "Generate Content ✨"}</button>
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
                  <div style={S.sub}>Generate and approve content from your events to see them here</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {contentQueue.map((post, i) => (
                    <div key={i} style={{ ...S.card, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 22 }}>{getPlatformIcon(post.platform)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{post.eventTitle}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 50, fontSize: 10, fontWeight: 600, background: `${getTypeColor(post.type)}18`, color: getTypeColor(post.type), textTransform: "uppercase" }}>{post.type}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{post.caption}</div>
                      </div>
                      <div style={{ padding: "5px 14px", borderRadius: 50, background: "rgba(46,204,113,0.1)", color: "#2ECC71", fontSize: 12, fontWeight: 600 }}>Scheduled</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "analytics" && (
            <div style={{ ...S.card, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Analytics coming soon</div>
              <div style={{ ...S.sub, maxWidth: 400, margin: "0 auto" }}>Once your posts go live, you'll see engagement metrics, follower growth, best posting times, and conversion tracking.</div>
            </div>
          )}

          {activeTab === "photos" && (
            <div style={{ ...S.card, border: "2px dashed rgba(255,255,255,0.1)", padding: 50, textAlign: "center", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.borderColor = "rgba(232,89,49,0.3)"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Drop photos here or click to upload</div>
              <div style={{ ...S.sub, maxWidth: 400, margin: "0 auto" }}>Upload photos from past events. PostPilot's AI will auto-tag and select the best photos for each post.</div>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ ...S.card, padding: 28 }}>
              <div style={{ marginBottom: 20 }}><div style={S.label}>Organization</div><div style={{ fontSize: 16, fontWeight: 600 }}>{orgName}</div></div>
              <div style={{ marginBottom: 20 }}><div style={S.label}>Tone</div><div style={{ fontSize: 14 }}>{tone}</div></div>
              <div><div style={S.label}>Platforms</div><div style={{ display: "flex", gap: 8 }}>{platforms.map(p => <span key={p} style={{ padding: "5px 14px", borderRadius: 50, background: "rgba(232,89,49,0.1)", color: "#E8A031", fontSize: 13, fontWeight: 500 }}>{getPlatformIcon(p)} {p}</span>)}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
