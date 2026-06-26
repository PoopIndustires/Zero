import React, { useEffect, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";
import { getClockFont } from "@/constants/clockFonts";

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
    const font = getClockFont(state.theme.clockFont || "anurati");

    return (
        <div data-testid={TID.heroClock} className="flex flex-col items-center select-none zp-fade-up">
            {state.visibility.clock && (
                <div
                    className="leading-none"
                    style={{
                        fontFamily: font.family,
                        fontWeight: font.weight,
                        letterSpacing: font.letterSpacing,
                        fontSize: "clamp(3.5rem, 9vw, 9rem)",
                        color: "var(--zp-accent-current)",
                        textShadow: `0 0 60px color-mix(in srgb, var(--zp-accent-current) 38%, transparent), 0 0 16px color-mix(in srgb, var(--zp-accent-current) 28%, transparent)`,
                        filter: "drop-shadow(0 0 20px color-mix(in srgb, var(--zp-accent-current) 18%, transparent))",
                        lineHeight: 0.95,
                        textTransform: "uppercase",
                    }}
                >
                    {day}
                </div>
            )}
            {state.visibility.date && (
                <div
                    data-testid={TID.heroDate}
                    className="font-outfit font-semibold text-xl md:text-2xl text-white/90 mt-5 tracking-wide"
                >
                    {dateStr}
                </div>
            )}
            {state.visibility.clock && (
                <div className="font-outfit text-base tracking-[0.22em] text-white/70 mt-2">
                    - {hh}:{mm}:{ss} -
                </div>
            )}
        </div>
    );
}
