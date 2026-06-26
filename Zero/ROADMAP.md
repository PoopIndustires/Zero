# Zero+ — Full Roadmap & Strategy Doc

> Companion to PRD.md. Covers the questions you asked: monetization, Telegram bot, AI features, extra apps, doc for the whole thing.

---

## 1. The big picture

Zero+ is the **"web operating system" replacement** for the boring `chrome://newtab`. It marries the Zero startpage's minimalist DNA (no accounts, infinite customisation, glassmorphic vibe, 51 animations) with **a launcher of self-contained mini-apps** and **a social side-channel** so you never have to leave the tab. Everything is offline-first; cloud is opt-in.

> **Zero is the canvas. Zero+ is the studio.**

## 2. v1 (shipped today) → v2 → v3

### v1 (shipped 2026-06-26) — Foundation + Wow
✅ Full Zero feel ported to React web (clock, search, bookmarks, notepad, todo, timer, calendar, music)  
✅ Triple-mode Omnibar (Web / Apps / AI)  
✅ Social Sidebar (5 networks built-in, configurable)  
✅ App Launcher dock + floating windows  
✅ 5 mini-apps (Boba, Pomodoro, FlipClock, Stocks/Crypto, News)  
✅ 6 animated backgrounds, 6 accent presets, glassmorphism  
✅ Anonymous device-id sync to MongoDB  
✅ AI scaffolding in settings (UI only)  

### v2 — Multimodal + Money + Polish (~3 weeks)
- Telegram Bot integration (see §4).
- AI features unlocked (see §3) — BYOK + Emergent universal key.
- 5 more apps: Weather, Habits, Word-of-the-Day, Currency, Mini-Games hub.
- Bookmark groups + import/export.
- Macros: right-click context menus, drag-to-reorder dock, snap-grid for windows.
- Notes: rich-text + floating-window mode.
- Theme dual-mode (light + OLED-black).
- **Monetization rails switched on** (see §5).

### v3 — Ecosystem (~6–12 weeks)
- Chrome extension wrapper (Vite + manifest v3, reuses 95% of React).
- Optional Google sign-in for cross-device sync.
- Public API + plugin model — anyone can ship a mini-app.
- Marketplace (free + premium plugins, 70/30 split with creators).
- iOS + Android PWA install banners.
- Studio mode — design + publish your own background animations.

---

## 3. AI features — the BYOK story

### The vision
Anyone with an OpenAI / Anthropic / Gemini / Groq key (or a local Ollama / WebLLM model) can unlock AI throughout Zero+.

### v2 features (each shipped as a toggle in Settings → AI)
| Feature | Where it lives | Why it's useful |
|---|---|---|
| **Ask AI omnibar mode** | Omnibar | The "AI" tab actually answers questions inline, streaming |
| **Boba whisper** | Boba app | "Pick something that matches this rainy mood" → suggests combo |
| **News digest** | News app | "Summarise the last 24h of tech in 5 bullets" |
| **Notes rewrite / summarise / translate** | Notepad | Right-click any note → AI rewrite/summarise/translate |
| **Smart todo expansion** | Todo | Type "plan birthday" → AI explodes into sub-tasks |
| **Portfolio insights** | Stocks/Crypto | "Why is NVDA down today?" + risk score on portfolio |
| **Mood backgrounds** | Background | "Pick a background based on my last 3 notes" |
| **Daily briefing** | Top of page | First load each day: weather + 3 news bullets + portfolio delta + reminder |

### Provider matrix
Settings → AI lets the user pick provider + paste a key. We never proxy AI traffic through our backend by default (privacy first). For **Zero+ Pro** subscribers, we ALSO offer "use our key" via the Emergent universal LLM key, billed via subscription.

### Provider options (already wired in the UI):
- OpenAI (GPT-5.4 / 5.4-mini / 5.2)
- Anthropic (Sonnet 4.6 / Haiku 4.5)
- Google (Gemini 3.1 Pro / 3 Flash)
- Groq (free, fast — recommended default)
- **Local (WebLLM / Ollama)** — *the "less AI, runs here" mode you asked about*

