"""Backend tests for Zero+ backend (proxies + device settings)."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://zero-hub-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Health ----------
def test_root_health(s):
    r = s.get(f"{API}/", timeout=20)
    assert r.status_code == 200
    j = r.json()
    assert "message" in j and "ts" in j


# ---------- Crypto ----------
def test_crypto_prices(s):
    r = s.get(f"{API}/crypto/prices", params={"ids": "bitcoin,ethereum"}, timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "bitcoin" in j and "ethereum" in j
    for coin in ("bitcoin", "ethereum"):
        assert "usd" in j[coin]
        assert "usd_24h_change" in j[coin]
        assert isinstance(j[coin]["usd"], (int, float))


def test_crypto_trending(s):
    r = s.get(f"{API}/crypto/trending", timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "coins" in j and isinstance(j["coins"], list)
    assert len(j["coins"]) >= 1
    first = j["coins"][0]
    assert "id" in first and "name" in first


def test_crypto_search(s):
    r = s.get(f"{API}/crypto/search", params={"q": "btc"}, timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "coins" in j and isinstance(j["coins"], list)
    assert len(j["coins"]) >= 1


# ---------- Stocks ----------
def test_stocks_quote(s):
    r = s.get(f"{API}/stocks/quote", params={"symbols": "NVDA,SPY"}, timeout=45)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "quotes" in j and isinstance(j["quotes"], list)
    assert len(j["quotes"]) == 2
    syms = {q["symbol"] for q in j["quotes"]}
    assert {"NVDA", "SPY"}.issubset(syms)
    for q in j["quotes"]:
        assert q.get("price") is not None, f"price is None for {q['symbol']}: {q}"


def test_stocks_search(s):
    r = s.get(f"{API}/stocks/search", params={"q": "nvda"}, timeout=45)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "quotes" in j and isinstance(j["quotes"], list)
    assert len(j["quotes"]) >= 1
    syms = [q.get("symbol", "").upper() for q in j["quotes"]]
    assert any("NVDA" in s for s in syms), f"NVDA not in {syms}"


# ---------- FX ----------
def test_fx_rates(s):
    r = s.get(f"{API}/fx/rates", params={"base": "USD"}, timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "rates" in j
    for k in ("USD", "AUD", "EUR"):
        assert k in j["rates"], f"{k} missing from rates"


# ---------- News ----------
def test_news_topics(s):
    r = s.get(f"{API}/news/topics", timeout=20)
    assert r.status_code == 200
    j = r.json()
    assert "topics" in j and isinstance(j["topics"], list)
    for t in ("tech", "world", "finance"):
        assert t in j["topics"]


def test_news_tech(s):
    r = s.get(f"{API}/news", params={"topic": "tech"}, timeout=60)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "items" in j
    assert isinstance(j["items"], list)
    assert len(j["items"]) >= 1
    item = j["items"][0]
    assert "title" in item and "link" in item and "source" in item


def test_news_invalid_topic(s):
    r = s.get(f"{API}/news", params={"topic": "invalidtopic"}, timeout=20)
    assert r.status_code == 404


# ---------- Device settings ----------
def test_device_settings_put_then_get(s):
    device_id = f"TEST_{uuid.uuid4()}"
    payload = {"data": {"foo": "bar", "n": 42}}
    rp = s.put(f"{API}/settings/{device_id}", json=payload, timeout=20)
    assert rp.status_code == 200, rp.text
    jp = rp.json()
    assert jp.get("ok") is True
    assert jp.get("updated_at")

    rg = s.get(f"{API}/settings/{device_id}", timeout=20)
    assert rg.status_code == 200
    jg = rg.json()
    assert jg.get("data", {}).get("foo") == "bar"
    assert jg.get("data", {}).get("n") == 42
