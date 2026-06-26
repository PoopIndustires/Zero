# Zero+ — your browser's mini-OS

> A web port + expansion of [Zero-Start-Page](https://github.com/ChickenSoup269/Zero-Start-Page) — turning a minimalist new-tab into a fully customisable browser "operating system" with a social side-channel, app launcher, and (planned) AI + Telegram superpowers.

![Zero+ hero](https://customer-assets.emergentagent.com/job_13835587-023f-444f-bdfe-c7f71f4eba23/artifacts/03vu1zkr_ZeroPlus_Design_Document.md)

---

## 🚀 v1 features (shipped)

### Zero-core (faithful web port)
- **Sliced-typography hero** — day-of-week in a futuristic display font, big-time fallback mode, date + time triplet
- **Left icon rail** — quick access to every widget, Zero's signature nav pattern
- **Glass Google search bar** — center stage, with AI-wand button + search submit
- **Bookmark row + groups** — centered, draggable add, Main / custom groups
- **Animated backgrounds** — Aurora, Network, Matrix, Fireflies, Snow, Starfield
- **Floating widgets** — Quote, Todo, Notes (color-coded sticky cards), Timer, Calendar
- **Music pill** — bottom-center transport, vinyl, waveform
- **Settings drawer** — visibility, accent (6 colors), background, social, AI

### Zero+ additions
- **Social Sidebar** — right slide-out with embedded YouTube / Reddit / Twitch / Bluesky / Mastodon + popup TikTok / Instagram / X / Threads. Configurable. Pinnable.
- **App Launcher** — top-right waffle button opens floating apps. Triple-mode Omnibar (Web / Apps / AI) launches the same apps from search.
- **5 mini-apps** (each in a floating, draggable window):
    - 🧋 **Boba Builder** — 9 stores, customizer, chaos-randomizer, deep-link order
    - 🍅 **Pomodoro Study** — Focus / Break / Long cycles + session tasks
    - 🕰️ **Flip Clock** — fullscreen Fliqlo-style
    - 📈 **Stocks & Crypto Portfolio** — live CoinGecko + Yahoo Finance, multi-currency
    - 📰 **News Feed** — 8 RSS-powered topics, mark-as-read
- **Anonymous device sync** — no signup, no accounts. Settings auto-sync to your `device_id` via MongoDB.
- **AI scaffolding** — BYOK panel in Settings → AI. Pick OpenAI / Anthropic / Gemini / Groq / Local (WebLLM). Integration ships in v2.

---

## 📁 Repo layout

```
Zero/
├── frontend/          # React 19 + Tailwind + Framer Motion
│   ├── src/
│   │   ├── apps/        # 5 mini-apps
│   │   ├── components/  # Zero-core widgets, rail, omnibar, social, settings, window mgr, dock
│   │   ├── store/       # ZeroProvider (context+reducer) + app catalog
│   │   ├── hooks/
│   │   ├── utils/api.js
│   │   ├── constants/testIds.js
│   │   ├── App.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── craco.config.js
├── backend/           # FastAPI + MongoDB
│   ├── server.py      # /api routes for crypto, stocks, news, FX, device-settings
│   ├── tests/
│   └── requirements.txt
├── PRD.md             # full Product Requirements doc
├── ROADMAP.md         # monetization, Telegram bot, AI features, extra apps
└── README.md          # you are here
```

---

## 🏃 Quick start (local dev)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env       # set MONGO_URL, DB_NAME
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend
yarn install
cp .env.example .env       # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start                 # http://localhost:3000
```

---

## 🛣️ Roadmap snapshot

| When | What |
|------|------|
| **v1** ✅ | Zero core + Social Sidebar + 5 apps + scaffolds |
| **v2** (next) | AI features (BYOK + universal), Telegram bot, 5 more apps, theme dual-mode, bookmark groups & DnD |
| **v3** | Chrome extension wrapper, public plugin marketplace, optional cloud sync |

Full plan in [`ROADMAP.md`](./ROADMAP.md) — including monetization (Zero+ Pro $4.99/mo + affiliate + marketplace), Telegram bot architecture, AI feature spec, 20 ranked app ideas.

---

## 🌱 Credits & inspiration

- Built on the spirit of [ChickenSoup269/Zero-Start-Page](https://github.com/ChickenSoup269/Zero-Start-Page).
- Powered by free public APIs: [CoinGecko](https://www.coingecko.com), [yfinance](https://github.com/ranaroussi/yfinance), [exchangerate-api](https://www.exchangerate-api.com), RSS via [feedparser](https://github.com/kurtmckee/feedparser).

## 📝 License
MIT — see [LICENSE](./LICENSE).
