"""
Zero+ Backend — FastAPI proxies for stocks/crypto/news + device-scoped settings sync.
No auth. State is keyed by anonymous device_id (UUID generated client-side).
"""
from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
import feedparser
import time
import yfinance as yf

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Zero+ Backend")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Simple in-memory TTL cache for upstream proxies
_cache: Dict[str, tuple] = {}

def cache_get(key: str, ttl: int):
    entry = _cache.get(key)
    if entry and (time.time() - entry[1]) < ttl:
        return entry[0]
    return None

def cache_set(key: str, value: Any):
    _cache[key] = (value, time.time())

# ---------- Models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class DeviceSettings(BaseModel):
    device_id: str
    data: Dict[str, Any] = Field(default_factory=dict)
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DeviceSettingsUpdate(BaseModel):
    data: Dict[str, Any]

# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"message": "Zero+ backend online", "ts": datetime.now(timezone.utc).isoformat()}

# ---------- Status (kept for compatibility) ----------
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    obj = StatusCheck(**input.model_dump())
    doc = obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    items = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for it in items:
        if isinstance(it.get('timestamp'), str):
            it['timestamp'] = datetime.fromisoformat(it['timestamp'])
    return items

# ---------- Device settings (anonymous sync) ----------
@api_router.get("/settings/{device_id}")
async def get_settings(device_id: str):
    doc = await db.device_settings.find_one({"device_id": device_id}, {"_id": 0})
    if not doc:
        return {"device_id": device_id, "data": {}, "updated_at": None}
    return doc

@api_router.put("/settings/{device_id}")
async def put_settings(device_id: str, body: DeviceSettingsUpdate):
    now = datetime.now(timezone.utc).isoformat()
    await db.device_settings.update_one(
        {"device_id": device_id},
        {"$set": {"device_id": device_id, "data": body.data, "updated_at": now}},
        upsert=True,
    )
    return {"device_id": device_id, "updated_at": now, "ok": True}

# ---------- Crypto (CoinGecko) ----------
COINGECKO = "https://api.coingecko.com/api/v3"

@api_router.get("/crypto/prices")
async def crypto_prices(ids: str = Query(..., description="comma-separated coingecko ids e.g. bitcoin,ethereum"),
                       vs: str = Query("usd")):
    key = f"prices:{ids}:{vs}"
    cached = cache_get(key, 60)
    if cached:
        return cached
    # Try a couple of times — CoinGecko sometimes returns 429 from datacenter IPs
    last_err = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10) as cli:
                r = await cli.get(f"{COINGECKO}/simple/price",
                                  params={"ids": ids, "vs_currencies": vs,
                                          "include_24hr_change": "true",
                                          "include_market_cap": "true"})
                r.raise_for_status()
                data = r.json()
                cache_set(key, data)
                return data
        except Exception as e:
            last_err = e
            await asyncio.sleep(0.6 * (attempt + 1))
    logger.warning(f"crypto/prices error after retries: {last_err}")
    # On total failure return stale cache if any (even expired), else error
    stale = _cache.get(key)
    if stale:
        return stale[0]
    raise HTTPException(502, detail=str(last_err))

@api_router.get("/crypto/trending")
async def crypto_trending():
    cached = cache_get("crypto_trending", 120)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=10) as cli:
            r = await cli.get(f"{COINGECKO}/search/trending")
            r.raise_for_status()
            payload = r.json()
            coins = []
            for c in payload.get("coins", [])[:10]:
                item = c.get("item", {})
                coins.append({
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "symbol": item.get("symbol"),
                    "thumb": item.get("thumb"),
                    "price_btc": item.get("price_btc"),
                    "market_cap_rank": item.get("market_cap_rank"),
                })
            data = {"coins": coins}
            cache_set("crypto_trending", data)
            return data
    except Exception as e:
        logger.warning(f"crypto/trending error: {e}")
        raise HTTPException(502, detail=str(e))

@api_router.get("/crypto/search")
async def crypto_search(q: str = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=10) as cli:
            r = await cli.get(f"{COINGECKO}/search", params={"query": q})
            r.raise_for_status()
            payload = r.json()
            coins = []
            for c in payload.get("coins", [])[:15]:
                coins.append({
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "symbol": c.get("symbol"),
                    "thumb": c.get("thumb"),
                })
            return {"coins": coins}
    except Exception as e:
        logger.warning(f"crypto/search error: {e}")
        raise HTTPException(502, detail=str(e))

# ---------- Stocks (Yahoo Finance via httpx) ----------
YF_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote"
YF_SEARCH = "https://query1.finance.yahoo.com/v1/finance/search"
YF_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