### Local-only mode (the "runs here" mode)
We bundle [WebLLM](https://github.com/mlc-ai/web-llm) for in-browser inference using Llama-3.2-3B / Phi-3-mini / Qwen-2.5-1.5B (~1–2GB, downloads once, runs on WebGPU). No server. No key. No data leaves the device.

Use cases: rewriting notes, basic Ask-AI, todo expansion. Slower but 100% private.

---

## 4. Telegram Bot — your mobile remote

### What it does
Your Zero+ tab becomes a **multimodal endpoint** controllable by a Telegram bot:
- 📥 **Send anything → Zero+**: Text → Notes / Todos / Reminders. Voice → transcribed → note. Photo → saved to a notes gallery.
- 📤 **Ask Zero+ from anywhere**: `/portfolio` → live P&L. `/news tech` → digest. `/boba` → today's randomized order. `/pomodoro 25` → starts a focus timer that pings you when done.
- 🤖 **AI in-chat**: `/ask <question>` uses your configured AI provider — Telegram becomes your personal AI assistant.
- 🚨 **Urgent News push**: News topics with the alert flag push to Telegram in addition to the in-app bell.

### Architecture options

#### Option A — "Tab open" (free, simple, limited)
- Tab polls our backend every 5s. Backend stores a queue of bot commands per device.
- Works only while the user has a Zero+ tab open somewhere.
- ✅ Free, no infra. ❌ Doesn't work when tab is closed.

#### Option B — "Always on" (paid tier)
- Long-running Telegram bot service (Node or Python aiogram). One bot, multi-user.
- User links Telegram → Zero+ via a `/link CODE` flow (CODE generated in Settings).
- Backend stores `{telegram_user_id, device_id}` mapping. Bot reads/writes Mongo directly.
- ✅ Works 24/7. ❌ Needs a hosted bot process.

We ship Option A in v2 (free). Option B is **Zero+ Pro** ($4.99/mo, see §5).

### Telegram-bot commands (v2 spec)
```
/start          — onboard + link to Zero+
/link CODE      — pair this Telegram account with a Zero+ device
/help           — list commands
/note <text>    — add a note
/todo <text>    — add a todo
/portfolio      — current portfolio + 24h delta
/news <topic>   — top 5 items from a topic
/boba           — random boba order
/pomodoro [min] — start a focus timer
/ask <question> — AI ask
/digest         — full daily briefing
```

---

## 5. Monetization — how to make money

### Principle: Zero stays free. Zero+ has paid tiers that unlock **convenience**, not the core.

### Revenue paths (ranked by ease)

**1. Subscription — Zero+ Pro $4.99/mo or $39 lifetime "founders"**
- Cloud sync across unlimited devices (Google sign-in).
- AI features with our hosted Emergent universal key (no need to BYOK).
- Telegram bot Option B (24/7 — works without tab open).
- Premium backgrounds & 30+ animation packs.
- Unlimited notes/todos/bookmarks (free tier: 200 each).
- Portfolio: more holdings, history charts, CSV export.
- Boba history: unlimited (free: 30 orders).
- Early access to new apps.

**2. Affiliate links**
- **Boba app**: Each "Order" link is wrapped in store affiliate / referral codes where available (Loco etc).
- **Stocks/Crypto app**: "Open in Robinhood / Coinbase / eToro" buttons → affiliate.
- **News app**: Publisher partnerships — pay-per-click on certain feeds.

**3. Plugin marketplace** (v3)
- Free plugins encouraged.
- Paid plugins: 70/30 split (creator/us).
- Featured slot: $20/mo for placement on the launcher.

**4. White-label / B2B** (v3)
- "Zero+ for Teams" — branded startpage with shared bookmarks, team news feed, internal links.

**5. Sponsored backgrounds / themes** (v2+)
- A studio could pay us $X/mo to feature a branded animated background pack (always opt-in, never default — preserves the brand promise).

### What NOT to do
- ❌ Ads on the main shell (kills the aesthetic, kills the brand).
- ❌ Selling user data — Zero's whole brand is privacy. Never.
- ❌ Paywalling the basic Zero feature set.

### Recommended first move (this month)
- Ship Zero+ Pro tier with **just** these 3 perks at launch: (a) cloud sync, (b) hosted AI, (c) Telegram 24/7 bot. Charge $4.99/mo.
- Add a "Buy me a boba" tip jar in Settings → About → BMC link. Zero pressure, but converts the most-engaged users.
- Add affiliate links to the boba store search.

---

## 6. Extra app suggestions (ranked)

Tier S (ship next):
1. **Weather + Air Quality** — Open-Meteo, no key. Gorgeous radial cards.
2. **Habit Tracker** — Streak heatmap (GitHub-style). Daily checkbox grid.
3. **Code Snippet Vault** — Searchable + syntax-highlight + share link.
4. **Daily Briefing** (AI-powered) — Weather + 3 news + portfolio delta + 1 quote, generated each morning.
5. **Currency Converter** — Live FX, watchlist, history sparkline.

Tier A (post-v2):
6. **Maps** (your repo) — Embed your Map app, with starred places.
7. **Globe** (your repo) — Embed, day/night terminator, ISS overlay.
8. **Price-Pantry** (your repo) — Personal grocery price tracker.
9. **Scenic Images** — Unsplash + NASA APOD + drone-footage YouTube playlist embed.
10. **Games hub** — 2048, Wordle-clone, snake, minesweeper, all in floating windows.

Tier B (community plugins later):
11. **Spotify Now-Playing** (OAuth).
12. **GitHub feed** (notifications / activity).
13. **Word of the Day**.
14. **Reading list** (Pocket / Readwise integration).
15. **Calorie + Macros** quick tracker.
16. **Workout timer** with set/reps.
17. **Meditation** with breath visualiser.
18. **Random YouTube** — sticks you on a curated random video.
19. **Crypto / fear-greed index** dashboard.
20. **Whiteboard** — quick tldraw-style canvas.

---

## 7. Open questions for you (Chicken)

1. **Pro pricing** — happy with $4.99/mo + $39 lifetime, or want a different anchor?
2. **GitHub repos to port** — please share the URLs for Price-Pantry, Map, Globe so we can iframe or fork them as apps.
3. **Telegram bot Option A in v2?** — Or skip straight to Option B (paid only)?
4. **Affiliate priorities** — boba first, or stocks/crypto first?
5. **Domain** — do you have a domain in mind? `zeroplus.app`? `zero.plus`? `lessbrowser.com`?

Reply and we kick off v2 in the next session.
