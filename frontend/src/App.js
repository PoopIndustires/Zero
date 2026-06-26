import React, { useCallback, useEffect, useMemo } from "react";
import "@/App.css";
import { ZeroProvider, useZero } from "@/store/ZeroProvider";
import { BackgroundLayer } from "@/components/Background";
import { HeroClock } from "@/components/HeroClock";
import { Omnibar } from "@/components/Omnibar";
import { Bookmarks } from "@/components/Bookmarks";
import { TodoWidget } from "@/components/TodoWidget";
import { NotepadWidget } from "@/components/NotepadWidget";
import { TimerWidget } from "@/components/TimerWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { MusicWidget } from "@/components/MusicWidget";
import { SocialSidebar } from "@/components/SocialSidebar";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { FloatingWindow } from "@/components/FloatingWindow";
import { Dock } from "@/components/Dock";
import { APPS } from "@/store/appsCatalog";
import { TID } from "@/constants/testIds";
import { BobaBuilder } from "@/apps/BobaBuilder";
import { Pomodoro } from "@/apps/Pomodoro";
import { FlipClock } from "@/apps/FlipClock";
import { StocksCrypto } from "@/apps/StocksCrypto";
import { News } from "@/apps/News";
import { Users } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const APP_RENDERERS = {
    boba: BobaBuilder,
    pomodoro: Pomodoro,
    flipclock: FlipClock,
    stocks: StocksCrypto,
    news: News,
};

function Shell() {
    const { state, dispatch } = useZero();

    const openApp = useCallback(
        (id) => {
            const app = APPS.find((a) => a.id === id);
            if (!app) return;
            dispatch({
                type: "WINDOW_OPEN",
                id,
                defaults: {
                    w: app.defaults.w,
                    h: app.defaults.h,
                    x: 120 + Math.random() * 160,
                    y: 80 + Math.random() * 80,
                },
            });
        },
        [dispatch]
    );

    // Apply accent color to CSS var
    useEffect(() => {
        document.documentElement.style.setProperty("--zp-accent-current", state.theme.accent);
    }, [state.theme.accent]);

    const sidebarToggle = () => dispatch({ type: "SET_PATH", path: ["social", "open"], value: !state.social.open });

    return (
        <div data-testid={TID.shell} className="h-screen w-screen relative overflow-hidden">
            <BackgroundLayer preset={state.theme.background} />

            {/* Social sidebar toggle (left edge) */}
            {state.visibility.socialSidebar && (
                <button
                    data-testid={TID.socialSidebarToggle}
                    onClick={sidebarToggle}
                    className="fixed top-4 left-4 z-30 w-10 h-10 zp-glass rounded-xl flex items-center justify-center text-white/70 hover:text-white"
                    title="Social Sidebar"
                >
                    <Users size={16} />
                </button>
            )}

            {/* Settings (right edge) */}
            <SettingsDrawer />

            {/* Top branding */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 zp-fade-up">
                <div className="font-display text-[11px] uppercase tracking-[0.5em] text-white/40 font-bold">
                    zero<span className="text-fuchsia-400">+</span>
                </div>
            </div>

            {/* Center column */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none">
                <div className="pointer-events-auto"><HeroClock /></div>
                {state.visibility.search && (
                    <div className="mt-8 w-full max-w-3xl pointer-events-auto">
                        <Omnibar onOpenApp={openApp} />
                    </div>
                )}
            </div>

            {/* Left column widgets */}
            <div className="absolute left-4 top-20 bottom-32 w-[260px] flex flex-col gap-3 overflow-y-auto zp-scroll pr-1 pointer-events-auto">
                {state.visibility.bookmarks && <Bookmarks />}
                {state.visibility.calendar && <CalendarWidget />}
            </div>

            {/* Right column widgets */}
            <div className="absolute right-4 top-20 bottom-32 w-[260px] flex flex-col gap-3 overflow-y-auto zp-scroll pl-1 pointer-events-auto">
                {state.visibility.todo && <TodoWidget />}
                {state.visibility.notepad && <NotepadWidget />}
                {state.visibility.timer && <TimerWidget />}
            </div>

            {/* Music bar (bottom-left) */}
            {state.visibility.music && (
                <div className="fixed bottom-5 left-5 z-20 w-[260px]">
                    <MusicWidget />
                </div>
            )}

            {/* Dock */}
            <Dock onOpen={openApp} />

            {/* Floating App Windows */}
            <AnimatePresence>
                {APPS.map((app) => {
                    const w = state.windows[app.id];
                    if (!w?.open) return null;
                    const App = APP_RENDERERS[app.id];
                    return (
                        <FloatingWindow
                            key={app.id}
                            id={app.id}
                            title={app.name}
                            state={w}
                            onClose={() => dispatch({ type: "WINDOW_CLOSE", id: app.id })}
                            onFocus={() => dispatch({ type: "WINDOW_FOCUS", id: app.id })}
                            onMin={() => dispatch({ type: "WINDOW_MIN", id: app.id })}
                            onMove={(x, y) => dispatch({ type: "WINDOW_MOVE", id: app.id, x, y })}
                            onResize={(W, H) => dispatch({ type: "WINDOW_RESIZE", id: app.id, w: W, h: H })}
                        >
                            <App />
                        </FloatingWindow>
                    );
                })}
            </AnimatePresence>

            {/* Social Sidebar */}
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
