import React from "react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";
import { Plus, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

function favicon(url) {
    try {
        const u = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
    } catch (e) { return ""; }
}

export function Bookmarks() {
    const { state, dispatch } = useZero();
    const onAdd = () => {
        const title = prompt("Bookmark name?");
        if (!title) return;
        const url = prompt("URL?  (https://...)");
        if (!url) return;
        const next = [...state.bookmarks, { id: `bm${Date.now()}`, title, url, color: "#fff" }];
        dispatch({ type: "SET", key: "bookmarks", value: next });
    };
    const onRemove = (id) => {
        dispatch({ type: "SET", key: "bookmarks", value: state.bookmarks.filter((b) => b.id !== id) });
    };
    return (
        <div data-testid={TID.bookmarks} className="zp-glass rounded-2xl p-4 zp-fade-up">
            <div className="flex items-center justify-between mb-3">
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Bookmarks</div>
                <button
                    data-testid={TID.bookmarkAdd}
                    onClick={onAdd}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06]"
                    title="Add bookmark"
                >
                    <Plus size={14} />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {state.bookmarks.map((b, i) => (
                    <motion.a
                        key={b.id}
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -2 }}
                        data-testid={TID.bookmarkCard(i)}
                        className="group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05] transition-all"
                    >
                        <button
                            onClick={(e) => { e.preventDefault(); onRemove(b.id); }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition w-5 h-5 rounded-md hover:bg-white/10 flex items-center justify-center"
                        >
                            <X size={11} className="text-white/70" />
                        </button>
                        <div className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center overflow-hidden">
                            <img src={favicon(b.url)} alt="" className="w-6 h-6" onError={(e) => (e.currentTarget.style.opacity = 0)} />
                        </div>
                        <div className="text-[10px] text-white/75 text-center truncate w-full font-mono-ui">{b.title}</div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
}
