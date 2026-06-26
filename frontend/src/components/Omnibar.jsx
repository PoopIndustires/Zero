import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Boxes, Globe, Cpu } from "lucide-react";
import { TID } from "@/constants/testIds";
import { APPS, findApps } from "@/store/appsCatalog";

const MODES = [
    { id: "web", label: "Web", Icon: Globe, ring: "zp-ring-web", color: "#00e5ff" },
    { id: "apps", label: "Apps", Icon: Boxes, ring: "zp-ring-apps", color: "#b000ff" },
    { id: "ai", label: "AI Ask", Icon: Sparkles, ring: "zp-ring-ai", color: "#ff3366" },
];

export function Omnibar({ onOpenApp }) {
    const [mode, setMode] = useState("web");
    const [q, setQ] = useState("");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    // Cmd/Ctrl + K to focus, Tab to cycle modes when focused
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

    const onKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const idx = MODES.findIndex((m) => m.id === mode);
            setMode(MODES[(idx + 1) % MODES.length].id);
        }
        if (e.key === "Enter") {
            submit();
        }
    };

    const submit = () => {
        if (!q.trim()) return;
        if (mode === "web") {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
        } else if (mode === "apps") {
            const results = findApps(q);
            if (results[0]) onOpenApp?.(results[0].id);
        } else {
            // AI mode — no integration in v1 — show a tease
            alert("AI Ask is coming in v2. Add an API key in Settings → AI to enable.");
        }
        setQ("");
    };

    const suggestions = useMemo(() => {
        if (mode !== "apps") return [];
        return findApps(q).slice(0, 6);
    }, [q, mode]);

    const active = MODES.find((m) => m.id === mode);

    return (
        <div className="w-full max-w-3xl mx-auto" data-testid={TID.omnibar}>
            <motion.div
                layout
                animate={{ scale: focused ? 1.01 : 1 }}
                className={`zp-glass rounded-2xl px-3 py-2 flex items-center gap-2 transition-shadow ${active.ring}`}
                style={{ "--zp-accent-current": active.color }}
            >
                <div className="flex items-center gap-1 px-1">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            data-testid={
                                m.id === "web" ? TID.omnibarModeWeb : m.id === "apps" ? TID.omnibarModeApps : TID.omnibarModeAI
                            }
                            onClick={() => { setMode(m.id); inputRef.current?.focus(); }}
                            className={`relative px-3 py-2 rounded-xl text-[11px] uppercase tracking-[0.18em] font-bold transition-all flex items-center gap-1.5
                                ${mode === m.id ? "text-white" : "text-white/45 hover:text-white/80"}
                            `}
                            style={mode === m.id ? { background: "rgba(255,255,255,0.06)", boxShadow: `inset 0 0 0 1px ${m.color}55` } : {}}
                        >
                            <m.Icon size={14} style={{ color: mode === m.id ? m.color : undefined }} />
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
                <div className="h-7 w-px bg-white/10" />
                <Search size={16} className="text-white/45 ml-2" />
                <input
                    ref={inputRef}
                    data-testid={TID.omnibarInput}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    onKeyDown={onKeyDown}
                    placeholder={
                        mode === "web" ? "Search the web — try ⌘K from anywhere" :
                        mode === "apps" ? "Launch an app — try 'boba', 'stocks'…" :
                        "Ask anything — add your AI key in Settings"
                    }
                    className="flex-1 bg-transparent outline-none border-0 text-white placeholder:text-white/35 font-mono-ui text-[15px] py-2"
                />
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/55 font-mono-ui">⌘K</kbd>
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/55 font-mono-ui">⇥ cycle</kbd>
            </motion.div>

            <AnimatePresence>
                {focused && mode === "apps" && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-2 zp-glass rounded-2xl overflow-hidden"
                        data-testid={TID.omnibarSuggestions}
                    >
                        {suggestions.map((s, i) => (
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
                                <Cpu size={14} className="text-white/30" />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
