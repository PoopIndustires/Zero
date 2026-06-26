import React, { useEffect, useState } from "react";
import { useZero } from "@/store/ZeroProvider";
import { TID } from "@/constants/testIds";
import { fetchNews, fetchNewsTopics } from "@/utils/api";
import { ExternalLink, RefreshCw, Newspaper } from "lucide-react";

export function News() {
    const { state, dispatch } = useZero();
    const [topics, setTopics] = useState(["tech", "world", "finance", "science", "gaming", "design", "anime", "climate"]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async (topic) => {
        setLoading(true);
        try {
            const data = await fetchNews(topic);
            setItems(data.items || []);
        } catch (e) {
            setItems([]);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchNewsTopics().then((d) => d.topics && setTopics(d.topics)).catch(() => { });
    }, []);
    useEffect(() => { load(state.news.topic); /* eslint-disable-next-line */ }, [state.news.topic]);

    const markRead = (link) => {
        const ids = new Set(state.news.readIds);
        ids.add(link);
        dispatch({ type: "SET_PATH", path: ["news", "readIds"], value: Array.from(ids).slice(-200) });
    };

    return (
        <div data-testid={TID.appNews} className="p-5 text-white h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="font-display text-2xl font-black">News</h2>
                    <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-white/45">Your feed · RSS-powered</div>
                </div>
                <button onClick={() => load(state.news.topic)} className={`w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/65 ${loading ? "animate-spin" : ""}`}>
                    <RefreshCw size={14} />
                </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
                {topics.map((t) => (
                    <button
                        key={t}
                        data-testid={TID.newsTopic(t)}
                        onClick={() => dispatch({ type: "SET_PATH", path: ["news", "topic"], value: t })}
                        className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-[0.15em] font-mono-ui ${
                            state.news.topic === t ? "bg-white/15 text-white border border-white/25" : "text-white/55 hover:text-white border border-transparent"
                        }`}
                    >{t}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto zp-scroll space-y-2 pr-1">
                {items.length === 0 && !loading && (
                    <div className="text-center py-10 text-white/40 font-mono-ui text-sm">
                        <Newspaper size={28} className="mx-auto mb-2 opacity-60" />
                        No items yet
                    </div>
                )}
                {items.map((it, i) => {
                    const read = state.news.readIds.includes(it.link);
                    return (
                        <a
                            key={i + it.link}
                            data-testid={TID.newsItem(i)}
                            href={it.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markRead(it.link)}
                            className={`block px-3 py-2.5 rounded-lg border transition ${read ? "opacity-50" : ""} bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/15`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-display font-bold text-sm text-white leading-snug">{it.title}</div>
                                    <div className="font-mono-ui text-[10px] text-white/45 mt-1 flex items-center gap-2">
                                        <span className="truncate">{it.source}</span>
                                        {it.published && <span>· {(it.published || "").slice(0, 16)}</span>}
                                    </div>
                                    {it.summary && (
                                        <div className="font-mono-ui text-[11px] text-white/55 mt-1.5 line-clamp-2"
                                             dangerouslySetInnerHTML={{ __html: it.summary }} />
                                    )}
                                </div>
                                <ExternalLink size={12} className="text-white/30 mt-1 shrink-0" />
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
