# MemeForge - AI Meme Maker 🎨

Upload a photo → AI generates 6 meme ideas → Pick one (or feel lucky) → Edit → Share → Watch reactions live on the global wall.

---

## How It Works (User Flow)

### Step 1: Upload 📤
Upload a photo via drag & drop, clipboard paste, or webcam capture.

### Step 2: AI Suggests ✨
The AI (Gemini Vision via OpenRouter) analyzes your photo and generates **6 meme suggestions**, each using a different template format tailored to what's actually in the image.

### Step 3: Pick 👆
You see 6 live previews with your actual photo. Each shows the meme text overlaid in a different style. The template name appears below each preview. You can also hit **"🎰 I'm feeling lucky"** to auto-pick one randomly.

### Step 4: Edit 🎨
A canvas editor where you can:
- Rewrite the caption text
- Drag text to reposition it
- Switch between templates
- Adjust font size

### Step 5: Export & Share 🔗
- **PNG** — downloads the meme as an image
- **Copy** — copies to clipboard for pasting anywhere
- **Share** — generates a unique link anyone can open

### Step 6: React 🤣
Anyone with the share link can react (😂💀🔥❤️😭🤡) — no signup needed. The creator sees reactions update live.

### Bonus: Meme Wall 🏆
Visit `/wall` to see today's top memes ranked by total reactions, updating in real-time.

---

## Meme Templates

Each template is a reusable layout recipe that defines where text goes and how it's styled:

| Template | Layout | Style | Best For |
|----------|--------|-------|----------|
| **Classic** | Top + bottom text | Impact font, white text, black outline | Traditional memes ("One does not simply...") |
| **Caption** | White bar above image | Clean sans-serif, black text | Twitter/Reddit screenshot style |
| **Demotivational** | Title + subtitle below | Times New Roman, white on black border | Motivational poster parodies |
| **Tweet** | Tweet text above image | Inter font, left-aligned | Fake tweet memes |
| **Reaction** | Text on the side | Sans-serif with outline | "Me when..." reaction memes |
| **Nobody:** | "Nobody:" + "Me:" above image | Sans-serif, black text | The "Nobody: / Me:" format |
| **This/That** | Two text blocks (reject/prefer) | Sans-serif, centered | Drake-style comparison memes |

Templates are **not static images** — they're code-defined recipes. The AI picks which template fits best for each suggestion, and you can switch between them in the editor.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Express.js + MongoDB + Socket.IO |
| AI | Google Gemini 2.0 Flash (via OpenRouter) |
| Real-time | Socket.IO (WebSocket) |
| Export | html2canvas |
| Theme | Dark/Light mode with system preference detection |

---

## Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** running locally or a MongoDB Atlas URI
- **OpenRouter API key** (free at https://openrouter.ai/keys)

### 1. Install

```bash
cd /Users/nitinsp/Desktop/Nitin/hackathon

# Root (concurrently)
npm install

# Client
cd client && npm install && cd ..

# Server
cd server && npm install && cd ..
```

### 2. Configure

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/memeforge
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas (free) — just paste the URI in MONGO_URI
```

### 4. Run

```bash
npm run dev
```

This starts:
- **Frontend** → http://localhost:5173 (or next available port)
- **Backend** → http://localhost:5000

### 5. Open

Go to the URL shown in terminal (e.g. http://localhost:5176) and upload a photo!

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts both client & server |
| `npm run client` | Frontend only |
| `npm run server` | Backend only |
| `npm run build` | Production build of client |

---

## Project Structure

```
hackathon/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Nav + dark/light toggle + Wall link
│   │   │   ├── PhotoUpload.jsx    # Drag/drop, paste, webcam
│   │   │   ├── MemePreview.jsx    # 6 suggestion cards with previews
│   │   │   ├── MemeCanvas.jsx     # Editor with draggable text + export
│   │   │   └── Reactions.jsx      # Live emoji reactions via WebSocket
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Main 3-step flow + feeling lucky
│   │   │   ├── Share.jsx          # Shareable meme page + reactions
│   │   │   └── Wall.jsx           # Global meme leaderboard (live)
│   │   ├── hooks/useTheme.jsx     # Dark/light mode
│   │   └── utils/templates.js     # 7 meme template definitions
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── index.js                   # Express + Socket.IO + MongoDB
│   ├── routes/meme.js             # API: suggest, share, wall, get
│   └── models/Meme.js             # Mongoose schema
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meme/suggest` | Send image, get 6 AI meme suggestions |
| POST | `/api/meme/share` | Save meme, get shareable ID |
| GET | `/api/meme/wall/today` | Today's top memes by reactions |
| GET | `/api/meme/:id` | Get a shared meme by ID |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join a meme's reaction room |
| `join-wall` | Client → Server | Join the wall live feed |
| `react` | Client → Server | Send a reaction |
| `reaction-update` | Server → Client | Updated reaction counts |
| `wall-new-meme` | Server → Client | New meme appeared |
| `wall-reaction-update` | Server → Client | Wall meme reactions changed |

---

## Deploy

### Frontend → Vercel
```bash
cd client && npx vercel --prod
```
Set env: `VITE_API_URL=https://your-backend.com`

### Backend → Render/Railway
Push to GitHub, connect on Render. Set env vars: `MONGO_URI`, `OPENROUTER_API_KEY`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm install` auth error | Add `registry=https://registry.npmjs.org/` to `.npmrc` |
| MongoDB connection refused | Start `mongod` or use Atlas URI |
| 401 Missing Authentication | Check `OPENROUTER_API_KEY` in `server/.env` |
| 429 Rate limit | OpenRouter free tier limit — wait or add credits |
| Port in use | App auto-picks next available port, check terminal output |

---

## Production Polish

| Feature | Details |
|---------|---------|
| Favicon + OG meta tags | Emoji favicon (🎨), og:title, og:description, twitter:card for link previews |
| 404 page | Fun "🫠 404 — Page not found" with "Make one →" link |
| Rate limiting | 5 requests/IP/minute on the suggest endpoint to prevent abuse |
| Image compression | Resizes to max 800px + JPEG 0.7 quality before sending (faster API calls, lower cost) |
| Page titles | Dynamic titles: "MemeForge", "Shared Meme - MemeForge", "Meme Wall - MemeForge" |
| Share page shimmer | Full shimmer skeleton UI while meme loads |
| Toast notifications | Success confirmations for PNG export, clipboard copy, and share actions |
| Error handling | Graceful error UI with retry button and specific messages (rate limit, auth, generic) |
| Animations | Fade-in, slide-up, stagger animations on page transitions and card reveals |
| Loading states | Shimmer UI with image preview while AI generates suggestions |
