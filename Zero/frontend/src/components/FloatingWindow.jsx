import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Minus, GripHorizontal } from "lucide-react";
import { TID } from "@/constants/testIds";

export function FloatingWindow({ id, title, icon, accent = "#00e5ff", state, onClose, onFocus, onMin, onMove, onResize, children }) {
    const ref = useRef(null);
    if (!state?.open) return null;
    if (state.minimized) return null;

    return (
        <motion.div
            ref={ref}
            data-testid={TID.appWindow(id)}
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onPointerDown={onFocus}
            style={{
                position: "fixed",
                left: state.x,
                top: state.y,
                width: state.w,
                height: state.h,
                zIndex: state.z,
            }}
            className="zp-glass-hi rounded-2xl flex flex-col overflow-hidden"
        >
            {/* Zero-style header: no Mac traffic lights. Just a grip + icon + title, then minimise & close on the right. */}
            <div
                className="h-10 px-3 flex items-center justify-between border-b border-white/[0.07] select-none cursor-move"
                onPointerDown={(e) => {
                    onFocus?.();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const ox = state.x;
                    const oy = state.y;
                    const onMoveEvt = (ev) => onMove?.(ox + ev.clientX - startX, oy + ev.clientY - startY);
                    const onUp = () => {
                        window.removeEventListener("pointermove", onMoveEvt);
                        window.removeEventListener("pointerup", onUp);
                    };
                    window.addEventListener("pointermove", onMoveEvt);
                    window.addEventListener("pointerup", onUp);
                }}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <GripHorizontal size={13} className="text-white/30 shrink-0" />
                    {icon && <span className="text-[15px] leading-none">{icon}</span>}
                    <div className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/55 truncate">{title}</div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        data-testid={TID.appWindowMin(id)}
                        onClick={(e) => { e.stopPropagation(); onMin?.(); }}
                        className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/55 hover:text-white"
                        title="Minimize"
                    >
                        <Minus size={13} />
                    </button>
                    <button
                        data-testid={TID.appWindowClose(id)}
                        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                        className="w-7 h-7 rounded-md hover:bg-rose-500/80 flex items-center justify-center text-white/65 hover:text-white"
                        title="Close"
                    >
                        <X size={13} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto zp-scroll relative">{children}</div>
            {/* Accent line under header to match the app */}
            <div className="absolute top-[40px] left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />
            {/* Resize handle */}
            <div
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onFocus?.();
                    const startX = e.clientX, startY = e.clientY;
                    const sw = state.w, sh = state.h;
                    const onMoveEvt = (ev) => onResize?.(Math.max(320, sw + ev.clientX - startX), Math.max(240, sh + ev.clientY - startY));
                    const onUp = () => { window.removeEventListener("pointermove", onMoveEvt); window.removeEventListener("pointerup", onUp); };
                    window.addEventListener("pointermove", onMoveEvt);
                    window.addEventListener("pointerup", onUp);
                }}
                className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize opacity-50 hover:opacity-100"
                style={{ background: "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.4) 50%)" }}
            />
        </motion.div>
    );
}
