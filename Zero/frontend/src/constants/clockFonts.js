// Clock font options — picker for the day-name typeface.
// Each option declares its CSS font-family AND a CSS letter-spacing override
// because some display fonts look better tight, others wide.
export const CLOCK_FONTS = [
    { id: "anurati",   label: "Anurati",       family: "'Anurati', 'Anta', sans-serif",         weight: 400,  letterSpacing: "0.12em" },
    { id: "anta",      label: "Anta",          family: "'Anta', sans-serif",                    weight: 400,  letterSpacing: "0.04em" },
    { id: "audiowide", label: "Audiowide",     family: "'Audiowide', sans-serif",               weight: 400,  letterSpacing: "0.02em" },
    { id: "orbitron",  label: "Orbitron",      family: "'Orbitron', sans-serif",                weight: 900,  letterSpacing: "0.06em" },
    { id: "stencil",   label: "Stencil",       family: "'Saira Stencil One', sans-serif",       weight: 400,  letterSpacing: "0.04em" },
    { id: "goldman",   label: "Goldman",       family: "'Goldman', sans-serif",                 weight: 700,  letterSpacing: "0.02em" },
    { id: "bruno",     label: "Bruno",         family: "'Bruno Ace SC', sans-serif",            weight: 400,  letterSpacing: "0.08em" },
    { id: "russo",     label: "Russo",         family: "'Russo One', sans-serif",               weight: 400,  letterSpacing: "0.03em" },
    { id: "pixel",     label: "Pixel",         family: "'Press Start 2P', monospace",           weight: 400,  letterSpacing: "0.04em" },
    { id: "mono",      label: "Mono",          family: "'Major Mono Display', monospace",       weight: 400,  letterSpacing: "0.04em" },
    { id: "genos",     label: "Genos",         family: "'Genos', sans-serif",                   weight: 900,  letterSpacing: "0.04em" },
    { id: "outfit",    label: "Outfit",        family: "'Outfit', sans-serif",                  weight: 800,  letterSpacing: "0.02em" },
];

export const getClockFont = (id) => CLOCK_FONTS.find((f) => f.id === id) || CLOCK_FONTS[0];
