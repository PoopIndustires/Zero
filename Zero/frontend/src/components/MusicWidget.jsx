import React, { useState } from "react";
import { TID } from "@/constants/testIds";
import { Play, Pause, SkipBack, SkipForward, Music2 } from "lucide-react";

// Demo music widget — local lofi-vibe pseudo-state. Real Chrome media-session API
// isn't accessible from a plain web page, so this is a visual stub.
const TRACKS = [
    { title: "Velvet Static",  artist: "Neon Garden",  cover: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=120" },
    { title: "Soft Tokyo Rain", artist: "Lo-Fi Kanji",  cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120" },
    { title: "Midnight Modem",  artist: "ChromeDrift",  cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120" },
];

export function MusicWidget() {
    const [i, setI] = useState(0);
    const [playing, setPlaying] = useState(false);
    const t = TRACKS[i];
    return (
        <div data-testid={TID.musicWidget} className="zp-glass rounded-2xl p-3 zp-fade-up flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border border-white/15 ${playing ? "vinyl-spin" : ""}`}>
                <img src={t.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-[35%] rounded-full bg-black border border-white/20" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-display text-white text-sm font-bold truncate">{t.title}</div>
                <div className="font-mono-ui text-[11px] text-white/45 truncate flex items-center gap-1.5">
                    <Music2 size={10} /> {t.artist}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button data-testid={TID.musicPrev} onClick={() => setI((i + TRACKS.length - 1) % TRACKS.length)} className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                    <SkipBack size={14} />
                </button>
                <button data-testid={TID.musicPlay} onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-md bg-white/10 border border-white/15 hover:bg-white/20 flex items-center justify-center text-white">
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button data-testid={TID.musicNext} onClick={() => setI((i + 1) % TRACKS.length)} className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                    <SkipForward size={14} />
                </button>
            </div>
        </div>
    );
}
