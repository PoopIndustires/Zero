import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings as SettingsIcon, CheckSquare, StickyNote, Timer as TimerIcon,
    CalendarDays, Quote, Music, Clock as ClockIcon, ListChecks,
    SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, Lock, Unlock
} from "lucide-react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";

// Visibility keys mapped to icons and labels. Clicking toggles visibility (Zero's pattern).
const RAIL_ITEMS = [
    { key: "todo",     Icon: CheckSquare,     label: "Tasks" },
    { key: "notepad",  Icon: StickyNote,      label: "Notes" },
    { key: "timer",    Icon: TimerIcon,       label: "Timer" },
    { key: "calendar", Icon: CalendarDays,    label: "Calendar" },
    { key: "quote",    Icon: Quote,           label: "Quote" },
    { key: "music",    Icon: Music,           label: "Music" },
    { key: "clock",    Icon: ClockIcon,       label: "Clock" },
    { key: "bookmarks",Icon: ListChecks,      label: "Bookmarks" },
];

export function LeftRail({ onOpenSettings }) {
    const { state, dispatch } = useZero();
    const [collapsed, setCollapsed] = React.useState(false);
    const v = state.visibility;
    const accent = state.theme.accent;

    const toggleKey = (k) => dispatch({ type: "SET_PATH", path: ["visibility", k], value: !v[k] });
    const reset = () => {
        if (confirm("Reset all widget visibility?")) {
            const next = Object.fromEntries(Object.keys(v).map((k) => [k, true]));
            dispatch({ type: "SET", key: "visibility", value: next });
        }
    };
    const toggleLock = () => dispatch({ type: "SET_PATH", path: ["theme", "lockWidgets"], value: !state.theme.lockWidgets });

    return (
        <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            data-testid="left-rail"
            className="fixed top-1/2 -translate-y-1/2 left-3 z-30 flex flex-col items-center gap-1.5 p-1.5 zp-glass rounded-2xl"
            style={{ width: collapsed ? 0 : 52, overflow: "hidden", padding: collapsed ? 0 : 6, border: collapsed ? "0" : undefined }}
        >
            {!collapsed && (
                <>
                    {/* Settings at top */}
                    <RailButton
                        data-testid={TID.settingsToggle}
                        onClick={onOpenSettings}
                        Icon={SettingsIcon}
                        active={false}
                        accent={accent}
                        label="Settings"
                    />
                    <div className="w-7 h-px bg-white/[0.08] my-0.5" />
                    {/* Visibility toggles */}
                    {RAIL_ITEMS.map((it) => (
                        <RailButton
                            key={it.key}
                            data-testid={`rail-${it.key}`}
                            onClick={() => toggleKey(it.key)}
                            Icon={it.Icon}
                            active={!!v[it.key]}
                            accent={accent}
                            label={it.label}
                        />
                    ))}
                    <div className="w-7 h-px bg-white/[0.08] my-0.5" />
                    {/* Layout controls */}
                    <RailButton
                        data-testid="rail-lock"
                        onClick={toggleLock}
                        Icon={state.theme.lockWidgets ? Lock : Unlock}
                        active={state.theme.lockWidgets}
                        accent={accent}
                        label={state.theme.lockWidgets ? "Unlock" : "Lock widgets"}
                    />
                    <RailButton
                        data-testid="rail-reset"
                        onClick={reset}
                        Icon={RefreshCw}
                        active={false}
                        accent={accent}
                        label="Reset visibility"
                    />
                    <RailButton
                        data-testid="rail-collapse"
                        onClick={() => setCollapsed(true)}
                        Icon={ChevronLeft}
                        active={false}
                        accent={accent}
                        label="Collapse"
                    />
                </>
            )}
            <AnimatePresence>
                {collapsed && (
                    <motion.button
                        key="reopen"
                        data-testid="rail-expand"
                        onClick={() => setCollapsed(false)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed left-2 top-1/2 -translate-y-1/2 w-8 h-14 zp-glass rounded-r-xl flex items-center justify-center text-white/55 hover:text-white"
                    >
                        <ChevronRight size={14} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function RailButton({ Icon, active, onClick, accent, label, ...rest }) {
    return (
        <button
            {...rest}
            onClick={onClick}
            title={label}
            className="group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
                background: active ? accent : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.08)"}`,
                color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                boxShadow: active ? `0 0 18px ${accent}55` : "none",
            }}
        >
            <Icon size={15} strokeWidth={2.2} />
            {/* Tooltip on hover */}
            <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap text-[10px] uppercase tracking-[0.18em] font-mono-ui bg-black/85 border border-white/10 text-white px-2 py-1 rounded-md transition-opacity">
                {label}
            </span>
        </button>
    );
}
