import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Globe, Boxes, X } from "lucide-react";
import { TID } from "@/constants/testIds";
import { findApps } from "@/store/appsCatalog";

// Zero-style centered glass search bar (with AI wand + search icon on the right)
// Modes are subtle pills inside the pill instead of big tabs. Tab cycles them.
const MODES = [
    { id: "web",  Icon: Globe,     color: "#00e5ff", label: "Web" },
    { id: "apps", Icon: Boxes,     color: "#b000ff", label: "Apps" },
    { id: "ai",   Icon: Sparkles,  color: "#ff3366", label: "AI" },
];

const GIcon = ({ color = "currentColor" }) => (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 34.9 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.1 36.2 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
);

export function ZeroSearch({ onOpenApp }) {
    const [mode, setMode] = useState("web");
    const [q, setQ] = useState("");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if ((e.metaKey || e.ctrlKey) && k === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const submit = () => {
        if (!q.trim()) return;
        if (mode === "web") {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
        } else if (mode === "apps") {
            const r = findApps(q);
            if (r[0]) onOpenApp?.(r[0].id);
        } else {
            alert("AI Ask launches in v2. Add an API key in Settings → AI.");
        }
        setQ("");
    };

    const onKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const idx = MODES.findIndex((m) => m.id === mode);
            setMode(MODES[(idx + 1) % MODES.length].id);
        }
        if (e.key === "Enter") submit();
        if (e.key === "Escape") { setQ(""); inputRef.current?.blur(); }
    };

    const apps = mode === "apps" ? findApps(q).slice(0, 6) : [];
    const active = MODES.find((m) => m.id === mode);

    return (
        <div className="w-full max-w-2xl mx-auto" data-testid={TID.omnibar}>
            <motion.div
                layout
                animate={{ scale: focused ? 1.01 : 1 }}
                className="zp-glass rounded-full px-5 py-3 flex items-center gap-3 transition-shadow"
                style={{
                    boxShadow: focused
                        ? `0 0 0 1px ${active.color}55, 0 0 32px ${active.color}33, inset 0 1px 0 rgba(255,255,255,0.06)`
                        : "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)",
                }}
            >
                {/* Left icon — Google G for Web, or mode icon */}
                <div className="shrink-0">
                    {mode === "web" ? <GIcon /> : <active.Icon size={20} style={{ color: active.color }} />}
                </div>
                <input
                    ref={inputRef}
                    data-testid={TID.omnibarInput}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    onKeyDown={onKeyDown}
                    placeholder={
                        mode === "web" ? "Search Google…" :
                        mode === "apps" ? "Search apps — try 'boba', 'stocks'…" :
                        "Ask AI anything…"
                    }
                    className="flex-1 bg-transparent outline-none border-0 text-white placeholder:text-white/40 text-base py-1"
                />
                {q && (
                    <button onClick={() => setQ("")} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/55">
                        <X size={13} />
                    </button>
                )}
                {/* Mode pills (subtle) */}
                <div className="hidden md:flex items-center gap-1 border-l border-white/10 pl-2 mr-1">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            data-testid={m.id === "web" ? TID.omnibarModeWeb : m.id === "apps" ? TID.omnibarModeApps : TID.omnibarModeAI}
                            onClick={() => { setMode(m.id); inputRef.current?.focus(); }}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition"
                            title={m.label}
                            style={{
                                background: mode === m.id ? `${m.color}22` : "transparent",
                                color: mode === m.id ? m.color : "rgba(255,255,255,0.45)",
                                boxShadow: mode === m.id ? `inset 0 0 0 1px ${m.color}55` : "none",
                            }}
                        >
                            <m.Icon size={13} />
                        </button>
                    ))}
                </div>
                <button
                    onClick={submit}
                    className="shrink-0 w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/65"
                    title="Search"
                >
                    <Search size={17} />
                </button>
            </motion.div>

            {/* Suggestions */}
            <AnimatePresence>
                {focused && mode === "apps" && apps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-2 zp-glass rounded-2xl overflow-hidden"
                        data-testid={TID.omnibarSuggestions}
                    >
                        {apps.map((s, i) => (
                            <button
                                key={s.id}
                                data-testid={TID.omnibarSuggestion(i)}
                                onMouseDown={(e) => { e.preventDefault(); onOpenApp?.(s.id); setQ(""); }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                                     style={{ background: "rgba(176,0,255,0.1)", border: "1px solid rgba(176,0,255,0.25)" }}>
                                    {s.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-display text-white text-sm font-bold">{s.name}</div>
                                    <div className="font-mono-ui text-white/45 text-[11px]">{s.description}</div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
