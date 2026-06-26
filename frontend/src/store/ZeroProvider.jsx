// Global app state via React context. No external state lib.
// Persists everything to localStorage and (debounced) backend per device id.
import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { loadDeviceSettings, saveDeviceSettings } from "@/utils/api";
import { useDeviceId } from "@/hooks/useDeviceId";

const LS_KEY = "zp_state_v1";

const DEFAULT_STATE = {
    // Visibility toggles (Zero's signature)
    visibility: {
        clock: true,
        date: true,
        lunar: false,
        search: true,
        bookmarks: true,
        todo: true,
        notepad: true,
        timer: true,
        calendar: true,
        music: true,
        socialSidebar: true,
    },
    // Theme & background
    theme: {
        accent: "#00e5ff", // current accent
        background: "aurora", // background preset
        lockWidgets: false,
    },
    // Bookmarks (initial seed)
    bookmarks: [
        { id: "bm1", title: "GitHub", url: "https://github.com", color: "#fff" },
        { id: "bm2", title: "YouTube", url: "https://youtube.com", color: "#ff0033" },
        { id: "bm3", title: "Reddit", url: "https://reddit.com", color: "#ff4500" },
        { id: "bm4", title: "Hacker News", url: "https://news.ycombinator.com", color: "#ff6600" },
        { id: "bm5", title: "Gmail", url: "https://mail.google.com", color: "#ea4335" },
        { id: "bm6", title: "Maps", url: "https://maps.google.com", color: "#34a853" },
        { id: "bm7", title: "Drive", url: "https://drive.google.com", color: "#fbbc04" },
        { id: "bm8", title: "ChatGPT", url: "https://chat.openai.com", color: "#10a37f" },
    ],
    // Widgets
    todos: [
        { id: "t1", text: "Try the App Launcher (⌘K → Apps)", done: false },
        { id: "t2", text: "Build my Boba combo", done: false },
        { id: "t3", text: "Add my favourite stocks", done: false },
    ],
    notes: [
        { id: "n1", title: "Welcome to Zero+", body: "Your browser's mini-OS. Drag windows, switch omnibar modes, customize everything.", color: "#FFC44D", pinned: true },
    ],
    timer: { duration: 25 * 60, remaining: 25 * 60, running: false, startedAt: null },
    pomodoro: { duration: 25 * 60, remaining: 25 * 60, running: false, mode: "focus", cycles: 0, tasks: [] },
    // Social sidebar
    social: {
        enabled: ["youtube", "reddit", "twitch", "bluesky", "mastodon"],
        available: ["youtube", "reddit", "twitch", "bluesky", "mastodon", "tiktok", "instagram", "x", "threads"],
        activeTab: "youtube",
        open: false,
        pinned: false,
        // YouTube embed channel/playlist
        youtubeQuery: "lofi hip hop radio",
    },
    // AI scaffolding (no key for v1)
    ai: {
        enabled: false,
        provider: "openai",
        model: "gpt-5.2",
        apiKey: "",
    },
    // Stocks/crypto
    portfolio: {
        currency: "USD",
        crypto: [
            { id: "bitcoin", symbol: "BTC", qty: 0.05 },
            { id: "ethereum", symbol: "ETH", qty: 0.5 },
        ],
        stocks: [
            { symbol: "NVDA", qty: 2 },
            { symbol: "SPY", qty: 1 },
        ],
    },
    // News
    news: {
        topic: "tech",
        readIds: [],
    },
    // Boba
    boba: {
        history: [],
        favorites: [],
        store: "Loco",
    },
    // Window manager state
    windows: {}, // { [appId]: { open, minimized, x, y, w, h, z } }
    dock: ["boba", "pomodoro", "flipclock", "stocks", "news"],
    nextZ: 100,
};

function reducer(state, action) {
    switch (action.type) {
        case "HYDRATE":
            return { ...state, ...action.payload };
        case "PATCH":
            return { ...state, ...action.patch };
        case "SET":
            return { ...state, [action.key]: action.value };
        case "SET_PATH": {
            // mutate path like ['theme','accent']
            const next = structuredClone(state);
            let ref = next;
            for (let i = 0; i < action.path.length - 1; i++) ref = ref[action.path[i]];
            ref[action.path[action.path.length - 1]] = action.value;
            return next;
        }
        case "WINDOW_OPEN": {
            const next = structuredClone(state);
            const cur = next.windows[action.id] || {};
            next.nextZ += 1;
            next.windows[action.id] = {
                open: true,
                minimized: false,
                x: cur.x ?? action.defaults?.x ?? 120,
                y: cur.y ?? action.defaults?.y ?? 80,
                w: cur.w ?? action.defaults?.w ?? 520,
                h: cur.h ?? action.defaults?.h ?? 600,
                z: next.nextZ,
            };
            return next;
        }
        case "WINDOW_CLOSE": {
            const next = structuredClone(state);
            if (next.windows[action.id]) next.windows[action.id].open = false;
            return next;
        }
        case "WINDOW_FOCUS": {
            const next = structuredClone(state);
            next.nextZ += 1;
            if (next.windows[action.id]) next.windows[action.id].z = next.nextZ;
            return next;
        }
        case "WINDOW_MIN": {
            const next = structuredClone(state);
            if (next.windows[action.id]) next.windows[action.id].minimized = !next.windows[action.id].minimized;
            return next;
        }
        case "WINDOW_MOVE": {
            const next = structuredClone(state);
            if (next.windows[action.id]) {
                next.windows[action.id].x = action.x;
                next.windows[action.id].y = action.y;
            }
            return next;
        }
        case "WINDOW_RESIZE": {
            const next = structuredClone(state);
            if (next.windows[action.id]) {
                next.windows[action.id].w = action.w;
                next.windows[action.id].h = action.h;
            }
            return next;
        }
        default:
            return state;
    }
}

const Ctx = createContext(null);

export function ZeroProvider({ children }) {
    const deviceId = useDeviceId();
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
    const hydrated = useRef(false);
    const saveTimer = useRef(null);

    // Hydrate from localStorage (then merge from backend)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                dispatch({ type: "HYDRATE", payload: { ...DEFAULT_STATE, ...parsed } });
            }
        } catch (e) { /* ignore */ }
        hydrated.current = true;
    }, []);

    // Backend hydrate
    useEffect(() => {
        if (!deviceId) return;
        loadDeviceSettings(deviceId)
            .then((res) => {
                if (res && res.data && Object.keys(res.data).length > 0) {
                    // Only override if backend has newer data — keep simple: merge keys
                    dispatch({ type: "HYDRATE", payload: { ...res.data } });
                }
            })
            .catch(() => { /* offline ok */ });
    }, [deviceId]);

    // Persist
    useEffect(() => {
        if (!hydrated.current) return;
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(state));
        } catch (e) { /* quota */ }
        if (deviceId) {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                saveDeviceSettings(deviceId, state).catch(() => { });
            }, 1500);
        }
    }, [state, deviceId]);

    return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useZero() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useZero must be used inside ZeroProvider");
    return ctx;
}
