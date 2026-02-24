# ✈️ PostPilot

**AI-powered social media manager for student organizations.**

PostPilot turns your org's Google Calendar into a fully managed social media presence — no design skills, no content planning, no daily effort required.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- An [Anthropic API key](https://console.anthropic.com/) (for AI content generation)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/postpilot.git
cd postpilot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Run locally

# For full app (incl. API routes & Google OAuth):
npx vercel dev
# Open http://localhost:3000 (not 5173!)

# Or frontend-only (no API routes):
npm run dev
# App runs at http://localhost:5173
```

### Local testing (Instagram publishing)

1. Run the full app: `npx vercel dev` and open **http://localhost:3000** (not 5173).
2. Complete **Instagram Setup** (see below): create Meta app, add redirect URI, set env vars.
3. For local dev the callback URL is `http://localhost:3000/api/auth/facebook/callback`. The Connect Instagram flow will show the exact redirect URI to add in the Meta app if not configured.
4. Profile → Connected Accounts → Connect Instagram → authorize with Facebook; you’ll be redirected back to the app.
5. Generate content for an event, approve an Instagram post, open Dashboard → Content Queue, and click **Post to Instagram**.

### Testing the Connect Instagram button

1. Run the full app: `npx vercel dev` and open **http://localhost:3000** (not 5173).
2. Complete onboarding if needed, then go to **Profile** → **Connected Accounts**.
3. Click **Connect →** next to Instagram.
4. **If configured:** You should be redirected to Meta/Facebook to authorize; after authorizing you return to the app with Instagram connected.
5. **If not configured:** The UI shows which env vars are missing and the exact redirect URI to add in the Meta app. See **Instagram Setup** below and README → Environment Variables.

## 🌐 Deploy to Vercel (Free)

This is the easiest way to get a public URL for judges/demos.

### Option A: One-Click Deploy
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → Import your repo
4. Add your environment variables (at least `ANTHROPIC_API_KEY`; for Instagram add Meta + Blob vars — see table below).
5. Click **Deploy**
6. Done! Add your custom domain (e.g. `postpilot.company`) in Vercel Settings → Domains

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Set environment variable
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

## 📁 Project Structure

```
postpilot/
├── api/
│   ├── generate.js        # Serverless API proxy (keeps API key safe)
│   ├── upload-image.js    # Upload data URL → Vercel Blob (public URL for IG)
│   ├── instagram/
│   │   └── publish.js     # Create IG media container + publish
│   └── auth/
│       ├── url.js, callback.js, refresh.js       # Google OAuth
│       └── facebook/
│           ├── url.js, callback.js, refresh.js, redirectUri.js   # Meta OAuth for Instagram
├── public/                 # Static assets
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # App wrapper
│   ├── PostPilot.jsx      # Main application component
│   └── lib/
│       └── analytics.js   # Frontend analytics helper (session + track)
├── server/
│   └── analyticsStore.js  # Analytics storage (KV / Supabase / JSON dev)
├── .env.example           # Environment variable template
├── .gitignore
├── index.html             # HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🤝 Contributing (For Co-Founders)

### First time setup
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/postpilot.git
cd postpilot
npm install

# Create your local .env file
cp .env.example .env
# Add the shared API key (ask the team for it — NEVER commit .env)

# Create a branch for your work
git checkout -b your-name/feature-name
```

### Daily workflow
```bash
# Pull latest changes
git pull origin main

# Create a feature branch
git checkout -b your-name/what-youre-working-on

# Make your changes, then:
git add .
git commit -m "describe what you changed"
git push origin your-name/what-youre-working-on

# Go to GitHub and open a Pull Request
```

### Branch naming conventions
- `feature/google-calendar-oauth` — new features
- `fix/api-error-handling` — bug fixes
- `ui/dashboard-redesign` — UI/design changes

## 🗺️ Roadmap

