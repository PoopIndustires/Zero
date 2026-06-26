import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings as SettingsIcon, Sparkles, Eye, Palette, Layers, MessageSquare } from "lucide-react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";
import { BG_PRESETS } from "@/components/Background";
import { NETWORKS } from "@/components/SocialSidebar";

const ACCENTS = [
    { id: "#5DEAD4", label: "Mint" },
    { id: "#00e5ff", label: "Cyan" },
    { id: "#b000ff", label: "Violet" },
    { id: "#ff3366", label: "Hot Pink" },
    { id: "#00ff66", label: "Acid Green" },
    { id: "#ffb800", label: "Amber" },
    { id: "#ff6b00", label: "Orange" },
    { id: "#ffffff", label: "White" },
];

function Switch({ checked, onChange, testid }) {
    return (
        <button
            data-testid={testid}
            onClick={() => onChange(!checked)}
            className={`relative w-9 h-5 rounded-full transition ${checked ? "bg-white/85" : "bg-white/10 border border-white/15"}`}
        >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${checked ? "left-[18px] bg-black" : "left-0.5 bg-white/70"}`} />
        </button>
    );
}

export function SettingsDrawer({ open, setOpen }) {
    const { state, dispatch } = useZero();

    React.useEffect(() => {
        const handler = (e) => {
            if (e.key === "," && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const v = state.visibility;
    const sv = (key) => dispatch({ type: "SET_PATH", path: ["visibility", key], value: !v[key] });

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            data-testid={TID.settingsDrawer}
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 280, damping: 32 }}
                            className="fixed top-0 right-0 bottom-0 w-[420px] z-50 zp-glass-hi border-l border-white/10 overflow-y-auto zp-scroll"
                        >
                            <div className="sticky top-0 z-10 zp-glass-hi flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                                <div className="font-display text-xl font-black text-white">Settings</div>
                                <button data-testid={TID.settingsClose} onClick={() => setOpen(false)} className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                                    <X size={15} />
                                </button>
                            </div>

                            <div className="p-5 space-y-7">
                                {/* Visibility */}
                                <section data-testid={TID.settingsSection("visibility")}>
                                    <div className="flex items-center gap-2 mb-3 text-white/85"><Eye size={14} /> <h3 className="font-display font-bold text-sm uppercase tracking-[0.18em]">Visibility</h3></div>
                                    <div className="space-y-2">
                                        {["clock", "date", "search", "bookmarks", "todo", "notepad", "timer", "calendar", "music", "quote"].map((k) => (
                                            <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                                <span className="font-mono-ui text-sm text-white/75 capitalize">{k}</span>
                                                <Switch testid={TID.settingsToggleWidget(k)} checked={v[k]} onChange={() => sv(k)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Theme */}
                                <section data-testid={TID.settingsSection("theme")}>
                                    <div className="flex items-center gap-2 mb-3 text-white/85"><Palette size={14} /> <h3 className="font-display font-bold text-sm uppercase tracking-[0.18em]">Accent</h3></div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ACCENTS.map((a) => (
                                            <button
                                                key={a.id}
                                                data-testid={TID.settingsAccent(a.label.toLowerCase())}
                                                onClick={() => dispatch({ type: "SET_PATH", path: ["theme", "accent"], value: a.id })}
                                                className={`aspect-square rounded-lg border-2 transition-all ${state.theme.accent === a.id ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                                                style={{ background: a.id, boxShadow: state.theme.accent === a.id ? `0 0 24px ${a.id}88` : "none" }}
                                                title={a.label}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Background */}
                                <section data-testid={TID.settingsSection("background")}>
                                    <div className="flex items-center gap-2 mb-3 text-white/85"><Layers size={14} /> <h3 className="font-display font-bold text-sm uppercase tracking-[0.18em]">Background</h3></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {BG_PRESETS.map((p) => (
                                            <button
                                                key={p.id}
                                                data-testid={TID.settingsBg(p.id)}
                                                onClick={() => dispatch({ type: "SET_PATH", path: ["theme", "background"], value: p.id })}
                                                className={`px-3 py-2 rounded-lg text-[11px] font-mono-ui uppercase tracking-[0.15em] border transition ${
                                                    state.theme.background === p.id ? "bg-white/15 border-white/35 text-white" : "bg-white/[0.02] border-white/[0.08] text-white/55 hover:text-white"
                                                }`}
                                            >{p.label}</button>
                                        ))}
                                    </div>
                                </section>

                                {/* Social */}
                                <section data-testid={TID.settingsSection("social")}>
                                    <div className="flex items-center gap-2 mb-3 text-white/85"><MessageSquare size={14} /> <h3 className="font-display font-bold text-sm uppercase tracking-[0.18em]">Social Sidebar</h3></div>
                                    <div className="space-y-2">
                                        {state.social.available.map((id) => {
                                            const n = NETWORKS[id];
                                            const enabled = state.social.enabled.includes(id);
                                            return (
                                                <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ background: n.color }} />
                                                        <span className="font-mono-ui text-sm text-white/75 capitalize">{n.label}</span>
                                                        {n.type === "popup" && <span className="text-[9px] uppercase tracking-wider text-white/35">popup</span>}
                                                    </div>
                                                    <Switch
                                                        checked={enabled}
                                                        onChange={() => {
                                                            const next = enabled
                                                                ? state.social.enabled.filter((x) => x !== id)
                                                                : [...state.social.enabled, id];
                                                            dispatch({ type: "SET_PATH", path: ["social", "enabled"], value: next });
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* AI scaffolding */}
                                <section data-testid={TID.settingsSection("ai")}>
                                    <div className="flex items-center gap-2 mb-3 text-white/85"><Sparkles size={14} /> <h3 className="font-display font-bold text-sm uppercase tracking-[0.18em]">AI (BYOK)</h3></div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                            <span className="font-mono-ui text-sm text-white/75">Enable AI features</span>
                                            <Switch checked={state.ai.enabled} onChange={(v) => dispatch({ type: "SET_PATH", path: ["ai", "enabled"], value: v })} />
                                        </div>
                                        <select
                                            value={state.ai.provider}
                                            onChange={(e) => dispatch({ type: "SET_PATH", path: ["ai", "provider"], value: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 font-mono-ui outline-none"
                                        >
                                            <option value="openai">OpenAI</option>
                                            <option value="anthropic">Anthropic</option>
                                            <option value="google">Google (Gemini)</option>
                                            <option value="groq">Groq</option>
                                            <option value="local">Local (WebLLM)</option>
                                        </select>
                                        <input
                                            value={state.ai.apiKey}
                                            onChange={(e) => dispatch({ type: "SET_PATH", path: ["ai", "apiKey"], value: e.target.value })}
                                            placeholder="API Key (stored locally, never sent to us)"
                                            type="password"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 font-mono-ui outline-none placeholder:text-white/30"
                                        />
                                        <div className="text-[10px] text-white/40 font-mono-ui px-1">
                                            AI integration ships in v2. Key field stored locally for now.
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
