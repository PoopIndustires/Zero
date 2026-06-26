import React, { useMemo, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";
import { Shuffle, Save, Send, History } from "lucide-react";

const STORES = ["Loco", "Gong Cha", "Chatime", "KOI", "Sharetea", "CoCo", "Tiger Sugar", "Yi Fang", "Mochiicat"];
const SIZES = ["S", "M", "L", "XL"];
const TEAS = ["Black", "Green", "Oolong", "Jasmine", "Matcha", "Thai", "Taro"];
const MILKS = ["None", "Dairy", "Oat", "Almond", "Coconut", "Soy"];
const TOPPINGS = ["Tapioca", "Popping Boba", "Jelly", "Pudding", "Grass Jelly", "Aloe", "Cheese Foam", "Lychee"];
const ICE = [0, 25, 50, 75, 100];
const SUGAR = [0, 30, 50, 70, 100];

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function BobaBuilder() {
    const { state, dispatch } = useZero();
    const [size, setSize] = useState("M");
    const [tea, setTea] = useState("Black");
    const [milk, setMilk] = useState("Oat");
    const [ice, setIce] = useState(50);
    const [sugar, setSugar] = useState(50);
    const [chaos, setChaos] = useState(40);
    const [toppings, setToppings] = useState(["Tapioca"]);
    const [store, setStore] = useState(state.boba.store || "Loco");

    const toggleTopping = (t) => setToppings((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

    const randomize = () => {
        setSize(sample(SIZES));
        setTea(sample(TEAS));
        setMilk(sample(MILKS));
        setIce(sample(ICE));
        setSugar(sample(SUGAR));
        // chaos scales how many toppings
        const n = Math.max(1, Math.round((chaos / 100) * TOPPINGS.length));
        const shuffled = [...TOPPINGS].sort(() => Math.random() - 0.5).slice(0, n);
        setToppings(shuffled);
    };

    const combo = useMemo(() => ({
        store, size, tea, milk, ice, sugar, toppings,
    }), [store, size, tea, milk, ice, sugar, toppings]);

    const save = () => {
        const next = [{ id: `b${Date.now()}`, ts: new Date().toISOString(), ...combo }, ...state.boba.history].slice(0, 30);
        dispatch({ type: "SET_PATH", path: ["boba", "history"], value: next });
        dispatch({ type: "SET_PATH", path: ["boba", "store"], value: store });
    };

    const order = () => {
        // deep-link or web search the store
        const q = encodeURIComponent(`${store} bubble tea ${size} ${tea} ${milk} milk ${toppings.join(" ")}`);
        window.open(`https://www.google.com/search?q=${q}`, "_blank");
        save();
    };

    return (
        <div data-testid={TID.appBoba} className="p-5 text-white">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="font-display text-2xl font-black">Boba Builder</h2>
                    <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Design your perfect drink</div>
                </div>
                <div className="text-4xl">🧋</div>
            </div>

            {/* Store */}
            <div className="mb-4">
                <Label>Store</Label>
                <div className="flex flex-wrap gap-1.5">
                    {STORES.map((s) => (
                        <Chip key={s} testid={TID.bobaStore(s.toLowerCase().replace(/\s/g, "-"))} active={store === s} onClick={() => setStore(s)}>{s}</Chip>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div className="mb-4">
                <Label>Size</Label>
                <div className="flex gap-1.5">
                    {SIZES.map((s) => (
                        <Chip key={s} testid={TID.bobaSize(s.toLowerCase())} active={size === s} onClick={() => setSize(s)}>{s}</Chip>
                    ))}
                </div>
            </div>

            {/* Tea */}
            <div className="mb-4">
                <Label>Tea Base</Label>
                <div className="flex flex-wrap gap-1.5">
                    {TEAS.map((s) => (
                        <Chip key={s} testid={TID.bobaTea(s.toLowerCase())} active={tea === s} onClick={() => setTea(s)}>{s}</Chip>
                    ))}
                </div>
            </div>

            {/* Milk */}
            <div className="mb-4">
                <Label>Milk</Label>
                <div className="flex flex-wrap gap-1.5">
                    {MILKS.map((s) => (
                        <Chip key={s} testid={TID.bobaMilk(s.toLowerCase())} active={milk === s} onClick={() => setMilk(s)}>{s}</Chip>
                    ))}
                </div>
            </div>

            {/* Ice / Sugar */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <SliderRow label={`Ice ${ice}%`} value={ice} setValue={setIce} options={ICE} />
                <SliderRow label={`Sugar ${sugar}%`} value={sugar} setValue={setSugar} options={SUGAR} />
            </div>

            {/* Toppings */}
            <div className="mb-4">
                <Label>Toppings</Label>
                <div className="flex flex-wrap gap-1.5">
                    {TOPPINGS.map((s) => (
                        <Chip key={s} testid={TID.bobaTopping(s.toLowerCase().replace(/\s/g, "-"))} active={toppings.includes(s)} onClick={() => toggleTopping(s)}>{s}</Chip>
                    ))}
                </div>
            </div>

            {/* Chaos */}
            <div className="mb-5">
                <Label>Chaos &nbsp;<span className="text-white/40">({chaos})</span></Label>
                <input type="range" min="0" max="100" value={chaos} onChange={(e) => setChaos(parseInt(e.target.value))} className="w-full accent-fuchsia-500" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                <ActionBtn testid={TID.bobaRandom} onClick={randomize} icon={Shuffle}>I&apos;m Feeling Lucky</ActionBtn>
                <ActionBtn testid={TID.bobaSave} onClick={save} icon={Save}>Save</ActionBtn>
                <ActionBtn testid={TID.bobaOrder} onClick={order} icon={Send} primary>Order @ {store}</ActionBtn>
            </div>

            {/* History */}
            {state.boba.history.length > 0 && (
                <div className="mt-5 border-t border-white/[0.07] pt-4">
                    <div className="flex items-center gap-2 mb-2 text-white/55"><History size={12} /> <span className="text-[10px] uppercase tracking-[0.3em] font-mono-ui">Recent</span></div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto zp-scroll">
                        {state.boba.history.slice(0, 5).map((h) => (
                            <div key={h.id} className="text-[11px] text-white/60 font-mono-ui truncate">
                                <span className="text-white/85">{h.size} {h.tea}</span> + {h.milk} milk · {h.toppings.join(", ")} <span className="text-white/40">@ {h.store}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const Label = ({ children }) => <div className="text-[10px] uppercase tracking-[0.25em] font-mono-ui text-white/45 mb-1.5">{children}</div>;

const Chip = ({ children, active, onClick, testid }) => (
    <button
        data-testid={testid}
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-[12px] font-mono-ui transition ${
            active ? "bg-fuchsia-500/20 text-white border border-fuchsia-500/50"
                   : "bg-white/[0.03] text-white/65 border border-white/[0.08] hover:text-white hover:bg-white/[0.06]"
        }`}
    >
        {children}
    </button>
);

const SliderRow = ({ label, value, setValue, options }) => (
    <div>
        <Label>{label}</Label>
        <div className="flex gap-1">
            {options.map((o) => (
                <button key={o} onClick={() => setValue(o)} className={`flex-1 py-1 rounded-md text-[10px] font-mono-ui ${value === o ? "bg-white/15 text-white border border-white/30" : "bg-white/[0.02] text-white/45 border border-white/[0.05] hover:text-white/85"}`}>{o}%</button>
            ))}
        </div>
    </div>
);

const ActionBtn = ({ children, onClick, icon: Icon, primary, testid }) => (
    <button
        data-testid={testid}
        onClick={onClick}
        className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-mono-ui text-sm transition ${
            primary
                ? "bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold"
                : "bg-white/[0.06] hover:bg-white/[0.12] text-white/85 border border-white/[0.08]"
        }`}
    >
        <Icon size={13} /> {children}
    </button>
);