### MVP (Current)
- [x] Landing page
- [x] Org onboarding (name, description, tone, platforms)
- [x] Dashboard with event management
- [x] AI content generation (via Claude API)
- [x] Post approval & scheduling queue
- [ ] Google Calendar OAuth integration (currently using demo events)

### Next Up
- [ ] Real Google Calendar sync
- [x] Instagram Graph API integration (auto-posting) — connect in Profile, post from Content Queue
- [ ] Photo library with AI tagging
- [x] Analytics dashboard (events → posts → publishes)
- [ ] Multi-org support
- [ ] Campus context awareness (weather, academic calendar)

### Future
- [ ] Cross-org network / collaboration suggestions
- [ ] University institutional licenses
- [ ] Expansion beyond student orgs (nonprofits, community groups)

## 📸 Instagram Setup

To enable **Connect Instagram** and posting to Instagram:

1. **Create a Meta App**
   - Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App** → **Consumer** (or **Business**).
   - In the app dashboard: **Add Product** → **Facebook Login** → **Settings**.

2. **Add OAuth redirect URI(s)**
   - Under **Valid OAuth Redirect URIs** add:
     - **Local:** `http://localhost:3000/api/auth/facebook/callback`
     - **Production:** `https://<your-vercel-domain>/api/auth/facebook/callback` (e.g. `https://postpilot.company/api/auth/facebook/callback`)
   - The Connect Instagram flow returns the exact callback URL in its response when env vars are missing; use that value in the Meta app.

3. **Required permissions / scopes**
   - The app requests: `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`. Ensure your app has Instagram Graph API and Facebook Login enabled.

4. **Required environment variables**
   - **`META_APP_ID`** — from Meta app dashboard → Settings → Basic.
   - **`META_APP_SECRET`** — from the same page (show and copy).
   - **`FRONTEND_URL`** (optional but recommended) — e.g. `https://postpilot.company` or `http://localhost:3000`. Used to derive the OAuth callback URL if `META_REDIRECT_URI` is not set.
   - **`META_REDIRECT_URI`** (optional if derived) — set to the exact callback URL if you don’t use `FRONTEND_URL`/`VERCEL_URL`. Otherwise the app derives it as `{FRONTEND_URL or https://VERCEL_URL or http://localhost:3000}/api/auth/facebook/callback`.

5. **Vercel**
   - In Vercel → **Project Settings** → **Environment Variables**, set `META_APP_ID`, `META_APP_SECRET`, and (recommended) `FRONTEND_URL` to your production URL. Redeploy after changing env vars.

6. **Local**
   - Use `npx vercel dev` and open **http://localhost:3000**. The derived callback is `http://localhost:3000/api/auth/facebook/callback`; ensure that URL is added in the Meta app’s Valid OAuth Redirect URIs.

If something is misconfigured, **Connect Instagram** shows which keys are missing and the redirect URI to add in the Meta dashboard.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Calendar sync |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Calendar sync |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/api/auth/callback` for local) | For Calendar sync |
| `META_APP_ID` | Meta/Facebook app ID | For Instagram publishing |
| `META_APP_SECRET` | Meta/Facebook app secret | For Instagram publishing |
| `FRONTEND_URL` | App base URL (e.g. `https://postpilot.company` or `http://localhost:3000`); used to derive OAuth callback if `META_REDIRECT_URI` not set | Optional (recommended) |
| `META_REDIRECT_URI` | OAuth callback (e.g. `http://localhost:3000/api/auth/facebook/callback`). Optional if `FRONTEND_URL` or `VERCEL_URL` is set — then derived as `{base}/api/auth/facebook/callback` | Optional when derived |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-set when you add a Blob store to the project) | For image upload → Instagram |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis connection (auto-set when you add a KV store) | For analytics events (preferred) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase Postgres REST endpoint and service role key | Optional fallback analytics store |

**Instagram publishing:** Your Instagram account must be a **Business or Creator** account connected to a **Facebook Page**. See **Instagram Setup** above for step-by-step Meta app and env configuration.

