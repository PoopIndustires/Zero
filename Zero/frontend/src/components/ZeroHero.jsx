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
                    className="font-hero-day text-[12vw] md:text-[8rem] lg:text-[9.5rem] leading-none"
                    style={{
                        color: "var(--zp-accent-current)",
                        textShadow: `0 0 60px color-mix(in srgb, var(--zp-accent-current) 35%, transparent), 0 0 12px color-mix(in srgb, var(--zp-accent-current) 25%, transparent)`,
                        filter: "drop-shadow(0 0 16px color-mix(in srgb, var(--zp-accent-current) 12%, transparent))",
                    }}
                >
                    {day}
                </div>
            )}
            {state.visibility.date && (
                <div
                    data-testid={TID.heroDate}
                    className="font-outfit font-semibold text-xl md:text-2xl text-white/85 mt-4 tracking-wide"
                >
                    {dateStr}
                </div>
            )}
            {state.visibility.clock && (
                <div className="font-outfit text-base tracking-[0.2em] text-white/65 mt-2">
                    - {hh}:{mm}:{ss} -
                </div>
            )}
        </div>
    );
}