def _yf_lookup(symbols_list):
    results = []
    try:
        tickers = yf.Tickers(" ".join(symbols_list))
        for sym in symbols_list:
            try:
                t = tickers.tickers[sym]
                info = getattr(t, "fast_info", None) or {}
                last = info.get("last_price") if isinstance(info, dict) else getattr(info, "last_price", None)
                prev = info.get("previous_close") if isinstance(info, dict) else getattr(info, "previous_close", None)
                currency = info.get("currency") if isinstance(info, dict) else getattr(info, "currency", None)
                change = (last - prev) if (last is not None and prev is not None) else None
                change_pct = ((change / prev) * 100) if (change is not None and prev) else None
                results.append({
                    "symbol": sym.upper(),
                    "name": sym.upper(),
                    "price": last,
                    "change": change,
                    "change_pct": change_pct,
                    "currency": currency or "USD",
                    "exchange": None,
                    "market_state": None,
                    "quote_type": "EQUITY",
                })
            except Exception as inner:
                logger.warning(f"yf lookup {sym} failed: {inner}")
                results.append({"symbol": sym.upper(), "price": None, "name": sym.upper(), "change": None, "change_pct": None, "currency": "USD"})
    except Exception as e:
        logger.warning(f"yf bulk lookup failed: {e}")
    return results

@api_router.get("/stocks/quote")
async def stocks_quote(symbols: str = Query(..., description="comma separated symbols e.g. NVDA,AAPL,SPY")):
    key = f"stocks:{symbols}"
    cached = cache_get(key, 30)
    if cached:
        return cached
    syms = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, _yf_lookup, syms)
    data = {"quotes": results}
    cache_set(key, data)
    return data

def _yf_search(q):
    try:
        s = yf.Search(q, max_results=10, news_count=0)
        results = []
        for r in (s.quotes or []):
            results.append({
                "symbol": r.get("symbol"),
                "name": r.get("shortname") or r.get("longname") or r.get("symbol"),
                "exchange": r.get("exchDisp") or r.get("exchange"),
                "type": r.get("quoteType"),
            })
        return results
    except Exception as e:
        logger.warning(f"yf search failed: {e}")
        return []

@api_router.get("/stocks/search")
async def stocks_search(q: str = Query(...)):
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, _yf_search, q)
    return {"quotes": results}

# ---------- FX rates (for portfolio currency conversion) ----------
@api_router.get("/fx/rates")
async def fx_rates(base: str = Query("USD")):
    key = f"fx:{base}"
    cached = cache_get(key, 600)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=10) as cli:
            # exchangerate.host is free, no key
            r = await cli.get(f"https://api.exchangerate-api.com/v4/latest/{base}")
            r.raise_for_status()
            data = r.json()
            cache_set(key, data)
            return data
    except Exception as e:
        logger.warning(f"fx/rates error: {e}")
        raise HTTPException(502, detail=str(e))

# ---------- News (RSS + Hacker News) ----------
NEWS_FEEDS: Dict[str, List[str]] = {
    "tech": [
        "https://hnrss.org/frontpage",
        "https://www.theverge.com/rss/index.xml",
        "https://feeds.arstechnica.com/arstechnica/index",
    ],
    "world": [
        "http://feeds.bbci.co.uk/news/world/rss.xml",
        "https://feeds.reuters.com/Reuters/worldNews",
    ],
    "finance": [
        "https://www.ft.com/?format=rss",
        "https://feeds.marketwatch.com/marketwatch/topstories/",
    ],
    "science": [
        "https://www.sciencedaily.com/rss/all.xml",
    ],
    "gaming": [
        "https://www.polygon.com/rss/index.xml",
        "https://www.eurogamer.net/?format=rss",
    ],
    "design": [
        "https://www.smashingmagazine.com/feed/",
        "https://www.creativebloq.com/feeds/all",
    ],
    "anime": [
        "https://www.animenewsnetwork.com/all/rss.xml",
    ],
    "climate": [
        "https://grist.org/feed/",
    ],
}

def _parse_feed(url: str, limit: int = 10):
    try:
        f = feedparser.parse(url)
        items = []
        for e in f.entries[:limit]:
            items.append({
                "title": getattr(e, "title", ""),
                "link": getattr(e, "link", ""),
                "summary": getattr(e, "summary", "")[:400],
                "published": getattr(e, "published", "") or getattr(e, "updated", ""),
                "source": f.feed.get("title", "") if hasattr(f, "feed") else "",
            })
        return items
    except Exception as e:
        logger.warning(f"feed parse error {url}: {e}")
        return []

@api_router.get("/news")
async def news(topic: str = Query("tech"), limit: int = 25):
    topic = topic.lower().strip()
    if topic not in NEWS_FEEDS:
        raise HTTPException(404, detail=f"Unknown topic. Available: {list(NEWS_FEEDS.keys())}")
    key = f"news:{topic}:{limit}"
    cached = cache_get(key, 300)
    if cached:
        return cached
    urls = NEWS_FEEDS[topic]
    # Parse in thread to avoid blocking
    loop = asyncio.get_event_loop()
    results_lists = await asyncio.gather(*[loop.run_in_executor(None, _parse_feed, u, 15) for u in urls])
    items = [it for sub in results_lists for it in sub]
    # Sort by published roughly (string) and limit
    items = items[:limit]
    data = {"topic": topic, "items": items}
    cache_set(key, data)
    return data

@api_router.get("/news/topics")
async def news_topics():
    return {"topics": list(NEWS_FEEDS.keys())}

# ---------- Wire up ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
