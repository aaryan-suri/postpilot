// Image generation utility for event graphics
// Uses Canvas API to generate images dynamically and caches them

const IMAGE_CACHE = new Map();
const CACHE_KEY_PREFIX = 'postpilot_img_';

// Generate a cache key from event data
// Includes all properties that affect image rendering
function getCacheKey(event, type = 'announcement', orgName = '') {
  if (!event || typeof event !== 'object') {
    return `${CACHE_KEY_PREFIX}${type}_fallback`;
  }
  const title = (event.title ?? '').toString().trim();
  const location = (event.location ?? '').toString().trim();
  const eventType = event.type ?? '';
  const date = event.date ?? '';
  const time = event.time ?? '';
  const id = event.id ?? '';
  return `${CACHE_KEY_PREFIX}${type}_${id}_${date}_${time}_${eventType}_${title}_${location}_${orgName}`;
}

// Load image from cache or generate new one
export function getEventImage(event, type = 'announcement', orgName = '') {
  if (typeof window === 'undefined') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjwvc3ZnPg==';
  }
  if (!event || typeof event !== 'object') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjwvc3ZnPg==';
  }
  const cacheKey = getCacheKey(event, type, orgName);
  
  // Check memory cache first
  if (IMAGE_CACHE.has(cacheKey)) {
    return IMAGE_CACHE.get(cacheKey);
  }
  
  // Check localStorage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        IMAGE_CACHE.set(cacheKey, cached);
        return cached;
      }
    }
  } catch (e) {
    // localStorage might not be available
  }
  
  // Generate new image
  const imageUrl = generateEventImage(event, type, orgName);
  IMAGE_CACHE.set(cacheKey, imageUrl);
  
  // Cache in localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, imageUrl);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  return imageUrl;
}

