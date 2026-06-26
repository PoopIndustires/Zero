import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown, Home, Folder } from "lucide-react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";

function favicon(url) {
    try {
        const u = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
    } catch (e) { return ""; }
}

// Zero-style: centered horizontal row of favicons under the search, with group tabs at the bottom.
export function BookmarkRow() {
    const { state, dispatch } = useZero();
    const groups = state.bookmarkGroups || ["Main"];
    const activeGroup = state.activeBookmarkGroup || "Main";

    const visible = state.bookmarks.filter((b) => (b.group || "Main") === activeGroup);

    const addBookmark = () => {
        const title = prompt("Bookmark name?");
        if (!title) return;
        let url = prompt("URL? (https://...)");
        if (!url) return;
        if (!/^https?:\/\//.test(url)) url = "https://" + url;
        const next = [...state.bookmarks, { id: `bm${Date.now()}`, title, url, color: "#fff", group: activeGroup }];
        dispatch({ type: "SET", key: "bookmarks", value: next });
    };

    const removeBookmark = (id) => {
        dispatch({ type: "SET", key: "bookmarks", value: state.bookmarks.filter((b) => b.id !== id) });
    };

    const addGroup = () => {
        const name = prompt("New group name?");
        if (!name) return;
        dispatch({ type: "SET", key: "bookmarkGroups", value: [...groups, name] });
        dispatch({ type: "SET", key: "activeBookmarkGroup", value: name });
    };

    if (!state.visibility.bookmarks) return null;

    return (
        <div data-testid={TID.bookmarks} className="flex flex-col items-center gap-3 zp-fade-up">
            {/* Bookmark icon row */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
                {visible.map((b, i) => (
                    <motion.a
                        key={b.id}
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -3, scale: 1.06 }}
                        data-testid={TID.bookmarkCard(i)}
                        className="group relative w-12 h-12 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/[0.1] hover:border-white/30 flex items-center justify-center transition-all"
                        title={b.title}
                    >
                        <img src={favicon(b.url)} alt="" className="w-7 h-7 rounded-md" onError={(e) => (e.currentTarget.style.opacity = 0)} />
                        <button
                            onClick={(e) => { e.preventDefault(); removeBookmark(b.id); }}
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-rose-500 border border-black flex items-center justify-center"
                        >
                            <X size={9} className="text-white" />
                        </button>
                    </motion.a>
                ))}
                <button
                    data-testid={TID.bookmarkAdd}
                    onClick={addBookmark}
                    className="w-12 h-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/15 flex items-center justify-center text-white/55 hover:text-white"
                >
                    <Plus size={16} />
                </button>
            </div>
            {/* Group tabs */}
            <div className="flex items-center gap-1.5">
                {groups.map((g) => {
                    const active = g === activeGroup;
                    return (
                        <button
                            key={g}
                            data-testid={`bookmark-group-${g}`}
                            onClick={() => dispatch({ type: "SET", key: "activeBookmarkGroup", value: g })}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono-ui flex items-center gap-1.5 transition ${
                                active ? "bg-white/15 text-white border border-white/25" : "text-white/55 hover:text-white border border-transparent"
                            }`}
                        >
                            {g === "Main" ? <Home size={11} /> : <Folder size={11} />}
                            {g}
                        </button>
                    );
                })}
                <button
                    data-testid="bookmark-group-add"
                    onClick={addGroup}
                    className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/55 hover:text-white flex items-center justify-center"
                >
                    <Plus size={12} />
                </button>
            </div>
        </div>
    );
}
