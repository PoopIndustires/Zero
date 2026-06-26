# Zero+ — Product Requirements Doc (PRD)

> Living document. Owner: ChickenSoup269 + E1.

## Problem statement (verbatim from user)
> https://github.com/ChickenSoup269/Zero-Start-Page — This is our basis for a new web. We need the full Zero startpage (this is the basis of our framework).
> The sidebar — upgraded to a social sidebar that lets you select your social media (IG, TikTok, YouTube, X, Reddit, etc.) and opens in a side panel so you can use the full web app without changing tabs. Search bar instead of Google can search a list of built-in apps. Apps include: Boba (loco, store, customizer, randomizer), Price-Pantry, Map, Globe, Games, Study (Pomodoro), Flip Clock, Scenic Images, News (topic feed + urgent notifs), Stocks/Crypto live portfolio (multi-currency). Suggest more apps. Notes: how to make money, integrate Telegram bot, less-AI-but-runs-here, plus AI BYOK in settings.

User v1 choices (this session):
- v1 scope = "Foundation + Wow" (full Zero feel + 5 apps + social sidebar + omnibar + AI scaffolding only)
- **NO AI key for now** — UI scaffolding only.
- **Real stocks/crypto data, NO BYOK** — CoinGecko + Yahoo (via `yfinance`), free.
- **NO AUTH** — anonymous device id, localStorage + Mongo device-sync.

## Architecture
- **Frontend**: React 19 + Tailwind + Framer Motion. Single full-screen "OS" shell at `/`.
- **Backend**: FastAPI proxies for crypto/stocks/news/fx + device-settings sync. No auth.
- **DB**: MongoDB `device_settings` (keyed by anonymous UUID).
- **State**: React Context + reducer in `ZeroProvider.jsx`. Debounced sync (1.5s) to backend.
- **Realtime data**: Public free APIs only — CoinGecko (crypto), `yfinance` (stocks), RSS feeds (news), exchangerate-api (FX). 30-600s in-memory cache + retries.

## User personas
1. **The Power-User Tab-Hoarder** — wants a beautiful new-tab that replaces 6 productivity tabs (todo, notes, timer, news, portfolio).
2. **The Boba Decider** — opens the site, hits "I'm Feeling Lucky", gets a chaos-mode order and a deep-link to the nearest store search.
3. **The Aesthetic Hacker** — picks an OLED-black + acid-green Matrix theme and uses it as their wallpaper-dashboard.

## What's been implemented (2026-06-26)

