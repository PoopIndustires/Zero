import React, { useEffect, useMemo, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";
import { fetchCryptoPrices, fetchCryptoTrending, fetchStockQuotes, fetchFxRates, searchCrypto, searchStocks } from "@/utils/api";
import { Plus, X, TrendingUp, TrendingDown, RefreshCw, Search } from "lucide-react";

const CURRENCIES = ["USD", "AUD", "EUR", "GBP", "JPY", "VND"];

export function StocksCrypto() {
    const { state, dispatch } = useZero();
    const p = state.portfolio;
    const [cryptoPrices, setCryptoPrices] = useState({});
    const [stockPrices, setStockPrices] = useState({});
    const [trending, setTrending] = useState([]);
    const [fx, setFx] = useState({ rates: { USD: 1 } });
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [addType, setAddType] = useState("crypto");
    const [qty, setQty] = useState(1);

    const reload = async () => {
        setLoading(true);
        const cryptoIds = p.crypto.map((c) => c.id);
        const stockSyms = p.stocks.map((s) => s.symbol);
        // Fire in parallel, handle each independently so one failure doesn't blank others
        const results = await Promise.allSettled([
            cryptoIds.length ? fetchCryptoPrices(cryptoIds, "usd") : Promise.resolve({}),
            stockSyms.length ? fetchStockQuotes(stockSyms) : Promise.resolve({ quotes: [] }),
            fetchCryptoTrending(),
            fetchFxRates("USD"),
        ]);
        if (results[0].status === "fulfilled") setCryptoPrices(results[0].value);
        if (results[1].status === "fulfilled") {
            const sm = {};
            (results[1].value.quotes || []).forEach((q) => { sm[q.symbol] = q; });
            setStockPrices(sm);
        }
        if (results[2].status === "fulfilled") setTrending(results[2].value.coins || []);
        if (results[3].status === "fulfilled") setFx(results[3].value);
        setLoading(false);
    };

    useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);
    useEffect(() => { const id = setInterval(reload, 60000); return () => clearInterval(id); /* eslint-disable-next-line */ }, [p.crypto, p.stocks]);

    const rate = (fx.rates && fx.rates[p.currency]) || 1;

    const totals = useMemo(() => {
        let cryptoVal = 0, stockVal = 0, crypto24h = 0;
        p.crypto.forEach((c) => {
            const px = cryptoPrices[c.id];
            if (px) {
                const v = px.usd * c.qty;
                cryptoVal += v;
                crypto24h += (px.usd_24h_change || 0) * v / 100;
            }
        });
        p.stocks.forEach((s) => {
            const q = stockPrices[s.symbol];
            if (q?.price) stockVal += q.price * s.qty;
        });
        return {
            crypto: cryptoVal * rate,
            stocks: stockVal * rate,
            total: (cryptoVal + stockVal) * rate,
            change24h: crypto24h * rate,
        };
    }, [p, cryptoPrices, stockPrices, rate]);

    const onSearch = async (q) => {
        setQuery(q);
        if (!q) { setResults([]); return; }
        try {
            const data = addType === "crypto" ? await searchCrypto(q) : await searchStocks(q);
            setResults(addType === "crypto" ? (data.coins || []) : (data.quotes || []));
        } catch (e) { setResults([]); }
    };

    const addItem = (item) => {
        if (addType === "crypto") {
            const newC = [...p.crypto, { id: item.id, symbol: item.symbol.toUpperCase(), qty: parseFloat(qty) || 1 }];
            dispatch({ type: "SET_PATH", path: ["portfolio", "crypto"], value: newC });
        } else {
            const newS = [...p.stocks, { symbol: item.symbol, qty: parseFloat(qty) || 1 }];
            dispatch({ type: "SET_PATH", path: ["portfolio", "stocks"], value: newS });
        }
        setQuery(""); setResults([]);
        setTimeout(reload, 250);
    };

    const removeCrypto = (id) => dispatch({ type: "SET_PATH", path: ["portfolio", "crypto"], value: p.crypto.filter((c) => c.id !== id) });
    const removeStock = (sym) => dispatch({ type: "SET_PATH", path: ["portfolio", "stocks"], value: p.stocks.filter((s) => s.symbol !== sym) });

    const fmtMoney = (v) => `${p.currency === "USD" ? "$" : ""}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.currency !== "USD" ? p.currency : ""}`.trim();

    return (
        <div data-testid={TID.appStocks} className="p-5 text-white">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-display text-2xl font-black">Portfolio</h2>
                    <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Stocks · Crypto · Live</div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        data-testid={TID.stocksCurrency}
                        value={p.currency}
                        onChange={(e) => dispatch({ type: "SET_PATH", path: ["portfolio", "currency"], value: e.target.value })}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[12px] font-mono-ui text-white/85 outline-none"
                    >
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={reload} className={`w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/65 ${loading ? "animate-spin" : ""}`}>
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <Stat label="Total" value={fmtMoney(totals.total)} accent change={totals.change24h} fmt={fmtMoney} />
                <Stat label="Crypto" value={fmtMoney(totals.crypto)} />
                <Stat label="Stocks" value={fmtMoney(totals.stocks)} />
            </div>

            {/* Holdings */}
            <div className="space-y-1.5 mb-4">
                {p.crypto.map((c, i) => {
                    const px = cryptoPrices[c.id];
                    const val = px ? px.usd * c.qty * rate : 0;
                    const chg = px?.usd_24h_change ?? 0;
                    return (
                        <Holding key={c.id} testid={TID.stocksHolding(`c-${i}`)}
                            badge="CR" name={c.symbol} qty={c.qty}
                            price={px?.usd ? px.usd * rate : null} value={val} change={chg} fmtMoney={fmtMoney}
                            onRemove={() => removeCrypto(c.id)} removeTid={TID.stocksRemove(`c-${i}`)} />
                    );
                })}
                {p.stocks.map((s, i) => {
                    const q = stockPrices[s.symbol];
                    const val = q?.price ? q.price * s.qty * rate : 0;
                    const chg = q?.change_pct ?? 0;
                    return (
                        <Holding key={s.symbol} testid={TID.stocksHolding(`s-${i}`)}
                            badge="ST" name={s.symbol} qty={s.qty}
                            price={q?.price ? q.price * rate : null} value={val} change={chg} fmtMoney={fmtMoney}
                            onRemove={() => removeStock(s.symbol)} removeTid={TID.stocksRemove(`s-${i}`)} />
                    );
                })}
            </div>

            {/* Add new */}
            <div className="zp-glass rounded-xl p-3 mb-4">
                <div className="text-[10px] uppercase tracking-[0.3em] font-mono-ui text-white/45 mb-2">Add Holding</div>
                <div className="flex gap-1 mb-2">
                    {["crypto", "stock"].map((t) => (
                        <button key={t} data-testid={TID.stocksType(t)} onClick={() => { setAddType(t); setQuery(""); setResults([]); }} className={`flex-1 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-[0.15em] font-mono-ui ${addType === t ? "bg-white/15 text-white border border-white/25" : "text-white/55 hover:text-white"}`}>{t}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            data-testid={TID.stocksSymbolInput}
                            value={query}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder={addType === "crypto" ? "Search Bitcoin, ETH…" : "Search NVDA, AAPL…"}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md pl-7 pr-3 py-1.5 text-sm font-mono-ui text-white placeholder:text-white/30 outline-none focus:border-white/25"
                        />
                    </div>
                    <input
                        data-testid={TID.stocksQtyInput}
                        type="number" step="any" value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-20 bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1.5 text-sm font-mono-ui text-white outline-none focus:border-white/25"
                        placeholder="qty"
                    />
                </div>
                {results.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto zp-scroll space-y-1">
                        {results.slice(0, 6).map((r) => (
                            <button
                                key={r.id || r.symbol}
                                data-testid={TID.stocksAdd}
                                onClick={() => addItem(r)}
                                className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/[0.05] flex items-center justify-between"
                            >
                                <div className="text-sm font-mono-ui text-white">
                                    <span className="font-bold">{r.symbol?.toUpperCase()}</span> <span className="text-white/55">{r.name}</span>
                                </div>
                                <Plus size={12} className="text-white/45" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Trending */}
            <div data-testid={TID.stocksTrending}>
                <div className="text-[10px] uppercase tracking-[0.3em] font-mono-ui text-white/45 mb-2">Trending Coins</div>
                <div className="grid grid-cols-2 gap-1.5">
                    {trending.slice(0, 6).map((c) => (
                        <button
                            key={c.id}
                            onClick={() => addItem({ id: c.id, symbol: c.symbol })}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]"
                        >
                            {c.thumb && <img src={c.thumb} alt="" className="w-5 h-5 rounded-full" />}
                            <div className="text-[12px] font-mono-ui text-white/85 truncate">{c.symbol?.toUpperCase()}</div>
                            <div className="text-[10px] text-white/40 ml-auto truncate">#{c.market_cap_rank}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Stat = ({ label, value, accent, change, fmt }) => (
    <div className={`rounded-xl p-3 border ${accent ? "bg-white/[0.05] border-white/15" : "bg-white/[0.02] border-white/[0.06]"}`}>
        <div className="text-[9px] uppercase tracking-[0.3em] font-mono-ui text-white/45">{label}</div>
        <div className="font-display text-xl font-black text-white mt-0.5 tabular-nums">{value}</div>
        {accent && change !== undefined && (
            <div className={`text-[10px] font-mono-ui mt-0.5 flex items-center gap-1 ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {change >= 0 ? "+" : ""}{fmt(change)} (24h crypto)
            </div>
        )}
    </div>
);

const Holding = ({ testid, badge, name, qty, price, value, change, fmtMoney, onRemove, removeTid }) => (
    <div data-testid={testid} className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05]">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold font-mono-ui ${badge === "CR" ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30" : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"}`}>
            {badge}
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-mono-ui text-sm text-white font-bold">{name}</div>
            <div className="text-[10px] text-white/40 font-mono-ui">{qty} {price != null && `· ${fmtMoney(price)}`}</div>
        </div>
        <div className="text-right">
            <div className="font-mono-ui text-sm text-white tabular-nums">{fmtMoney(value)}</div>
            <div className={`text-[10px] font-mono-ui ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{change >= 0 ? "+" : ""}{(change ?? 0).toFixed(2)}%</div>
        </div>
        <button data-testid={removeTid} onClick={onRemove} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/55">
            <X size={11} />
        </button>
    </div>
);
