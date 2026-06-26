import React, { useCallback, useEffect, useState } from "react";
import "@/App.css";
import { ZeroProvider, useZero } from "@/store/ZeroProvider";
import { BackgroundLayer } from "@/components/Background";
import { ZeroHero } from "@/components/ZeroHero";
import { ZeroSearch } from "@/components/ZeroSearch";
import { BookmarkRow } from "@/components/BookmarkRow";
import { MusicPill } from "@/components/MusicPill";
import { QuoteWidget } from "@/components/QuoteWidget";
import { LeftRail } from "@/components/LeftRail";
import { TodoWidget } from "@/components/TodoWidget";
import { NotepadWidget } from "@/components/NotepadWidget";
import { TimerWidget } from "@/components/TimerWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { SocialSidebar } from "@/components/SocialSidebar";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { FloatingWindow } from "@/components/FloatingWindow";
import { DraggableWidget } from "@/components/DraggableWidget";
import { APPS } from "@/store/appsCatalog";
import { TID } from "@/constants/testIds";
import { BobaBuilder } from "@/apps/BobaBuilder";
import { Pomodoro } from "@/apps/Pomodoro";
import { FlipClock } from "@/apps/FlipClock";
import { StocksCrypto } from "@/apps/StocksCrypto";
import { News } from "@/apps/News";
import { Users, LayoutGrid, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const APP_RENDERERS = {
    boba: BobaBuilder,
    pomodoro: Pomodoro,
    flipclock: FlipClock,
    stocks: StocksCrypto,
    news: News,
};

function AppGrid({ open, setOpen, onOpenApp }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/55 backdrop-blur-md z-40"
                    />
                    <motion.div
                        data-testid="app-grid"
                        initial={{ scale: 0.92, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 zp-glass-hi rounded-3xl p-7 w-[640px] max-w-[92vw]"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <div className="font-outfit text-2xl font-extrabold text-white">All Apps</div>
                                <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45 mt-0.5">Click to open · drag windows · resize</div>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70">
                                <X size={15} />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {APPS.map((a, i) => (
                                <motion.button
                                    key={a.id}
                                    data-testid={`grid-app-${a.id}`}
                                    whileHover={{ y: -4, scale: 1.04 }}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => { onOpenApp(a.id); setOpen(false); }}
                                    className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                >
                                    <div className="text-4xl">{a.icon}</div>
                                    <div className="font-outfit text-[13px] font-bold text-white text-center">{a.name}</div>
                                    <div className="font-mono-ui text-[9px] text-white/45 text-center line-clamp-2 leading-tight">{a.description}</div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Shell() {
    const { state, dispatch } = useZero();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [gridOpen, setGridOpen] = useState(false);

    const openApp = useCallback((id) => {
        const app = APPS.find((a) => a.id === id);
        if (!app) return;
        dispatch({
            type: "WINDOW_OPEN",
            id,
            defaults: {
                w: app.defaults.w,
                h: app.defaults.h,
                x: 240 + Math.random() * 200,
                y: 100 + Math.random() * 80,
            },
        });
    }, [dispatch]);

    useEffect(() => {
        document.documentElement.style.setProperty("--zp-accent-current", state.theme.accent);
    }, [state.theme.accent]);

    const toggleSidebar = () => dispatch({ type: "SET_PATH", path: ["social", "open"], value: !state.social.open });

    // Music: if positions.music is null, fall back to a sensible default (centered bottom).
    const musicPos = state.widgetPositions?.music;
    const musicDefault = { x: window.innerWidth / 2 - 220, y: window.innerHeight - 110 };

    return (
        <div data-testid={TID.shell} className="h-screen w-screen relative overflow-hidden">
            <BackgroundLayer preset={state.theme.background} />

            {/* Left vertical icon rail */}
            <LeftRail onOpenSettings={() => setSettingsOpen(true)} />

            {/* Top-right: app grid + social */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                {state.visibility.socialSidebar && (
                    <button
                        data-testid={TID.socialSidebarToggle}
                        onClick={toggleSidebar}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/85 transition"
                        style={{
                            background: "rgba(10, 10, 20, 0.78)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        title="Social Sidebar"
                    >
                        <Users size={16} />
                    </button>
                )}
                <button
                    data-testid="app-grid-toggle"
                    onClick={() => setGridOpen(true)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition"
                    style={{
                        background: "rgba(255,255,255,0.95)",
                        color: "#0a0a0a",
                        boxShadow: `0 4px 16px rgba(0,0,0,0.35)`,
                    }}
                    title="All Apps"
                >
                    <LayoutGrid size={16} strokeWidth={2.2} />
                </button>
            </div>

            {/* CENTER COLUMN — hero, search, bookmarks (always centered, not draggable) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none gap-7 pt-4 pb-44">
                <div className="pointer-events-auto"><ZeroHero /></div>
                {state.visibility.search && (
                    <div className="w-full max-w-2xl pointer-events-auto">
                        <ZeroSearch onOpenApp={openApp} />
                    </div>
                )}
                <div className="pointer-events-auto"><BookmarkRow /></div>
            </div>

            {/* Draggable widgets */}
            <DraggableWidget id="quote" visible={state.visibility.quote} width={300}>
                <QuoteWidget />
            </DraggableWidget>
            <DraggableWidget id="calendar" visible={state.visibility.calendar} width={260}>
                <CalendarWidget />
            </DraggableWidget>
            <DraggableWidget id="todo" visible={state.visibility.todo} width={280}>
                <TodoWidget />
            </DraggableWidget>
            <DraggableWidget id="notepad" visible={state.visibility.notepad} width={280}>
                <NotepadWidget />
            </DraggableWidget>
            <DraggableWidget id="timer" visible={state.visibility.timer} width={260}>
                <TimerWidget />
            </DraggableWidget>

            {/* Music — draggable, default bottom-center */}
            {state.visibility.music && (
                <div
                    data-widget-id="music"
                    onPointerDown={(e) => {
                        const tag = (e.target.tagName || "").toLowerCase();
                        if (["button", "input", "textarea", "select", "a"].includes(tag)) return;
                        if (state.theme.lockWidgets) return;
                        e.preventDefault();
                        const cur = state.widgetPositions?.music || musicDefault;
                        const startX = e.clientX, startY = e.clientY;
                        const ox = cur.x, oy = cur.y;
                        const el = e.currentTarget;
                        const onMove = (ev) => {
                            const nx = ox + ev.clientX - startX;
                            const ny = oy + ev.clientY - startY;
                            el.style.left = nx + "px";
                            el.style.top = ny + "px";
                            el.style.transform = "none";
                        };
                        const onUp = (ev) => {
                            window.removeEventListener("pointermove", onMove);
                            window.removeEventListener("pointerup", onUp);
                            dispatch({
                                type: "SET_PATH",
                                path: ["widgetPositions", "music"],
                                value: { x: ox + ev.clientX - startX, y: oy + ev.clientY - startY },
                            });
                        };
                        window.addEventListener("pointermove", onMove);
                        window.addEventListener("pointerup", onUp);
                    }}
                    style={{
                        position: "fixed",
                        left: musicPos?.x ?? musicDefault.x,
                        top: musicPos?.y ?? musicDefault.y,
                        zIndex: 20,
                        cursor: state.theme.lockWidgets ? "default" : "grab",
                        touchAction: "none",
                    }}
                >
                    <MusicPill />
                </div>
            )}

            {/* Settings drawer */}
            <SettingsDrawer open={settingsOpen} setOpen={setSettingsOpen} />

            {/* App grid modal */}
            <AppGrid open={gridOpen} setOpen={setGridOpen} onOpenApp={openApp} />

            {/* Floating App windows */}
            <AnimatePresence>
                {APPS.map((app) => {
                    const w = state.windows[app.id];
                    if (!w?.open) return null;
                    const Renderer = APP_RENDERERS[app.id];
                    return (
                        <FloatingWindow
                            key={app.id}
                            id={app.id}
                            title={app.name}
                            icon={app.icon}
                            accent={state.theme.accent}
                            state={w}
                            onClose={() => dispatch({ type: "WINDOW_CLOSE", id: app.id })}
                            onFocus={() => dispatch({ type: "WINDOW_FOCUS", id: app.id })}
                            onMin={() => dispatch({ type: "WINDOW_MIN", id: app.id })}
                            onMove={(x, y) => dispatch({ type: "WINDOW_MOVE", id: app.id, x, y })}
                            onResize={(W, H) => dispatch({ type: "WINDOW_RESIZE", id: app.id, w: W, h: H })}
                        >
                            <Renderer />
                        </FloatingWindow>
                    );
                })}
            </AnimatePresence>

            <SocialSidebar />
        </div>
    );
}

export default function App() {
    return (
        <ZeroProvider>
            <Shell />
        </ZeroProvider>
    );
}