### Iteration 2 — UI overhaul + repo restructure
- **Repo restructured into `Zero/` folder** for GitHub hosting (README, LICENSE, .gitignore, PRD, ROADMAP all included). Live app symlinked from `/app/backend` and `/app/frontend` to `/app/Zero/backend` and `/app/Zero/frontend` so supervisor + hot-reload still work.
- **Major UI redesign to match the actual Zero startpage**:
    - Big sliced/stencil display-font day-name hero ("FRIDAY" in Anta + custom `hero-day-cut` clip-path)
    - Mint (`#5DEAD4`) as the default accent (matches Zero's signature)
    - Left vertical icon rail (Settings → Tasks → Notes → Timer → Calendar → Quote → Music → Clock → Bookmarks → Lock → Reset → Collapse), each toggles widget visibility, active state has mint background
    - Glass Google-style search bar (center) with multi-color G icon + mode pills + magnifying glass + clear button
    - Bookmark row (centered, with `+` add and group tabs e.g. "Main")
    - Quote widget (top-left, refreshable, collapsable)
    - Music as a black rounded pill at bottom center (vinyl + waveform + transport)
    - App-grid waffle button top-right (white) opens a modal showing all apps as 4-col tiles
    - **De-Mac'd Floating Windows**: traffic-light dots removed; new chrome = grip + app icon + title + minimize + close X, with a subtle accent gradient line under the header
- **ZERO+ pixel-font wordmark** at the top center.
- **New visibility key** for Quote widget (with rail icon + Settings toggle).

### Iteration 1 — Foundation
- Full glassmorphic OS shell, OLED-black with 6 accent presets.
- 6 animated backgrounds: Aurora, Network, Matrix, Fireflies, Snow, Starfield.
- Hero flip-clock (HH:MM:SS) + date.
- Triple-mode Omnibar (Web / Apps / AI). ⌘K shortcut, Tab cycles modes. Apps mode searches the mini-app catalog with live suggestions.
- Bookmark grid (4-col) with favicons. Add/remove via inline prompt.
- TodoWidget, NotepadWidget (color-coded + pin), TimerWidget (smart-input + progress bar), CalendarWidget (month grid), MusicWidget (visual stub, 3 demo tracks).
- Social Sidebar (right slide-out, 380px). Iframe-friendly networks (YouTube, Reddit, Twitch, Bluesky, Mastodon) render embedded; iframe-blocked ones (TikTok, Instagram, X, Threads) open as focused popups. Pinnable. Configurable from Settings.
- Settings Drawer — sections: Visibility, Accent, Background, Social, AI (BYOK scaffolding).
- App Launcher Dock (bottom centre) with 5 apps. Floating draggable + resizable windows with traffic-light controls.
- 5 mini-apps:
    - **Boba Builder** — 9 stores, 4 sizes, 7 tea bases, 6 milks, 8 toppings, ice/sugar steps, chaos slider, randomizer, save & deep-link order.
    - **Pomodoro Study** — Focus/Break/Long cycles, cycle counter, session tasks.
    - **Flip Clock** — fullscreen Fliqlo-style.
    - **Stocks & Crypto Portfolio** — live BTC/ETH/NVDA/SPY seed, multi-currency, 24h crypto change, trending coins, search-to-add for crypto & stocks.
    - **News Feed** — 8 topics from RSS (tech/world/finance/science/gaming/design/anime/climate), mark-as-read state.
- Anonymous device-id sync to MongoDB (auto on every state change, debounced).
- Test IDs on every interactive element (central registry in `constants/testIds.js`).

## Tested
- 100% backend (11/11 pytest cases at `/app/backend/tests/test_zeroplus_backend.py`).
- ~100% frontend Playwright flows. Zero console errors.
- One LOW-pri sequencing edge case (window close after min->reopen).

## Prioritized backlog

### P0 — finish v1 polish
- Fix window close edge case after minimize+reopen cycle.
- Add the Layout Controls Popup (LCP) for quick widget-hide without opening Settings.
- "Lock Widgets" toggle.

### P1 — Zero parity
- Bookmark groups + drag reorder + 3 layouts (sidebar/grid/taskbar).
- Bookmark import/export (JSON, Chrome bookmarks HTML).
- Notepad rich text (bold/italic/lists) + floating-window mode.
- Music: Web-Audio mini-player with user-supplied URLs (Soundcloud, YT audio via yt-dlp-equivalent client lib).
- Theme dual-mode (light + OLED-black) + 51-animation gallery.
- World-clock mode in FlipClock.
- macOS-style right-click context menus everywhere.

### P1 — App expansion
- **Price Pantry** (user's own GitHub repo — needs link)
- **Map** (user's own GitHub repo — needs link)
- **Globe** (user's own GitHub repo — needs link)
- **Games** suite (2048, Wordle-clone, snake, minesweeper)
- **Scenic Images** — Unsplash / NASA APOD slideshow + drone-footage embeds
- **Weather + Air Quality** (OpenMeteo, no key)
- **Currency converter** (already partly built via fx)
- **Habit tracker** (heatmap)
- **Word of the Day / Daily quote**
- **Code snippet vault** (with syntax highlight)

### P2 — Beyond Zero
- **Telegram Bot** for multimodal access (see ROADMAP.md → Telegram).
- **AI features** (BYOK + Emergent universal-key flow) — see ROADMAP.md → AI.
- **Auth + cloud sync** (optional Google sign-in for cross-device).
- **PWA install + offline mode**.
- **Chrome extension wrapper** (reuse 95% of React code via Vite + manifest v3).

## Monetization (high level — see ROADMAP.md)
- Free forever core (Zero values).
- **Zero+ Pro $4.99/mo** (or $39 lifetime founders): unlimited bookmarks/notes, cloud sync, premium themes & animations, AI features with our hosted key, Telegram bot, scenic image packs.
- Affiliate revenue from boba store deep-links, news partners, and crypto/stock broker links.

## Tech debt / notes
- `yfinance` is rate-limited; bump cache TTL or migrate to a paid quote API if traffic grows.
- Replace `@app.on_event` with `lifespan` (FastAPI deprecation).
- `_cache` is unbounded — switch to `cachetools.TTLCache`.
- Reuters RSS in news/world is deprecated — pruned in next pass.

## Next tasks (after user reviews)
1. User to share GitHub repo links for Price-Pantry / Map / Globe so we can iframe-or-port them as apps.
2. User to decide which Pro/affiliate path to pursue first (see ROADMAP.md).
3. Pick which 2 P1 apps to ship next sprint.
