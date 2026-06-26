import React, { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Youtube } from "lucide-react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";

// Zero-style Music Player Card — matches the v0.2 design mock:
// vinyl on left, track info + source badge top, progress bar w/ timestamps,
// transport controls bottom-center, tall EQ bars on the right.
const TRACKS = [
    { title: "No Media Playing", artist: "—",                  duration: 0,   cover: null,                                                                source: null },
    { title: "Indila - Love Story [16D AUDIO]", artist: "8D MUSIX - LYF", duration: 232, cover: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=200", source: "youtube" },
    { title: "Sumeru Lo-Fi Beats", artist: "jian lofi",         duration: 195, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200", source: "youtube" },
    { title: "Velvet Static",      artist: "Neon Garden",       duration: 218, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200", source: "youtube" },
];

const fmt = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
};

export function MusicPill() {
    const { state } = useZero();
    const [i, setI] = useState(1); // start with Indila track to showcase
    const [playing, setPlaying] = useState(false);
    const [pos, setPos] = useState(69); // 1:09
    const t = TRACKS[i];
    const accent = state.theme.accent;
    const isEmpty = i === 0;

    // Fake progress when playing
    useEffect(() => {
        if (!playing || isEmpty) return;
        const id = setInterval(() => {
            setPos((p) => (p >= t.duration ? 0 : p + 1));
        }, 1000);
        return () => clearInterval(id);
    }, [playing, isEmpty, t.duration]);

    const next = () => { setI((i + 1) % TRACKS.length); setPos(0); };
    const prev = () => { setI((i + TRACKS.length - 1) % TRACKS.length); setPos(0); };

    if (!state.visibility.music) return null;

    const progressPct = t.duration > 0 ? (pos / t.duration) * 100 : 0;

    return (
        <div
            data-testid={TID.musicWidget}
            className="rounded-[22px] zp-fade-up relative overflow-hidden"
            style={{
                width: 460,
                background: "rgba(8,10,16,0.86)",
                backdropFilter: "blur(28px) saturate(1.6)",
                border: `1px solid ${accent}26`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${accent}1a`,
            }}
        >
            <div className="flex items-stretch p-3.5 gap-3">
                {/* Left: Vinyl */}
                <div className="relative shrink-0 self-center">
                    <div
                        className={`relative w-[88px] h-[88px] rounded-full overflow-hidden border border-white/15 ${playing && !isEmpty ? "vinyl-spin" : ""}`}
                        style={{ background: "radial-gradient(circle at 30% 30%, #2a2a2a, #050505 70%)" }}
                    >
                        {t.cover && <img src={t.cover} alt="" className="w-full h-full object-cover opacity-90" />}
                        {/* Vinyl grooves */}
                        <div className="absolute inset-0 rounded-full"
                             style={{ background: "repeating-radial-gradient(circle at center, rgba(255,255,255,0.04) 0 2px, transparent 2px 5px)" }} />
                        {/* White needle/arrow line */}
                        <div className="absolute top-1/2 left-1/2 w-[78%] h-[1.5px] bg-white/85 origin-left"
                             style={{ transform: "translate(0, -50%) rotate(-30deg)", boxShadow: "0 0 4px rgba(255,255,255,0.5)" }}>
                            <div className="absolute right-[-4px] top-[-3px] w-0 h-0"
                                 style={{ borderLeft: "5px solid white", borderTop: "4px solid transparent", borderBottom: "4px solid transparent" }} />
                        </div>
                        {/* Spindle */}
                        <div className="absolute inset-[44%] rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                    </div>
                </div>

                {/* Middle: track info + progress + transport */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Title */}
                    <div className="text-white font-display font-bold text-[15px] leading-tight truncate">
                        {t.title}
                    </div>
                    {/* Source badge */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                        {t.source === "youtube" && (
                            <span className="inline-flex items-center justify-center w-[18px] h-[14px] rounded-[3px] bg-[#ff0033]">
                                <Play size={8} fill="white" className="text-white ml-[1px]" />
                            </span>
                        )}
                        <span className="font-mono-ui text-[11px] uppercase tracking-[0.12em] text-white/80 truncate">{t.artist}</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-3 flex items-center gap-2.5">
                        <span className="font-mono-ui text-[11px] text-white/70 tabular-nums w-[34px]">{fmt(pos)}</span>
                        <div className="flex-1 h-[6px] rounded-full bg-white/[0.12] overflow-hidden relative cursor-pointer"
                             onClick={(e) => {
                                 if (isEmpty) return;
                                 const r = e.currentTarget.getBoundingClientRect();
                                 const x = (e.clientX - r.left) / r.width;
                                 setPos(x * t.duration);
                             }}
                        >
                            <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: accent }} />
                        </div>
                        <span className="font-mono-ui text-[11px] text-white/70 tabular-nums w-[34px] text-right">{fmt(t.duration)}</span>
                    </div>

                    {/* Transport */}
                    <div className="mt-2.5 flex items-center justify-center gap-3">
                        <button data-testid={TID.musicPrev} onClick={prev} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80">
                            <SkipBack size={14} fill="currentColor" />
                        </button>
                        <button
                            data-testid={TID.musicPlay}
                            onClick={() => setPlaying((p) => !p)}
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ color: accent }}
                        >
                            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button data-testid={TID.musicNext} onClick={next} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80">
                            <SkipForward size={14} fill="currentColor" />
                        </button>
                    </div>
                </div>

                {/* Right: EQ visualizer bars */}
                <div className="shrink-0 self-center flex items-end gap-[3px] h-[80px] pr-1">
                    {Array.from({ length: 6 }).map((_, idx) => {
                        const base = [22, 38, 58, 72, 60, 44][idx];
                        const animH = playing && !isEmpty
                            ? base + Math.abs(Math.sin((Date.now() / 180) + idx)) * 18
                            : base * 0.45;
                        return (
                            <span
                                key={idx}
                                className="w-[5px] rounded-full transition-all duration-150"
                                style={{
                                    height: `${animH}%`,
                                    background: accent,
                                    opacity: playing && !isEmpty ? (0.7 + (idx % 3) * 0.1) : 0.35,
                                    boxShadow: playing && !isEmpty ? `0 0 6px ${accent}88` : "none",
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