// Generate event announcement graphic
function generateEventImage(event, type, orgName) {
  if (!event || typeof event !== 'object') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjwvc3ZnPg==';
  }
  if (typeof document === 'undefined' || !document.createElement) {
    // Return a placeholder data URL if not in browser
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXZlbnQgSW1hZ2U8L3RleHQ+PC9zdmc+';
  }
  
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background gradient based on event type
  const gradients = {
    announcement: ['#E85D31', '#E8B931'],
    reminder: ['#9B59B6', '#E85D31'],
    story: ['#2ECC71', '#E8B931'],
    recap: ['#3498DB', '#9B59B6'],
    gbm: ['#E85D31', '#E8B931'],
    workshop: ['#3498DB', '#2ECC71'],
    social: ['#9B59B6', '#E85D31'],
    info: ['#E8B931', '#E85D31'],
    networking: ['#2ECC71', '#3498DB'],
  };
  
  const [color1, color2] = gradients[event.type || type] || gradients.announcement;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let i = 0; i < width; i += 40) {
    for (let j = 0; j < height; j += 40) {
      if ((i + j) % 80 === 0) {
        ctx.fillRect(i, j, 2, 2);
      }
    }
  }
  
  // Add decorative circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.2, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.8, 150, 0, Math.PI * 2);
  ctx.fill();
  
  // Main content area with semi-transparent overlay
  ctx.fillStyle = 'rgba(10, 10, 11, 0.7)';
  ctx.fillRect(40, 40, width - 80, height - 80);
  
  // Event title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const title = event.title || 'Event';
  const titleLines = wrapText(ctx, title, width - 160, 48);
  let yPos = 120;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, yPos + (i * 60));
  });
  
  // Date and time
  yPos += titleLines.length * 60 + 40;
  ctx.font = '32px "DM Sans", sans-serif';
  ctx.fillStyle = '#E8B931';
  ctx.fillText(event.date || '', width / 2, yPos);
  
  yPos += 50;
  ctx.font = '28px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(event.time || '', width / 2, yPos);
  
  // Location
  if (event.location) {
    yPos += 50;
    ctx.font = '24px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const locationLines = wrapText(ctx, event.location, width - 200, 24);
    locationLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, yPos + (i * 35));
    });
  }
  
  // Org name if provided
  if (orgName) {
    yPos = height - 120;
    ctx.font = '20px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(orgName, width / 2, yPos);
  }
  
  // Add decorative elements based on type
  if (type === 'reminder' || event.type === 'reminder') {
    // Countdown style
    ctx.font = 'bold 120px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (event.date) {
      try {
        const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
        const countdownText = daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil} DAYS`;
        ctx.fillText(countdownText, width / 2, height / 2);
      } catch (e) {
        // Invalid date, skip countdown
      }
    }
  }
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

// Generate countdown graphic
export function generateCountdownImage(event, daysUntil, orgName = '') {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q291bnRkb3duPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // Create cache key for countdown images (includes daysUntil which changes daily)
  const title = (event.title || '').trim();
  const location = (event.location || '').trim();
  const date = event.date || '';
  const time = event.time || '';
  const id = event.id || '';
  const cacheKey = `${CACHE_KEY_PREFIX}countdown_${id}_${date}_${time}_${daysUntil}_${title}_${location}_${orgName}`;
  
  // Check memory cache first
  if (IMAGE_CACHE.has(cacheKey)) {
    return IMAGE_CACHE.get(cacheKey);
  }
  
  // Check localStorage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        IMAGE_CACHE.set(cacheKey, cached);
        return cached;
      }
    }
  } catch (e) {
    // localStorage might not be available
  }
  
  // Ensure we're in a browser environment for canvas
  if (typeof document === 'undefined' || !document.createElement) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBBMEEwQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q291bnRkb3duPC90ZXh0Pjwvc3ZnPg==';
  }
  
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#9B59B6');
  gradient.addColorStop(1, '#E85D31');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Dark overlay
  ctx.fillStyle = 'rgba(10, 10, 11, 0.6)';
  ctx.fillRect(0, 0, width, height);
  
  // Large countdown number
  ctx.font = 'bold 200px "Space Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const countdownText = daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? '1' : String(daysUntil);
  ctx.fillText(countdownText, width / 2, height / 2 - 80);
  
  // "DAY" or "DAYS" text
  ctx.font = 'bold 64px "DM Sans", sans-serif';
  ctx.fillStyle = '#E8B931';
  const dayText = daysUntil === 1 ? 'DAY' : 'DAYS';
  ctx.fillText(dayText, width / 2, height / 2 + 100);
  
  // Event title
  ctx.font = 'bold 36px "DM Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  const title = event.title || 'Event';
  const titleLines = wrapText(ctx, title, width - 160, 36);
  let yPos = height / 2 + 200;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, yPos + (i * 45));
  });
  
  // Date and time
  yPos += titleLines.length * 45 + 30;
  ctx.font = '24px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`${event.date} · ${event.time}`, width / 2, yPos);
  
  // Location
  yPos += 35;
  ctx.font = '20px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText(event.location || '', width / 2, yPos);
  
  const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
  
  // Cache the generated image
  IMAGE_CACHE.set(cacheKey, imageUrl);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, imageUrl);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  return imageUrl;
}

// Helper function to wrap text
function wrapText(ctx, text, maxWidth, fontSize) {
  // Validate input - handle null, undefined, or non-string values
  if (!text || typeof text !== 'string') {
    return [''];
  }
  
  // Handle empty string
  const trimmedText = text.trim();
  if (!trimmedText) {
    return [''];
  }
  
  const words = trimmedText.split(' ').filter(word => word.length > 0);
  if (words.length === 0) {
    return [''];
  }
  
  const lines = [];
  let currentLine = words[0];
  
  ctx.font = `bold ${fontSize}px "DM Sans", sans-serif`;
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Clear cache (useful for testing or when events change)
export function clearImageCache() {
  IMAGE_CACHE.clear();
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore errors
  }
}
