import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    timeout: 15000,
});

export const fetchCryptoPrices = (ids, vs = "usd") =>
    api.get(`/crypto/prices`, { params: { ids: ids.join(","), vs } }).then((r) => r.data);

export const fetchCryptoTrending = () => api.get(`/crypto/trending`).then((r) => r.data);

export const searchCrypto = (q) => api.get(`/crypto/search`, { params: { q } }).then((r) => r.data);

export const fetchStockQuotes = (symbols) =>
    api.get(`/stocks/quote`, { params: { symbols: symbols.join(",") } }).then((r) => r.data);

export const searchStocks = (q) => api.get(`/stocks/search`, { params: { q } }).then((r) => r.data);

export const fetchFxRates = (base = "USD") =>
    api.get(`/fx/rates`, { params: { base } }).then((r) => r.data);

export const fetchNews = (topic) => api.get(`/news`, { params: { topic } }).then((r) => r.data);

export const fetchNewsTopics = () => api.get(`/news/topics`).then((r) => r.data);

export const loadDeviceSettings = (deviceId) =>
    api.get(`/settings/${deviceId}`).then((r) => r.data);

export const saveDeviceSettings = (deviceId, data) =>
    api.put(`/settings/${deviceId}`, { data }).then((r) => r.data);
