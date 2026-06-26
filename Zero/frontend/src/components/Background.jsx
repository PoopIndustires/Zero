// Animated canvas backgrounds (matrix rain, network nodes, fireflies, snow, aurora gradient, starfield)
import React, { useEffect, useRef } from "react";
import { TID } from "@/constants/testIds";

function useCanvas(render) {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf;
        let w, h;
        function resize() {
            w = canvas.width = window.innerWidth * window.devicePixelRatio;
            h = canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
        }
        resize();
        window.addEventListener("resize", resize);
        const state = {};
        function loop(t) {
            render(ctx, w, h, state, t);
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [render]);
    return ref;
}

export function MatrixBg() {
    const draw = (ctx, w, h, s, t) => {
        if (!s.cols) {
            s.fontSize = 16 * window.devicePixelRatio;
            s.cols = Math.floor(w / s.fontSize);
            s.drops = Array(s.cols).fill(0).map(() => Math.random() * h);
        }
        ctx.fillStyle = "rgba(5,5,5,0.08)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${s.fontSize}px JetBrains Mono`;
        ctx.fillStyle = "rgba(0,255,102,0.6)";
        const chars = "01アイウエオカキクケコサシスセソタチツテト";
        for (let i = 0; i < s.cols; i++) {
            const ch = chars[(Math.floor(Math.random() * chars.length))];
            ctx.fillText(ch, i * s.fontSize, s.drops[i]);
            if (s.drops[i] > h && Math.random() > 0.975) s.drops[i] = 0;
            s.drops[i] += s.fontSize * 0.9;
        }
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

export function NetworkBg() {
    const draw = (ctx, w, h, s, t) => {
        if (!s.pts) {
            s.pts = Array(80).fill(0).map(() => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4 * window.devicePixelRatio,
                vy: (Math.random() - 0.5) * 0.4 * window.devicePixelRatio,
            }));
        }
        ctx.fillStyle = "rgba(5,5,5,1)";
        ctx.fillRect(0, 0, w, h);
        s.pts.forEach((p) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        });
        for (let i = 0; i < s.pts.length; i++) {
            const a = s.pts[i];
            for (let j = i + 1; j < s.pts.length; j++) {
                const b = s.pts[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                const maxD = 140 * 140 * window.devicePixelRatio * window.devicePixelRatio;
                if (d2 < maxD) {
                    const op = 1 - d2 / maxD;
                    ctx.strokeStyle = `rgba(0,229,255,${op * 0.25})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
        }
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        s.pts.forEach((p) => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 * window.devicePixelRatio, 0, Math.PI * 2); ctx.fill();
        });
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

export function FirefliesBg() {
    const draw = (ctx, w, h, s, t) => {
        if (!s.flies) {
            s.flies = Array(70).fill(0).map(() => ({
                x: Math.random() * w, y: Math.random() * h,
                r: (1 + Math.random() * 2) * window.devicePixelRatio,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.3 * window.devicePixelRatio,
                vy: (Math.random() - 0.5) * 0.3 * window.devicePixelRatio,
            }));
        }
        ctx.fillStyle = "rgba(5,5,5,0.25)";
        ctx.fillRect(0, 0, w, h);
        s.flies.forEach((f) => {
            f.x += f.vx; f.y += f.vy;
            if (f.x < 0 || f.x > w) f.vx *= -1;
            if (f.y < 0 || f.y > h) f.vy *= -1;
            const op = (Math.sin(t / 600 + f.phase) + 1) / 2;
            const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 8);
            grad.addColorStop(0, `rgba(255,210,120,${0.6 * op})`);
            grad.addColorStop(1, "rgba(255,210,120,0)");
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 8, 0, Math.PI * 2); ctx.fill();
        });
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

export function SnowBg() {
    const draw = (ctx, w, h, s, t) => {
        if (!s.flakes) {
            s.flakes = Array(200).fill(0).map(() => ({
                x: Math.random() * w, y: Math.random() * h,
                r: (0.5 + Math.random() * 2) * window.devicePixelRatio,
                vy: (0.3 + Math.random() * 0.8) * window.devicePixelRatio,
                vx: (Math.random() - 0.5) * 0.2 * window.devicePixelRatio,
            }));
        }
        ctx.fillStyle = "rgba(5,5,5,1)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        s.flakes.forEach((f) => {
            f.y += f.vy; f.x += f.vx;
            if (f.y > h) { f.y = -5; f.x = Math.random() * w; }
            if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        });
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

export function StarfieldBg() {
    const draw = (ctx, w, h, s, t) => {
        if (!s.stars) {
            s.stars = Array(400).fill(0).map(() => ({
                x: (Math.random() - 0.5) * w,
                y: (Math.random() - 0.5) * h,
                z: Math.random() * w,
            }));
        }
        ctx.fillStyle = "rgba(5,5,5,0.4)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "white";
        const cx = w / 2, cy = h / 2;
        s.stars.forEach((st) => {
            st.z -= 2 * window.devicePixelRatio;
            if (st.z < 1) {
                st.z = w; st.x = (Math.random() - 0.5) * w; st.y = (Math.random() - 0.5) * h;
            }
            const k = 128 / st.z;
            const px = st.x * k + cx;
            const py = st.y * k + cy;
            if (px < 0 || px > w || py < 0 || py > h) return;
            const size = (1 - st.z / w) * 3 * window.devicePixelRatio;
            ctx.globalAlpha = 1 - st.z / w;
            ctx.fillRect(px, py, size, size);
        });
        ctx.globalAlpha = 1;
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

// Meteor: gentle starfield + occasional shooting stars (Zero's signature "meteor" effect)
// When used standalone, paints a dark base each frame; when layered on top of a gradient,
// we use clearRect + lighter blend so the gradient shines through.
export function MeteorBg({ transparent = false }) {
    const draw = (ctx, w, h, s, t) => {
        if (!s.stars) {
            s.stars = Array(220).fill(0).map(() => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: (Math.random() * 1.2 + 0.2) * window.devicePixelRatio,
                tw: Math.random() * Math.PI * 2,
            }));
            s.meteors = [];
            s.nextMeteorAt = t + 800;
        }
        if (transparent) {
            ctx.clearRect(0, 0, w, h);
        } else {
            ctx.fillStyle = "rgba(5,8,16,0.35)";
            ctx.fillRect(0, 0, w, h);
        }
        s.stars.forEach((st) => {
            const a = 0.4 + (Math.sin(t / 600 + st.tw) + 1) / 4;
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
            ctx.fill();
        });
        if (t >= s.nextMeteorAt) {
            const ang = (45 * Math.PI) / 180;
            s.meteors.push({
                x: Math.random() * w * 0.6 + w * 0.2,
                y: -10,
                vx: Math.cos(ang) * 14 * window.devicePixelRatio,
                vy: Math.sin(ang) * 14 * window.devicePixelRatio,
                life: 0, maxLife: 120,
            });
            s.nextMeteorAt = t + 2200 + Math.random() * 3500;
        }
        s.meteors = s.meteors.filter((m) => {
            m.x += m.vx;
            m.y += m.vy;
            m.life += 1;
            const len = Math.hypot(m.vx, m.vy);
            const tailLen = 140 * window.devicePixelRatio;
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * (tailLen / len), m.y - m.vy * (tailLen / len));
            grad.addColorStop(0, "rgba(255,255,255,0.95)");
            grad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4 * window.devicePixelRatio;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * (tailLen / len), m.y - m.vy * (tailLen / len));
            ctx.stroke();
            return m.life < m.maxLife && m.x < w + 200 && m.y < h + 200;
        });
    };
    const ref = useCanvas(draw);
    return <canvas ref={ref} data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0 }} />;
}

// Cosmic Teal — the Zero default: brighter conic gradient matching the reference image.
export function CosmicTealBg() {
    return (
        <div data-testid={TID.backgroundCanvas} style={{
            position: "absolute", inset: 0,
            background: `
                radial-gradient(ellipse 80% 70% at 50% 55%, rgba(0,180,180,0.22) 0%, rgba(0,180,180,0) 60%),
                conic-gradient(from 156deg at 55% 60%,
                    #1a6a78 0%,
                    #145a72 14%,
                    #0c466e 28%,
                    #0e3f6a 42%,
                    #0a2e54 56%,
                    #082842 70%,
                    #155f7a 86%,
                    #1a6a78 100%
                )
            `,
        }}>
            {/* Soft teal glow blob (center light) */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle 700px at 55% 70%, rgba(0,245,212,0.22), transparent 60%)",
                pointerEvents: "none",
            }} />
            <MeteorBg transparent />
        </div>
    );
}

export function AuroraBg() {
    return (
        <div data-testid={TID.backgroundCanvas} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#050505" }}>
            <div style={{
                position: "absolute", inset: "-20%",
                background: "radial-gradient(60% 50% at 30% 30%, rgba(0,229,255,0.25), transparent 60%), radial-gradient(50% 50% at 70% 60%, rgba(176,0,255,0.22), transparent 60%), radial-gradient(40% 40% at 50% 80%, rgba(255,51,102,0.18), transparent 60%)",
                filter: "blur(40px)",
                animation: "auroraShift 20s ease-in-out infinite alternate",
            }} />
            <style>{`@keyframes auroraShift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-4%, 3%) scale(1.05); } }`}</style>
        </div>
    );
}

export function BackgroundLayer({ preset }) {
    let Bg = AuroraBg;
    if (preset === "matrix") Bg = MatrixBg;
    else if (preset === "network") Bg = NetworkBg;
    else if (preset === "fireflies") Bg = FirefliesBg;
    else if (preset === "snow") Bg = SnowBg;
    else if (preset === "stars") Bg = StarfieldBg;
    else if (preset === "meteor") Bg = MeteorBg;
    else if (preset === "cosmic-teal") Bg = CosmicTealBg;
    return (
        <div data-testid={TID.backgroundLayer} style={{ position: "fixed", inset: 0, zIndex: 0 }}>
            <Bg />
            <div className="zp-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.25) 95%)",
                pointerEvents: "none",
            }} />
        </div>
    );
}

export const BG_PRESETS = [
    { id: "cosmic-teal", label: "Cosmic Teal" },
    { id: "meteor", label: "Meteor" },
    { id: "aurora", label: "Aurora" },
    { id: "network", label: "Network" },
    { id: "matrix", label: "Matrix" },
    { id: "fireflies", label: "Fireflies" },
    { id: "snow", label: "Snow" },
    { id: "stars", label: "Starfield" },
];
