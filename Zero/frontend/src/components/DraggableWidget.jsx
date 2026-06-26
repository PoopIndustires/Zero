// DraggableWidget — wraps any widget in a positioned, draggable container.
// Persists position via useZero -> state.widgetPositions[id] = {x, y}.
// Honors state.theme.lockWidgets — if locked, dragging is disabled.
import React, { useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { useZero } from "@/store/ZeroProvider";

export function DraggableWidget({ id, children, defaultX = 20, defaultY = 100, width, className = "", visible = true }) {
    const { state, dispatch } = useZero();
    const elRef = useRef(null);
    const pos = state.widgetPositions?.[id] || { x: defaultX, y: defaultY };
    const locked = state.theme.lockWidgets;

    const startDrag = (e) => {
        if (locked) return;
        // Don't drag if user is starting on an interactive control (or its child SVG/icon)
        if (e.target.closest && e.target.closest("button, input, textarea, select, a, [role=slider]")) return;
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const ox = pos.x, oy = pos.y;
        const onMove = (ev) => {
            const nx = Math.max(0, Math.min(window.innerWidth - 60,  ox + ev.clientX - startX));
            const ny = Math.max(0, Math.min(window.innerHeight - 40, oy + ev.clientY - startY));
            if (elRef.current) {
                // realtime: update DOM directly during drag; commit to state on up
                elRef.current.style.left = nx + "px";
                elRef.current.style.top = ny + "px";
            }
        };
        const onUp = (ev) => {
            const nx = Math.max(0, Math.min(window.innerWidth - 60,  ox + ev.clientX - startX));
            const ny = Math.max(0, Math.min(window.innerHeight - 40, oy + ev.clientY - startY));
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            dispatch({ type: "SET_PATH", path: ["widgetPositions", id], value: { x: nx, y: ny } });
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    if (!visible) return null;

    return (
        <div
            ref={elRef}
            data-widget-id={id}
            data-draggable="true"
            onPointerDown={startDrag}
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
                width: width || "auto",
                zIndex: 10,
                cursor: locked ? "default" : "grab",
                touchAction: locked ? "auto" : "none",
            }}
            className={`group ${className}`}
        >
            {/* Drag grip dots — visible only on hover and when unlocked */}
            {!locked && (
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <GripVertical size={12} className="text-white/40" />
                </div>
            )}
            {children}
        </div>
    );
}
