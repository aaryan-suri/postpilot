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
2. In Meta app dashboard, set **Valid OAuth Redirect URIs** to `http://localhost:3000/api/auth/facebook/callback`.
3. Set `.env`: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback`, and (for image upload) create a Vercel Blob store and use its `BLOB_READ_WRITE_TOKEN`.
4. Profile → Connected Accounts → Connect Instagram → authorize with Facebook; you’ll be redirected back to the app.
5. Generate content for an event, approve an Instagram post, open Dashboard → Content Queue, and click **Post to Instagram**.

## 🌐 Deploy to Vercel (Free)

This is the easiest way to get a public URL for judges/demos.

### Option A: One-Click Deploy
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → Import your repo
4. Add your environment variables (at least `ANTHROPIC_API_KEY`; for Instagram add Meta + Blob vars — see table below).
5. Click **Deploy**
6. Done! You'll get a URL like `postpilot.vercel.app`

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
│           ├── url.js, callback.js, refresh.js   # Meta OAuth for Instagram
├── public/                 # Static assets
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # App wrapper
│   └── PostPilot.jsx      # Main application component
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
- [ ] Analytics dashboard
- [ ] Multi-org support
- [ ] Campus context awareness (weather, academic calendar)

### Future
- [ ] Cross-org network / collaboration suggestions
- [ ] University institutional licenses
- [ ] Expansion beyond student orgs (nonprofits, community groups)

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Calendar sync |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Calendar sync |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/api/auth/callback` for local) | For Calendar sync |
| `META_APP_ID` | Meta/Facebook app ID | For Instagram publishing |
| `META_APP_SECRET` | Meta/Facebook app secret | For Instagram publishing |
| `META_REDIRECT_URI` | OAuth callback (e.g. `http://localhost:3000/api/auth/facebook/callback` for local) | For Instagram publishing |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-set when you add a Blob store to the project) | For image upload → Instagram |

**Instagram publishing:** Your Instagram account must be a **Business or Creator** account connected to a **Facebook Page**. Create an app at [developers.facebook.com](https://developers.facebook.com/), add Facebook Login, and set the redirect URI in the app dashboard. For production, add your production callback URL (e.g. `https://your-app.vercel.app/api/auth/facebook/callback`) to the Meta app and set `META_REDIRECT_URI` in Vercel.

## Known limitations (MVP)

- **Token storage:** Google and Meta tokens are stored in `localStorage` for the MVP. Replace with httpOnly cookies or server-side session storage for production.
- **Scheduling:** "Post to Instagram" publishes immediately. No scheduled/time-delayed posting yet.
- **Meta token lifetime:** Page access tokens from the OAuth flow are short-lived. For production, implement long-lived token exchange (see Meta docs) and optional refresh.
- **Single org:** One connected Instagram account per browser session; no multi-org or multi-account switching in this release.

## 📄 License

MIT
