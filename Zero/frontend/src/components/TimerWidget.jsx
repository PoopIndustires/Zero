import React, { useEffect, useState } from "react";
import { TID } from "@/constants/testIds";
import { Play, Pause, RotateCcw } from "lucide-react";

function parseSmart(s) {
    // "30" => 30s, "130" => 1m30s, "13000" => 1h30m
    const n = parseInt(s, 10);
    if (isNaN(n)) return null;
    if (n < 100) return n; // seconds
    if (n < 10000) {
        const m = Math.floor(n / 100);
        const sec = n % 100;
        return m * 60 + sec;
    }
    const h = Math.floor(n / 10000);
    const m = Math.floor((n % 10000) / 100);
    const sec = n % 100;
    return h * 3600 + m * 60 + sec;
}

function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function TimerWidget() {
    const [duration, setDuration] = useState(25 * 60);
    const [remaining, setRemaining] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [input, setInput] = useState("25:00");

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    setRunning(false);
                    try { new Audio("data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=").play(); } catch (e) { /* ignore */ }
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [running]);

    const start = () => {
        const parsed = input.includes(":")
            ? input.split(":").reverse().reduce((acc, v, i) => acc + parseInt(v || 0, 10) * Math.pow(60, i), 0)
            : parseSmart(input);
        if (parsed && parsed > 0) {
            setDuration(parsed);
            setRemaining(parsed);
        }
        setRunning(true);
    };

    const pct = duration > 0 ? (remaining / duration) * 100 : 0;

    return (
        <div data-testid={TID.timerWidget} className="zp-glass rounded-2xl p-4 zp-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Timer</div>
                <input
                    data-testid={TID.timerInput}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-20 bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white/70 font-mono-ui text-right outline-none focus:border-white/25"
                    placeholder="25:00"
                />
            </div>
            <div className="text-center font-display text-5xl font-black text-white mb-3 tabular-nums">
                {fmt(remaining)}
            </div>
            <div className="h-1 rounded-full bg-white/5 mb-3 overflow-hidden">
                <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #00e5ff, #b000ff)" }} />
            </div>
            <div className="flex items-center justify-center gap-2">
                {!running ? (
                    <button data-testid={TID.timerStart} onClick={start} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-sm text-white flex items-center gap-2 font-mono-ui">
                        <Play size={12} /> Start
                    </button>
                ) : (
                    <button data-testid={TID.timerPause} onClick={() => setRunning(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-sm text-white flex items-center gap-2 font-mono-ui">
                        <Pause size={12} /> Pause
                    </button>
                )}
                <button data-testid={TID.timerReset} onClick={() => { setRunning(false); setRemaining(duration); }} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/75 flex items-center gap-2 font-mono-ui">
                    <RotateCcw size={12} /> Reset
                </button>
            </div>
        </div>
    );
}
