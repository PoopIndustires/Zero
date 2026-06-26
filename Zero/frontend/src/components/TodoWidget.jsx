import React, { useState } from "react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";
import { Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TodoWidget() {
    const { state, dispatch } = useZero();
    const [text, setText] = useState("");
    const add = () => {
        if (!text.trim()) return;
        dispatch({ type: "SET", key: "todos", value: [...state.todos, { id: `t${Date.now()}`, text: text.trim(), done: false }] });
        setText("");
    };
    const toggle = (id) => {
        dispatch({ type: "SET", key: "todos", value: state.todos.map((t) => t.id === id ? { ...t, done: !t.done } : t) });
    };
    const del = (id) => {
        dispatch({ type: "SET", key: "todos", value: state.todos.filter((t) => t.id !== id) });
    };
    const done = state.todos.filter((t) => t.done).length;
    return (
        <div data-testid={TID.todoWidget} className="zp-glass rounded-2xl p-4 zp-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Todo</div>
                <div className="font-mono-ui text-[10px] text-white/40">{done}/{state.todos.length}</div>
            </div>
            <div className="flex gap-2 mb-3">
                <input
                    data-testid={TID.todoInput}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                    placeholder="Add a task…"
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 font-mono-ui outline-none focus:border-white/25"
                />
                <button
                    data-testid={TID.todoAdd}
                    onClick={add}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] hover:border-white/25 text-white/80"
                >
                    <Plus size={14} />
                </button>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto zp-scroll pr-1">
                <AnimatePresence>
                    {state.todos.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            data-testid={TID.todoItem(i)}
                            className="group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.03]"
                        >
                            <button
                                data-testid={TID.todoToggle(i)}
                                onClick={() => toggle(t.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${t.done ? "bg-white/90 border-white/90" : "border-white/30 hover:border-white/70"}`}
                            >
                                {t.done && <Check size={10} className="text-black" />}
                            </button>
                            <div className={`flex-1 text-sm font-mono-ui ${t.done ? "text-white/35 line-through" : "text-white/85"}`}>
                                {t.text}
                            </div>
                            <button
                                data-testid={TID.todoDelete(i)}
                                onClick={() => del(t.id)}
                                className="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
                            >
                                <X size={11} className="text-white/55" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
