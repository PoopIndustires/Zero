import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings as SettingsIcon, CheckSquare, StickyNote, Timer as TimerIcon,
    CalendarDays, Quote, Music, Clock as ClockIcon, ListChecks,
    SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";

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
    const resetVis = () => {
        const next = Object.fromEntries(Object.keys(v).map((k) => [k, true]));
        dispatch({ type: "SET", key: "visibility", value: next });
    };

    if (collapsed) {
        return (
            <motion.button
                key="reopen"
                data-testid="rail-expand"
                onClick={() => setCollapsed(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-16 zp-glass rounded-r-2xl flex items-center justify-center text-white/55 hover:text-white"
                title="Open rail"
            >
                <ChevronRight size={14} />
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            data-testid="left-rail"
            className="fixed left-3 top-3 bottom-3 z-30 flex flex-col items-center gap-2.5 pointer-events-none"
        >
            {/* Settings — pulled out, separate rounded pill on top of the rail */}
            <button
                data-testid={TID.settingsToggle}
                onClick={onOpenSettings}
                title="Settings"
                className="pointer-events-auto w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0"
                style={{
                    background: "rgba(10, 10, 20, 0.78)",
                    backdropFilter: "blur(16px) saturate(1.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                    color: "rgba(255,255,255,0.9)",
                }}
            >
                <SettingsIcon size={17} />
            </button>

            {/* Main rail — tall vertical pill */}
            <div
                className="pointer-events-auto flex-1 max-h-full flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-[22px] overflow-y-auto zp-scroll"
                style={{
                    background: "rgba(10, 10, 20, 0.78)",
                    backdropFilter: "blur(18px) saturate(1.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 12px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
            >
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
                <div className="w-7 h-px bg-white/[0.08] my-1" />
                <RailButton
                    data-testid="rail-customize"
                    onClick={onOpenSettings}
                    Icon={SlidersHorizontal}
                    active={false}
                    accent={accent}
                    label="Customize"
                />
                <RailButton
                    data-testid="rail-reset"
                    onClick={resetVis}
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
            </div>
        </motion.div>
    );
}

function RailButton({ Icon, active, onClick, accent, label, ...rest }) {
    return (
        <button
            {...rest}
            onClick={onClick}
            title={label}
            className="group relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0"
            style={{
                background: active ? accent : "transparent",
                color: active ? "#0a1a1a" : "rgba(255,255,255,0.78)",
                boxShadow: active ? `0 0 18px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)` : "none",
            }}
        >
            <Icon size={15} strokeWidth={2.2} />
            <span className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap text-[10px] uppercase tracking-[0.18em] font-mono-ui bg-black/85 border border-white/10 text-white px-2 py-1 rounded-md transition-opacity">
                {label}
            </span>
        </button>
    );
}
