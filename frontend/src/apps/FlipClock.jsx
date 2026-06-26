import React, { useEffect, useState } from "react";
import { TID } from "@/constants/testIds";

function Card({ value, size = 140 }) {
    return (
        <div className="flip-card relative" style={{ width: size, height: size * 1.3 }}>
            <div className="absolute inset-0 flex items-center justify-center font-display font-black" style={{ fontSize: size * 0.95, color: "#fff" }}>
                {String(value).padStart(2, "0")}
            </div>
            <div className="flip-divider" />
        </div>
    );
}

export function FlipClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 500);
        return () => clearInterval(id);
    }, []);
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    return (
        <div data-testid={TID.appFlipClock} className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/30">
            <div className="flex items-center gap-3">
                <Card value={h} />
                <div className="font-display text-white/30 text-7xl font-black -mt-1">:</div>
                <Card value={m} />
                <div className="font-display text-white/30 text-7xl font-black -mt-1">:</div>
                <Card value={s} size={100} />
            </div>
            <div className="mt-6 font-mono-ui text-xs uppercase tracking-[0.4em] text-white/45">
                {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
        </div>
    );
}
