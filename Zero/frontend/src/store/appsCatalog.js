// Catalog of mini-apps available in the App Launcher
export const APPS = [
    {
        id: "boba",
        name: "Boba Builder",
        icon: "🧋",
        description: "Design your perfect bubble tea — with chaos randomizer",
        tags: ["food", "fun", "drink", "boba", "tea"],
        defaults: { w: 560, h: 660 },
    },
    {
        id: "pomodoro",
        name: "Pomodoro Study",
        icon: "🍅",
        description: "Focus timer with task list & cycle tracking",
        tags: ["study", "focus", "timer", "productivity"],
        defaults: { w: 460, h: 560 },
    },
    {
        id: "flipclock",
        name: "Flip Clock",
        icon: "🕰️",
        description: "Fullscreen flip clock — Fliqlo-style",
        tags: ["clock", "time", "fliqlo", "minimal"],
        defaults: { w: 720, h: 360 },
    },
    {
        id: "stocks",
        name: "Stocks & Crypto",
        icon: "📈",
        description: "Live portfolio P&L, watchlist, trending coins",
        tags: ["stocks", "crypto", "money", "finance", "portfolio"],
        defaults: { w: 720, h: 600 },
    },
    {
        id: "news",
        name: "News Feed",
        icon: "📰",
        description: "Curated topics — tech, world, finance, gaming…",
        tags: ["news", "feed", "rss", "tech", "world"],
        defaults: { w: 640, h: 640 },
    },
];

export const findApps = (q) => {
    if (!q) return APPS;
    const term = q.toLowerCase();
    return APPS.filter(
        (a) =>
            a.id.includes(term) ||
            a.name.toLowerCase().includes(term) ||
            a.tags.some((t) => t.includes(term))
    );
};
