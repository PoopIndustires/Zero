import React, { useEffect, useState } from "react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";

function FlipDigit({ value, size = 96 }) {
    return (
        <div className="flip-card relative font-display"
            style={{ width: size, height: size * 1.3, display: "inline-block" }}>
            <div style={{ fontSize: size * 1.05, fontWeight: 900, lineHeight: 1, paddingTop: size * 0.05 }}>
                {String(value).padStart(2, "0")}
            </div>
            <div className="flip-divider" />
        </div>
    );
}

export function HeroClock() {
    const { state } = useZero();
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const hh = now.getHours();
    const mm = now.getMinutes();
    const ss = now.getSeconds();
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    return (
        <div className="flex flex-col items-center select-none zp-fade-up">
            {state.visibility.clock && (
                <div className="flex items-center gap-3 md:gap-4" data-testid={TID.heroClock}>
                    <FlipDigit value={hh} size={108} />
                    <span className="font-display text-white/40 text-6xl md:text-7xl font-black -mt-2">:</span>
                    <FlipDigit value={mm} size={108} />
                    <span className="font-display text-white/40 text-6xl md:text-7xl font-black -mt-2">:</span>
                    <FlipDigit value={ss} size={108} />
                </div>
            )}
            {state.visibility.date && (
                <div data-testid={TID.heroDate} className="mt-5 font-mono-ui text-[11px] uppercase tracking-[0.4em] text-white/55">
                    {dateStr}
                </div>
            )}
        </div>
    );
}
