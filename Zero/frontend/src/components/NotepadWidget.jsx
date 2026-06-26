import React, { useState } from "react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";
import { Plus, X, Pin } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#FFC44D", "#FF6B9D", "#7BD389", "#7BC8F6", "#C58AFF", "#FF8C66", "#F4F4F4", "#A0A0A0"];

export function NotepadWidget() {
    const { state, dispatch } = useZero();
    const [text, setText] = useState("");
    const add = () => {
        if (!text.trim()) return;
        const newNote = { id: `n${Date.now()}`, title: text.trim().split("\n")[0].slice(0, 40), body: text.trim(), color: COLORS[Math.floor(Math.random() * COLORS.length)], pinned: false };
        dispatch({ type: "SET", key: "notes", value: [newNote, ...state.notes] });
        setText("");
    };
    const del = (id) => dispatch({ type: "SET", key: "notes", value: state.notes.filter((n) => n.id !== id) });
    const togglePin = (id) => dispatch({ type: "SET", key: "notes", value: state.notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n) });

    const sorted = [...state.notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return (
        <div data-testid={TID.notepadWidget} className="zp-glass rounded-2xl p-4 zp-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Notepad</div>
                <div className="font-mono-ui text-[10px] text-white/40">{state.notes.length} notes</div>
            </div>
            <div className="flex gap-2 mb-3">
                <textarea
                    data-testid={TID.notepadInput}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Quick note…  (⏎+Shift for new line)"
                    rows={2}
                    className="flex-1 resize-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 font-mono-ui outline-none focus:border-white/25"
                />
                <button
                    data-testid={TID.notepadAdd}
                    onClick={add}
                    className="w-9 h-9 self-stretch flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] hover:border-white/25 text-white/80"
                >
                    <Plus size={14} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto zp-scroll pr-1">
                {sorted.map((n, i) => (
                    <motion.div
                        key={n.id}
                        whileHover={{ y: -2 }}
                        data-testid={TID.noteCard(i)}
                        className="group relative rounded-xl p-2.5 text-[12px] font-mono-ui leading-relaxed border border-white/[0.08]"
                        style={{ background: `${n.color}1a`, color: n.color }}
                    >
                        <div className="font-bold mb-1 truncate" style={{ color: n.color }}>{n.title || "Untitled"}</div>
                        <div className="text-white/65 line-clamp-3 whitespace-pre-wrap">{n.body}</div>
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => togglePin(n.id)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center">
                                <Pin size={11} className={n.pinned ? "text-white" : "text-white/55"} fill={n.pinned ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => del(n.id)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center">
                                <X size={11} className="text-white/55" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