### Analytics: how it works

- **Client-side tracking:** The browser generates a short-lived `sessionId` stored in `sessionStorage` (no analytics data is stored in `localStorage`). The helper in `src/lib/analytics.js` sends small JSON events to `POST /api/analytics/track`.
- **Hobby plan deployment note:** Vercel Hobby plan limits deployments to **12 serverless functions**. To avoid adding new functions, `/api/analytics/*` is handled via a rewrite to the existing `/api/generate` function (see `vercel.json`). Analytics storage/aggregation code lives in `server/analyticsStore.js` (outside `/api` so it doesn't count as a function).
- **Events captured:** The app records:
  - Event ingestion (`event_ingested`) for Google Calendar sync and demo events
  - Manual event creation (`event_added_manual`)
  - Content lifecycle: `post_generated`, `post_approved`, `post_rejected` (future), `post_queued`
  - Publishing lifecycle: `publish_attempted`, `publish_succeeded`, `publish_failed`
  - Photo workflow: `photo_uploaded`, `photo_assigned`
- **Server-side storage:** `/api/analytics/track` validates the payload and appends into an **append-only** `analytics_events` store:
  - If **Vercel KV** env vars are present, events are stored as a Redis list per org (`analytics:{orgId}:events`, capped at 20k events).
  - Otherwise, if **Supabase** env is present, events are written to an `analytics_events` Postgres table via the Supabase REST API.
  - For local-only dev with no backing store, events are written to `.data/analytics-events.json` (not used in production).
- **Aggregation on read:** `GET /api/analytics/summary` computes daily rollups on demand (no cron jobs) for a given window (`7d|30d|90d`):
  - Generated / approved / published / failed publish counts
  - Average **Generate → Approve** and **Approve → Publish** times (minutes)
  - Event ingestion totals + breakdown (Google / demo / manual)
  - Top events by posts generated and a simple platform breakdown.
- **Analytics UI:** The **Analytics** tab in the dashboard calls `/api/analytics/summary` and renders:
  - KPI cards for the metrics above
  - A time series of generated / approved / published posts
  - A bar chart of top events by generated posts
  - A donut chart of platform mix (Instagram now, TikTok/X-ready)
  - A recent activity feed (last ~20 analytics events).

### Supabase schema (optional analytics DB)

If you choose to back analytics with Supabase Postgres instead of Vercel KV, create the following table in your Supabase project:

```sql
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  orgId text not null,
  sessionId text not null,
  userId text null,
  type text not null,
  timestamp timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_org_ts_idx
  on public.analytics_events (orgId, timestamp desc);
```

Then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment. If both KV and Supabase are configured, **KV wins** for analytics storage.

### Testing analytics locally

1. Run `npx vercel dev` and open `http://localhost:3000`.
2. From the dashboard:
   - Use demo events or connect Google Calendar to ingest events.
   - Generate content for an event, approve a post, and (optionally) publish to Instagram.
   - Upload photos and tag them to events.
3. Open the **Analytics** tab:
   - Use the range selector (7d / 30d / 90d) to see rollups.
   - In dev, click **Emit test event** to quickly verify that tracking and the backend pipeline are wired up.
4. (Optional) For debugging, call `GET /api/analytics/events` in local dev — it returns the last ~500 raw analytics events. This route is **disabled in production**.

## Known limitations (MVP)

- **Token storage:** Google and Meta tokens are stored in `localStorage` for the MVP. Replace with httpOnly cookies or server-side session storage for production.
- **Scheduling:** "Post to Instagram" publishes immediately. No scheduled/time-delayed posting yet.
- **Meta token lifetime:** Page access tokens from the OAuth flow are short-lived. For production, implement long-lived token exchange (see Meta docs) and optional refresh.
- **Single org:** One connected Instagram account per browser session; no multi-org or multi-account switching in this release.

## 📄 License

MIT
