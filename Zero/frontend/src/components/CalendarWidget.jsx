import React, { useState } from "react";
import { TID } from "@/constants/testIds";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarWidget() {
    const [cursor, setCursor] = useState(new Date());
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const today = new Date();

    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (d) =>
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div data-testid={TID.calendarWidget} className="zp-glass rounded-2xl p-4 zp-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="font-display text-white font-bold text-sm">
                    {MONTHS[month]} <span className="text-white/40">{year}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button data-testid={TID.calendarPrev} onClick={() => setCursor(new Date(year, month - 1, 1))} className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                        <ChevronLeft size={14} />
                    </button>
                    <button data-testid={TID.calendarNext} onClick={() => setCursor(new Date(year, month + 1, 1))} className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d, i) => (
                    <div key={i} className="text-center text-[9px] uppercase tracking-[0.2em] text-white/35 font-mono-ui">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center text-[11px] font-mono-ui rounded-md ${
                        d == null ? "" : isToday(d) ? "bg-white text-black font-bold" : "text-white/65 hover:bg-white/5"
                    }`}>
                        {d ?? ""}
                    </div>
                ))}
            </div>
        </div>
    );
}
