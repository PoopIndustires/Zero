import React, { useEffect, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";
import { Play, Pause, RotateCcw, Plus, Check, X } from "lucide-react";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;
const LONG = 15 * 60;

function fmt(s) {
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function Pomodoro() {
    const { state, dispatch } = useZero();
    const [mode, setMode] = useState("focus"); // focus | break | long
    const [remaining, setRemaining] = useState(FOCUS);
    const [running, setRunning] = useState(false);
    const [cycles, setCycles] = useState(state.pomodoro?.cycles || 0);
    const [task, setTask] = useState("");
    const [tasks, setTasks] = useState(state.pomodoro?.tasks || []);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    setRunning(false);
                    if (mode === "focus") {
                        const nextCycles = cycles + 1;
                        setCycles(nextCycles);
                        const nextMode = nextCycles % 4 === 0 ? "long" : "break";
                        setMode(nextMode);
                        setRemaining(nextMode === "break" ? BREAK : LONG);
                    } else {
                        setMode("focus");
                        setRemaining(FOCUS);
                    }
                    try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=").play(); } catch (e) { /* ignore */ }
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [running, mode, cycles]);

    // Persist
    useEffect(() => {
        dispatch({ type: "SET_PATH", path: ["pomodoro", "cycles"], value: cycles });
    }, [cycles]);
    useEffect(() => {
        dispatch({ type: "SET_PATH", path: ["pomodoro", "tasks"], value: tasks });
    }, [tasks]);

    const totalForMode = mode === "focus" ? FOCUS : mode === "break" ? BREAK : LONG;
    const pct = (remaining / totalForMode) * 100;

    const addTask = () => {
        if (!task.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: task.trim(), done: false }]);
        setTask("");
    };

    return (
        <div data-testid={TID.appPomodoro} className="p-6 text-white h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-display text-2xl font-black">Pomodoro</h2>
                    <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">
                        {mode === "focus" ? "Deep Focus" : mode === "break" ? "Short Break" : "Long Break"}
                    </div>
                </div>
                <div className="text-4xl">🍅</div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 mb-4">
                {[
                    { id: "focus", label: "Focus", t: FOCUS },
                    { id: "break", label: "Break", t: BREAK },
                    { id: "long",  label: "Long",  t: LONG },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setRemaining(m.t); setRunning(false); }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.18em] font-mono-ui transition ${
                            mode === m.id ? "bg-white/15 text-white border border-white/25" : "text-white/55 hover:text-white hover:bg-white/5"
                        }`}
                    >{m.label}</button>
                ))}
            </div>

            {/* Timer */}
            <div className="flex flex-col items-center justify-center py-6">
                <div className="font-display text-7xl font-black tabular-nums" style={{
                    color: mode === "focus" ? "#ff3366" : "#00e5ff",
                    textShadow: `0 0 32px ${mode === "focus" ? "#ff336688" : "#00e5ff88"}`,
                }}>
                    {fmt(remaining)}
                </div>
                <div className="font-mono-ui text-[10px] text-white/40 mt-1">Cycle {cycles + 1}</div>
            </div>

            {/* Progress */}
            <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-4">
                <div className="h-full transition-all" style={{ width: `${pct}%`, background: mode === "focus" ? "#ff3366" : "#00e5ff" }} />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {!running ? (
                    <button data-testid={TID.pomoStart} onClick={() => setRunning(true)} className="px-5 py-2.5 rounded-xl bg-white text-black font-bold flex items-center gap-2 text-sm font-mono-ui">
                        <Play size={14} /> Start
                    </button>
                ) : (
                    <button data-testid={TID.pomoPause} onClick={() => setRunning(false)} className="px-5 py-2.5 rounded-xl bg-white/15 text-white border border-white/25 flex items-center gap-2 text-sm font-mono-ui">
                        <Pause size={14} /> Pause
                    </button>
                )}
                <button data-testid={TID.pomoReset} onClick={() => { setRunning(false); setRemaining(totalForMode); }} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 flex items-center gap-2 text-sm font-mono-ui">
                    <RotateCcw size={14} /> Reset
                </button>
            </div>

            {/* Tasks */}
            <div className="border-t border-white/[0.07] pt-3 flex-1">
                <div className="text-[10px] uppercase tracking-[0.3em] font-mono-ui text-white/45 mb-2">Session Tasks</div>
                <div className="flex gap-1.5 mb-2">
                    <input
                        data-testid={TID.pomoTask}
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTask()}
                        placeholder="What are you working on?"
                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 font-mono-ui outline-none focus:border-white/25"
                    />
                    <button onClick={addTask} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 flex items-center justify-center">
                        <Plus size={13} />
                    </button>
                </div>
                <div className="space-y-1">
                    {tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.03]">
                            <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} className={`w-4 h-4 rounded border flex items-center justify-center ${t.done ? "bg-white border-white" : "border-white/30 hover:border-white/70"}`}>
                                {t.done && <Check size={9} className="text-black" />}
                            </button>
                            <span className={`flex-1 text-[12px] font-mono-ui ${t.done ? "text-white/40 line-through" : "text-white/85"}`}>{t.text}</span>
                            <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-white/40 hover:text-white"><X size={11} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
