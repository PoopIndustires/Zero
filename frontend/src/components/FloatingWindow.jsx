import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { TID } from "@/constants/testIds";

export function FloatingWindow({ id, title, color = "#b000ff", state, onClose, onFocus, onMin, onMove, onResize, children }) {
    const ref = useRef(null);
    if (!state?.open) return null;
    if (state.minimized) return null;

    return (
        <motion.div
            ref={ref}
            data-testid={TID.appWindow(id)}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            drag
            dragMomentum={false}
            dragListener={false}
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
            <div
                className="h-9 px-3 flex items-center justify-between border-b border-white/[0.06] select-none cursor-move"
                onPointerDown={(e) => {
                    onFocus?.();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const ox = state.x;
                    const oy = state.y;
                    const onMoveEvt = (ev) => {
                        onMove?.(ox + ev.clientX - startX, oy + ev.clientY - startY);
                    };
                    const onUp = () => {
                        window.removeEventListener("pointermove", onMoveEvt);
                        window.removeEventListener("pointerup", onUp);
                    };
                    window.addEventListener("pointermove", onMoveEvt);
                    window.addEventListener("pointerup", onUp);
                }}
            >
                <div className="flex items-center gap-1.5">
                    <button
                        data-testid={TID.appWindowClose(id)}
                        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:scale-110 transition"
                        title="Close"
                    />
                    <button
                        data-testid={TID.appWindowMin(id)}
                        onClick={(e) => { e.stopPropagation(); onMin?.(); }}
                        className="w-3 h-3 rounded-full bg-[#febc2e] hover:scale-110 transition"
                        title="Minimize"
                    />
                    <button
                        data-testid={TID.appWindowMax(id)}
                        onClick={(e) => { e.stopPropagation(); }}
                        className="w-3 h-3 rounded-full bg-[#28c840] hover:scale-110 transition"
                    />
                </div>
                <div className="font-display text-[12px] uppercase tracking-[0.2em] text-white/55">{title}</div>
                <div className="w-12" />
            </div>
            <div className="flex-1 overflow-auto zp-scroll relative">{children}</div>
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
                className="absolute bottom-1 right-1 w-3 h-3 cursor-se-resize"
                style={{ background: "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)" }}
            />
        </motion.div>
    );
}
