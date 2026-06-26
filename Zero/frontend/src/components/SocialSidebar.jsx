import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pin, ExternalLink, Youtube, MessagesSquare, Twitch, Cloud, Music, AtSign, Hash } from "lucide-react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";

// Definitions: 'iframe' types load directly. 'popup' types open a window.
const NETWORKS = {
    youtube:   { label: "YouTube",   icon: Youtube,        type: "iframe", color: "#ff0033", build: (q) => `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}` },
    reddit:    { label: "Reddit",    icon: MessagesSquare, type: "iframe", color: "#ff4500", build: () => `https://old.reddit.com/.compact` },
    twitch:    { label: "Twitch",    icon: Twitch,         type: "iframe", color: "#9146ff", build: () => `https://player.twitch.tv/?channel=lirik&parent=${window.location.hostname}&muted=true` },
    bluesky:   { label: "Bluesky",   icon: Cloud,          type: "iframe", color: "#00a8e8", build: () => `https://bsky.app/profile/bsky.app` },
    mastodon:  { label: "Mastodon",  icon: AtSign,         type: "iframe", color: "#6364ff", build: () => `https://mastodon.social/explore` },
    tiktok:    { label: "TikTok",    icon: Music,          type: "popup",  color: "#00f2ea", build: () => `https://www.tiktok.com/foryou` },
    instagram: { label: "Instagram", icon: Hash,           type: "popup",  color: "#e1306c", build: () => `https://www.instagram.com/` },
    x:         { label: "X",         icon: Hash,           type: "popup",  color: "#ffffff", build: () => `https://x.com/explore` },
    threads:   { label: "Threads",   icon: Hash,           type: "popup",  color: "#aaaaaa", build: () => `https://www.threads.net/` },
};

export function SocialSidebar() {
    const { state, dispatch } = useZero();
    const open = state.social.open;
    const enabled = state.social.enabled.filter((id) => NETWORKS[id]);
    const active = enabled.includes(state.social.activeTab) ? state.social.activeTab : enabled[0];
    const net = NETWORKS[active];

    const setOpen = (v) => dispatch({ type: "SET_PATH", path: ["social", "open"], value: v });
    const setTab = (id) => {
        const n = NETWORKS[id];
        if (n.type === "popup") {
            window.open(n.build(), "_blank", "width=520,height=900");
            return;
        }
        dispatch({ type: "SET_PATH", path: ["social", "activeTab"], value: id });
    };
    const togglePin = () => dispatch({ type: "SET_PATH", path: ["social", "pinned"], value: !state.social.pinned });

    return (
        <AnimatePresence>
            {open && (
                <>
                    {!state.social.pinned && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                    )}
                    <motion.aside
                        data-testid={TID.socialSidebar}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 280, damping: 32 }}
                        className="fixed top-0 right-0 bottom-0 w-[380px] z-50 zp-glass-hi border-l border-white/10 flex flex-col"
                    >
                        <div className="px-3 py-3 flex items-center justify-between border-b border-white/[0.07]">
                            <div className="flex items-center gap-1 overflow-x-auto zp-scroll">
                                {enabled.map((id) => {
                                    const n = NETWORKS[id];
                                    const Icon = n.icon;
                                    const isActive = id === active;
                                    return (
                                        <button
                                            key={id}
                                            data-testid={TID.socialTab(id)}
                                            onClick={() => setTab(id)}
                                            title={n.label}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono-ui transition ${
                                                isActive ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                            style={isActive ? { boxShadow: `inset 0 0 0 1px ${n.color}55` } : {}}
                                        >
                                            <Icon size={12} style={{ color: isActive ? n.color : undefined }} />
                                            {n.label}
                                            {n.type === "popup" && <ExternalLink size={9} className="text-white/40" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                                <button onClick={togglePin} title="Pin" className={`w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center ${state.social.pinned ? "text-white" : "text-white/55"}`}>
                                    <Pin size={13} fill={state.social.pinned ? "currentColor" : "none"} />
                                </button>
                                <button data-testid={TID.socialClose} onClick={() => setOpen(false)} className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-black/60 relative">
                            {net && net.type === "iframe" && (
                                <iframe
                                    key={active}
                                    src={net.build(state.social.youtubeQuery)}
                                    title={net.label}
                                    className="w-full h-full"
                                    style={{ border: 0 }}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                                />
                            )}
                        </div>
                        <div className="px-3 py-2 border-t border-white/[0.07] text-[10px] text-white/40 font-mono-ui">
                            Some networks block iframes — tap them to open in a focused popup window.
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

export { NETWORKS };
