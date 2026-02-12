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
npm run dev
```

The app will be running at `http://localhost:5173`

## 🌐 Deploy to Vercel (Free)

This is the easiest way to get a public URL for judges/demos.

### Option A: One-Click Deploy
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → Import your repo
4. Add your environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key)
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
│   └── generate.js        # Serverless API proxy (keeps API key safe)
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
- [ ] Instagram Graph API integration (auto-posting)
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

## 📄 License

MIT
