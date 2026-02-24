// Centralized event image generation + caching service
// - In-memory LRU-style cache (no localStorage)
// - In-flight promise deduping
// - Retina-aware canvas output
// - Defensive null/undefined handling

const MAX_CACHE_SIZE = 80;

// In-memory image cache: cacheKey -> dataUrl
const IMAGE_CACHE = new Map();

// Tracks in-flight generation promises to avoid duplicate work
// cacheKey -> Promise<string>
const IN_FLIGHT = new Map();

const CACHE_KEY_PREFIX = "postpilot_evtimg_";

// Simple transparent placeholder (dark card-friendly)
const FALLBACK_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" rx="40" ry="40" fill="#0A0A0B"/>
      <rect x="80" y="80" width="640" height="640" rx="32" ry="32" fill="#16161A"/>
      <circle cx="180" cy="200" r="60" fill="#202027"/>
      <circle cx="620" cy="620" r="90" fill="#202027"/>
      <rect x="160" y="320" width="480" height="40" rx="20" ry="20" fill="#262631"/>
      <rect x="200" y="400" width="400" height="24" rx="12" ry="12" fill="#1E1E26"/>
    </svg>`
  );

function safeString(value) {
  if (value == null) return "";
  try {
    return String(value).trim();
  } catch {
    return "";
  }
}

// Public: stable cache key generation
export function createEventImageCacheKey(event, type = "announcement", orgName = "") {
  if (!event || typeof event !== "object") {
    return `${CACHE_KEY_PREFIX}${type}_fallback`;
  }

  const id = safeString(event.id);
  const date = safeString(event.date);
  const time = safeString(event.time);
  const eventType = safeString(event.type || type);
  const title = safeString(event.title);
  const location = safeString(event.location);
  const org = safeString(orgName);

  // Order is important for stability; avoid JSON.stringify to keep it human-readable
  return [
    CACHE_KEY_PREFIX,
    eventType || "announcement",
    id || "noid",
    date || "nodate",
    time || "notime",
    title || "notitle",
    location || "noloc",
    org || "noorg",
  ].join("|");
}

function evictIfNeeded() {
  if (IMAGE_CACHE.size <= MAX_CACHE_SIZE) return;
  // Simple LRU-ish eviction: delete oldest inserted entry
  const firstKey = IMAGE_CACHE.keys().next().value;
  if (firstKey) {
    IMAGE_CACHE.delete(firstKey);
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getDebugFlag() {
  try {
    if (typeof window !== "undefined" && window.__PP_DEBUG_IMAGES__) return true;
  } catch {
    // ignore
  }
  return false;
}

function scheduleGeneration(fn) {
  if (!isBrowser()) {
    return Promise.resolve(fn());
  }

  // Prefer requestIdleCallback when available to avoid blocking initial paint
  if (typeof window.requestIdleCallback === "function") {
    return new Promise((resolve) =>
      window.requestIdleCallback(
        () => {
          resolve(fn());
        },
        { timeout: 1000 }
      )
    );
  }

  // Fallback to macrotask
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn()), 0);
  });
}

// Retina-aware canvas event image generation (synchronous inside scheduled task)
function generateEventImageInternal(event, type, orgName) {
  if (!isBrowser()) {
    return FALLBACK_PLACEHOLDER;
  }

  const baseWidth = 800;
  const baseHeight = 800;
  const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;

  const canvas = document.createElement("canvas");
  canvas.width = baseWidth * dpr;
  canvas.height = baseHeight * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (getDebugFlag()) {
      console.error("[eventImageService] 2D context unavailable, using fallback placeholder.");
    }
    return FALLBACK_PLACEHOLDER;
  }

  // Normalize coordinate system to CSS pixels
  ctx.scale(dpr, dpr);

  const gradients = {
    announcement: ["#E85D31", "#E8B931"],
    reminder: ["#9B59B6", "#E85D31"],
    story: ["#2ECC71", "#E8B931"],
    recap: ["#3498DB", "#9B59B6"],
    gbm: ["#E85D31", "#E8B931"],
    workshop: ["#3498DB", "#2ECC71"],
    social: ["#9B59B6", "#E85D31"],
    info: ["#E8B931", "#E85D31"],
    networking: ["#2ECC71", "#3498DB"],
  };

  const effectiveType = safeString(event?.type) || safeString(type) || "announcement";
  const [color1, color2] = gradients[effectiveType] || gradients.announcement;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Subtle pattern overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  for (let i = 0; i < baseWidth; i += 40) {
    for (let j = 0; j < baseHeight; j += 40) {
      if ((i + j) % 80 === 0) {
        ctx.fillRect(i, j, 2, 2);
      }
    }
  }

  // Decorative circles
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.beginPath();
  ctx.arc(baseWidth * 0.15, baseHeight * 0.2, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(baseWidth * 0.85, baseHeight * 0.8, 150, 0, Math.PI * 2);
  ctx.fill();

  // Main content panel
  ctx.fillStyle = "rgba(10, 10, 11, 0.7)";
  ctx.fillRect(40, 40, baseWidth - 80, baseHeight - 80);

  // Typography helpers
  const eventTitle = safeString(event?.title) || "Event";
  const eventDate = safeString(event?.date);
  const eventTime = safeString(event?.time);
  const eventLocation = safeString(event?.location);
  const org = safeString(orgName);

  // Event title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 48px "DM Sans", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const titleLines = wrapText(ctx, eventTitle, baseWidth - 160, 48);
  let yPos = 120;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, baseWidth / 2, yPos + i * 60);
  });

  // Date
  yPos += titleLines.length * 60 + 40;
  if (eventDate) {
    ctx.font = '32px "DM Sans", sans-serif';
    ctx.fillStyle = "#E8B931";
    ctx.fillText(eventDate, baseWidth / 2, yPos);
    yPos += 50;
  }

  // Time
  if (eventTime) {
    ctx.font = '28px "DM Sans", sans-serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(eventTime, baseWidth / 2, yPos);
    yPos += 50;
  }

  // Location
  if (eventLocation) {
    ctx.font = '24px "DM Sans", sans-serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    const locationLines = wrapText(ctx, eventLocation, baseWidth - 200, 24);
    locationLines.forEach((line, i) => {
      ctx.fillText(line, baseWidth / 2, yPos + i * 35);
    });
  }

  // Org name
  if (org) {
    ctx.font = '20px "DM Sans", sans-serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(org, baseWidth / 2, baseHeight - 120);
  }

  // Reminder countdown overlay
  if (effectiveType === "reminder" && eventDate) {
    ctx.font = 'bold 120px "Space Mono", monospace';
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    try {
      const daysUntil = Math.ceil(
        (new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const countdownText =
        daysUntil <= 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `${daysUntil} DAYS`;
      ctx.fillText(countdownText, baseWidth / 2, baseHeight / 2);
    } catch {
      // Ignore invalid dates
    }
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (err) {
    if (getDebugFlag()) {
      console.error("[eventImageService] Failed to convert canvas to data URL:", err);
    }
    return FALLBACK_PLACEHOLDER;
  }
}

// Lightweight text wrapping helper
function wrapText(ctx, text, maxWidth, fontSize) {
  const raw = safeString(text);
  if (!raw) return [""];

  const words = raw.split(" ").filter(Boolean);
  if (words.length === 0) return [""];

  const lines = [];
  let currentLine = words[0];

  ctx.font = `bold ${fontSize}px "DM Sans", sans-serif`;

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  lines.push(currentLine);
  return lines;
}

// Public: generate or fetch from cache; returns a Promise<string|null>
export function getEventImageSrc(event, type = "announcement", orgName = "", options = {}) {
  const { forceFresh = false } = options;

  // On the server, never touch canvas/DOM
  if (!isBrowser()) {
    return Promise.resolve(FALLBACK_PLACEHOLDER);
  }

  const cacheKey = createEventImageCacheKey(event, type, orgName);

  if (!forceFresh) {
    const cached = IMAGE_CACHE.get(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    const inflight = IN_FLIGHT.get(cacheKey);
    if (inflight) {
      return inflight;
    }
  } else {
    IMAGE_CACHE.delete(cacheKey);
  }

  const debug = getDebugFlag();

  const promise = scheduleGeneration(() => {
    if (!event || typeof event !== "object") {
      if (debug) {
        console.warn("[eventImageService] Missing or invalid event, using fallback image.", {
          event,
          type,
          orgName,
        });
      }
      return FALLBACK_PLACEHOLDER;
    }

    try {
      return generateEventImageInternal(event, type, orgName);
    } catch (err) {
      if (debug) {
        console.error("[eventImageService] Error generating event image, using fallback:", err);
      }
      return FALLBACK_PLACEHOLDER;
    }
  }).then((src) => {
    // Even if generation fails and returns placeholder, cache the result so we don't thrash
    IMAGE_CACHE.set(cacheKey, src || FALLBACK_PLACEHOLDER);
    evictIfNeeded();
    IN_FLIGHT.delete(cacheKey);
    return src || FALLBACK_PLACEHOLDER;
  });

  IN_FLIGHT.set(cacheKey, promise);
  return promise;
}

// Public: force regeneration and cache refresh for a given event
export function regenerateEventImageSrc(event, type = "announcement", orgName = "") {
  return getEventImageSrc(event, type, orgName, { forceFresh: true });
}

// Public: clear the entire image cache (useful for tests or hard resets)
export function clearEventImageCache() {
  IMAGE_CACHE.clear();
  IN_FLIGHT.clear();
}

