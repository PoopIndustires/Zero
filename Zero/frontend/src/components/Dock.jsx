import React from "react";
import { TID } from "@/constants/testIds";
import { useZero } from "@/store/ZeroProvider";
import { APPS } from "@/store/appsCatalog";
import { motion } from "framer-motion";

export function Dock({ onOpen }) {
    const { state, dispatch } = useZero();
    const items = APPS.filter((a) => state.dock.includes(a.id));

    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.2 }}
            data-testid={TID.dock}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 zp-glass-hi rounded-2xl p-2 flex items-end gap-1.5"
        >
            {items.map((a) => {
                const w = state.windows[a.id];
                const active = w?.open && !w?.minimized;
                return (
                    <motion.button
                        key={a.id}
                        data-testid={TID.dockItem(a.id)}
                        whileHover={{ y: -6, scale: 1.08 }}
                        onClick={() => {
                            if (w?.open && !w?.minimized) {
                                dispatch({ type: "WINDOW_MIN", id: a.id });
                            } else {
                                onOpen(a.id);
                            }
                        }}
                        title={a.name}
                        className="relative w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition"
                        style={{
                            background: active ? "rgba(176,0,255,0.18)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${active ? "rgba(176,0,255,0.45)" : "rgba(255,255,255,0.08)"}`,
                        }}
                    >
                        <span>{a.icon}</span>
                        {w?.open && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/85" />}
                    </motion.button>
                );
            })}
        </motion.div>
    );
}
