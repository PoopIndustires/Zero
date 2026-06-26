import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Music2, Volume2 } from "lucide-react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";

// Zero-style music pill — bottom center, black rounded with vinyl + waveform + transport controls.
const TRACKS = [
    { title: "No Media Playing",  artist: "—",                  cover: null },
    { title: "Sumeru Lo-Fi Beats", artist: "jian lofi",          cover: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=160" },
    { title: "Velvet Static",      artist: "Neon Garden",        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160" },
    { title: "Soft Tokyo Rain",    artist: "Lo-Fi Kanji",        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160" },
];

export function MusicPill() {
    const { state } = useZero();
    const [i, setI] = useState(0);
    const [playing, setPlaying] = useState(false);
    const t = TRACKS[i];
    const isEmpty = i === 0;

    if (!state.visibility.music) return null;

    return (
        <div
            data-testid={TID.musicWidget}
            className="zp-glass rounded-[28px] px-3.5 py-2.5 flex items-center gap-3.5 zp-fade-up"
            style={{ background: "rgba(8,10,14,0.78)", backdropFilter: "blur(28px) saturate(1.6)", boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
            {/* Vinyl */}
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0 ${playing ? "vinyl-spin" : ""}`}
                 style={{ background: "radial-gradient(circle at 30% 30%, #2a2a2a, #050505 70%)" }}>
                {t.cover ? <img src={t.cover} alt="" className="w-full h-full object-cover opacity-90" /> : null}
                <div className="absolute inset-[35%] rounded-full" style={{ background: state.theme.accent, boxShadow: `0 0 8px ${state.theme.accent}` }} />
            </div>

            {/* Track info + waveform */}
            <div className="flex-1 min-w-[180px]">
                <div className="text-white text-sm font-bold font-display truncate">{t.title}</div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-[2px] flex-1">
                        {Array.from({ length: 28 }).map((_, idx) => {
                            const h = isEmpty ? 4 : 4 + Math.abs(Math.sin((idx + (playing ? Date.now() / 200 : 0)) * 0.5)) * 12;
                            return (
                                <span key={idx}
                                    className="w-[2px] rounded-full transition-all"
                                    style={{ height: `${h}px`, background: state.theme.accent, opacity: playing ? 0.7 + (idx % 3) * 0.1 : 0.2 }} />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Transport */}
            <div className="flex items-center gap-1 shrink-0">
                <button data-testid={TID.musicPrev} onClick={() => setI((i + TRACKS.length - 1) % TRACKS.length)}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/75">
                    <SkipBack size={14} fill="currentColor" />
                </button>
                <button data-testid={TID.musicPlay} onClick={() => setPlaying((v) => !v)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition"
                        style={{ background: state.theme.accent, color: "#0a0a0a", boxShadow: `0 0 16px ${state.theme.accent}55` }}>
                    {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
                </button>
                <button data-testid={TID.musicNext} onClick={() => setI((i + 1) % TRACKS.length)}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/75">
                    <SkipForward size={14} fill="currentColor" />
                </button>
            </div>
        </div>
    );
}
