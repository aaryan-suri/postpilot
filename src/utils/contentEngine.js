/**
 * Smart content generation engine — fallback when Anthropic API is unavailable.
 * Generates tone-matched, event-type-aware social posts.
 */

export function generateSmartContent(event, orgName, orgDesc, tone, platforms) {
  const tag = orgName ? `#${(orgName || "").replace(/\s+/g, "")}` : "#OurOrg";
  const plat1 = platforms?.[0] || "Instagram";
  const plat2 = platforms?.[1] || platforms?.[0] || "Instagram";

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

  if (platforms?.includes("LinkedIn")) {
    const liCaptions = {
      gbm: `Excited to kick off the spring semester with ${orgName}'s General Body Meeting!\n\nWe welcomed both returning and new members as we shared our vision for the semester ahead. From professional development workshops to networking mixers, we have an incredible lineup planned.\n\nInterested in getting involved? Feel free to reach out.\n\n${tag} #StudentLeadership #UniversityOfMaryland`,
      workshop: `Great turnout at our ${event.title}!\n\nOur members had the opportunity to receive hands-on resume feedback from industry professionals. Events like these are at the core of what ${orgName} does — bridging the gap between campus and career.\n\n${tag} #CareerDevelopment #Networking #UMD`,
      social: `Community building is just as important as career building.\n\nOur ${event.title} reminded us why ${orgName} is more than a professional organization — it's a community. Looking forward to more events that bring our members together.\n\n${tag} #StudentLife #Community #UMD`,
      info: `Innovation starts with a team.\n\nAt our ${event.title}, we saw incredible energy as students from diverse backgrounds came together to form hackathon teams. Can't wait to see what they build.\n\n${tag} #Innovation #Hackathon #UMD`,
      networking: `Grateful for the alumni who came back to campus for our ${event.title}.\n\nOur members connected with professionals across tech, finance, and consulting — gaining insights that no textbook can provide.\n\n${tag} #AlumniNetworking #CareerGrowth #UMD`,
    };
    posts.push({ platform: "LinkedIn", type: "announcement", timing: "1-2 days after event (professional recap)", caption: liCaptions[eventType] || liCaptions.gbm, hashtags: "", visual_suggestion: "Professional group photo or polished event highlight — LinkedIn-appropriate, well-lit, shows engaged participants" });
  }

  if (platforms?.includes("TikTok") && plat1 !== "TikTok" && plat2 !== "TikTok") {
    const orgTag = (orgName || "").replace(/\s+/g, "");
    const tikTokCaptions = {
      gbm: `POV: you actually show up to your org's GBM this semester 🫡\n\n#${orgTag} #UMD #StudentOrgs #CollegeLife #ClubLife #GBM`,
      workshop: `asking recruiters what they ACTUALLY look for on a resume 😳📋\n\n#${orgTag} #ResumeTips #CareerTok #UMD #CollegeLife`,
      social: `movie night with the org >>> movie night alone 🍿🎬\n\n#${orgTag} #MovieNight #CollegeLife #UMD #StudentOrgs`,
      info: `when you find your hackathon team at the info session 🤝🔥\n\n#${orgTag} #Hackathon #TechTok #UMD #BuildInPublic`,
      networking: `networking tip: just be genuinely curious about people 🤝\n\nalso this mixer was insane\n\n#${orgTag} #NetworkingTips #CareerTok #UMD`,
    };
    posts.push({ platform: "TikTok", type: "story", timing: "Day of event (capture authentic moments)", caption: tikTokCaptions[eventType] || tikTokCaptions.gbm, hashtags: "", visual_suggestion: "Quick-cut TikTok: setup timelapse → first attendees arriving → highlight moments → packed room reveal. Trending audio overlay." });
  }

  return posts;
}
