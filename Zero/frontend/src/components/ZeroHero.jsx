import React, { useEffect, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ZeroHero() {
    const { state } = useZero();
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    if (!state.visibility.clock && !state.visibility.date) return null;

    const day = DAYS[now.getDay()];
    const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return (
        <div data-testid={TID.heroClock} className="flex flex-col items-center select-none zp-fade-up">
            {state.visibility.clock && (
                <div
                    className="font-hero-day hero-day-cut text-[10vw] md:text-[8.5rem] lg:text-[10rem] leading-none"
                    style={{ filter: "drop-shadow(0 0 40px color-mix(in srgb, var(--zp-accent-current) 18%, transparent))" }}
                >
                    {day}
                </div>
            )}
            {state.visibility.date && (
                <div
                    data-testid={TID.heroDate}
                    className="font-display italic font-bold text-2xl md:text-3xl text-white/85 mt-4"
                >
                    {dateStr}
                </div>
            )}
            {state.visibility.clock && (
                <div className="font-mono-ui text-sm tracking-[0.3em] text-white/55 mt-3">
                    - {hh}:{mm}:{ss} -
                </div>
            )}
        </div>
    );
}
