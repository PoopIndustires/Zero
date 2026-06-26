import React, { useEffect, useState } from "react";
import { RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";

const QUOTES = [
    { q: "One day or day one. You decide.", a: "Paulo Coelho (Popularized by The Rock)" },
    { q: "The cost of inaction is greater than the cost of mistakes.", a: "Anonymous" },
    { q: "You are what you do, not what you say you'll do.", a: "Carl Jung" },
    { q: "Make it work, make it right, make it fast.", a: "Kent Beck" },
    { q: "Move fast and don't break things — too often.", a: "Anonymous" },
    { q: "Doors close. Doors open. Walk through one.", a: "Murakami-ish" },
    { q: "Discipline equals freedom.", a: "Jocko Willink" },
    { q: "Boring code lasts. Clever code rots.", a: "An old engineer" },
    { q: "If it's worth doing, it's worth doing twice.", a: "Unknown" },
    { q: "Yesterday you said tomorrow.", a: "Nike (but also you)" },
];

export function QuoteWidget() {
    const { state } = useZero();
    const [i, setI] = useState(Math.floor(Math.random() * QUOTES.length));
    const [collapsed, setCollapsed] = useState(false);
    if (!state.visibility.quote) return null;
    const q = QUOTES[i];
    return (
        <div data-testid="quote-widget"
             className="zp-glass rounded-2xl px-4 py-3 max-w-xs zp-fade-up flex items-start gap-2">
            <div className="flex-1 min-w-0">
                {!collapsed && (
                    <div className="text-white/90 text-[13px] font-display italic leading-snug">
                        “{q.q}”
                    </div>
                )}
                <div className="text-[10px] text-white/45 font-mono-ui mt-1 truncate">
                    — {q.a}
                </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => setI((i + 1) % QUOTES.length)}
                        className="w-6 h-6 rounded-md hover:bg-white/10 text-white/55 flex items-center justify-center">
                    <RefreshCw size={11} />
                </button>
                <button onClick={() => setCollapsed((v) => !v)}
                        className="w-6 h-6 rounded-md hover:bg-white/10 text-white/55 flex items-center justify-center">
                    {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                </button>
            </div>
        </div>
    );
}
