// scripts/fetch-fmp-data.mjs
// GitHub Actions에서 실행: FMP API 데이터를 public/data/*.json으로 저장
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const HIST_DIR = join(DATA_DIR, "historical");
const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/stable";

if (!API_KEY) {
  console.error("FMP_API_KEY environment variable is required");
  process.exit(1);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function save(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filePath}`);
}

const US_SYMBOLS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","BRK-B","TSLA","UNH","LLY",
  "JPM","XOM","V","JNJ","PG","MA","AVGO","HD","MRK","COST",
  "ABBV","PEP","KO","ADBE","CRM","WMT","BAC","NFLX","TMO","AMD",
];

async function main() {
  mkdirSync(HIST_DIR, { recursive: true });
  let hasData = false;

  // 1. Market indexes + forex + commodities
  console.log("Fetching market indexes...");
  const indexes = [];
  const extras = [];

  for (const sym of ["^GSPC", "^IXIC", "^NYA", "^KS11", "^KQ11"]) {
    try {
      const data = await fetchJson(`${BASE}/quote?symbol=${encodeURIComponent(sym)}&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q) indexes.push({
        symbol: q.symbol,
        name: q.name || q.symbol,
        price: q.price,
        changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
        change: q.change,
      });
      console.log(`  Index ${sym}: OK`);
    } catch (e) {
      console.warn(`  Index ${sym}: SKIP (${e.message})`);
    }
  }

  try {
    const data = await fetchJson(`${BASE}/quote?symbol=USDKRW&apikey=${API_KEY}`);
    const q = Array.isArray(data) ? data[0] : data;
    if (q) extras.push({
      pair: "USD/KRW",
      name: "달러/원",
      rate: q.price,
      change: q.change,
      changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
    });
    console.log("  Forex USDKRW: OK");
  } catch (e) {
    console.warn(`  Forex USDKRW: SKIP (${e.message})`);
  }

  for (const [sym, name] of [["GCUSD", "금 (oz)"], ["SIUSD", "은 (oz)"]]) {
    try {
      const data = await fetchJson(`${BASE}/quote?symbol=${sym}&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q) extras.push({
        pair: q.symbol,
        name,
        rate: q.price,
        change: q.change,
        changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
      });
      console.log(`  Commodity ${sym}: OK`);
    } catch (e) {
      console.warn(`  Commodity ${sym}: SKIP (${e.message})`);
    }
  }

  if (indexes.length > 0 || extras.length > 0) {
    save(join(DATA_DIR, "market-indexes.json"), { indexes, extras });
    hasData = true;
  }

  // 2. US stock quotes (batch-quote 엔드포인트)
  console.log("Fetching US stock quotes...");
  try {
    const data = await fetchJson(`${BASE}/batch-quote?symbols=${US_SYMBOLS.join(",")}&apikey=${API_KEY}`);
    const usQuotes = Array.isArray(data) ? data : [data];
    const usStocks = usQuotes.map((q) => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
      change: q.change,
      dayLow: q.dayLow,
      dayHigh: q.dayHigh,
      yearHigh: q.yearHigh,
      yearLow: q.yearLow,
      marketCap: q.marketCap,
      priceAvg50: q.priceAvg50,
      priceAvg200: q.priceAvg200,
      volume: q.volume,
      avgVolume: q.avgVolume,
      exchange: q.exchange,
      open: q.open,
      previousClose: q.previousClose,
      eps: q.eps,
      pe: q.pe,
      sharesOutstanding: q.sharesOutstanding,
      timestamp: q.timestamp,
    }));
    save(join(DATA_DIR, "us-stocks.json"), usStocks);
    console.log(`  ${usStocks.length} stocks saved`);
    hasData = true;
  } catch (e) {
    console.error(`US stocks batch FAILED (${e.message}), trying individual...`);
    // fallback: 개별 fetch
    const usStocks = [];
    for (const sym of US_SYMBOLS) {
      try {
        const data = await fetchJson(`${BASE}/quote?symbol=${sym}&apikey=${API_KEY}`);
        const q = Array.isArray(data) ? data[0] : data;
        if (q) usStocks.push({
          symbol: q.symbol,
          name: q.name,
          price: q.price,
          changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
          change: q.change,
          dayLow: q.dayLow,
          dayHigh: q.dayHigh,
          yearHigh: q.yearHigh,
          yearLow: q.yearLow,
          marketCap: q.marketCap,
          priceAvg50: q.priceAvg50,
          priceAvg200: q.priceAvg200,
          volume: q.volume,
          avgVolume: q.avgVolume,
          exchange: q.exchange,
          open: q.open,
          previousClose: q.previousClose,
          eps: q.eps,
          pe: q.pe,
          sharesOutstanding: q.sharesOutstanding,
          timestamp: q.timestamp,
        });
        console.log(`  ${sym}: OK`);
      } catch (e2) {
        console.error(`  ${sym}: FAILED (${e2.message})`);
      }
    }
    if (usStocks.length > 0) {
      save(join(DATA_DIR, "us-stocks.json"), usStocks);
      hasData = true;
    }
  }

  // 3. Company profiles (단일 심볼만 지원)
  console.log("Fetching company profiles...");
  const profiles = {};
  for (const sym of US_SYMBOLS) {
    try {
      const data = await fetchJson(`${BASE}/profile?symbol=${sym}&apikey=${API_KEY}`);
      const p = Array.isArray(data) ? data[0] : data;
      if (p) {
        profiles[p.symbol] = {
          symbol: p.symbol,
          name: p.companyName,
          companyName: p.companyName,
          price: p.price,
          change: p.changes ?? p.change ?? 0,
          changesPercentage: parseFloat(p.changePercentage ?? p.changesPercentage) || 0,
          marketCap: p.marketCap ?? p.mktCap,
          pe: p.pe || 0,
          pbr: p.pb || 0,
          dividend: p.lastDividend ?? p.lastDiv ?? 0,
          sector: p.sector,
          industry: p.industry,
          ceo: p.ceo ?? p.CEO ?? "",
          description: p.description,
          exchange: p.exchangeShortName ?? p.exchange,
          website: p.website,
          image: p.image,
          dayLow: p.dayLow ?? 0,
          dayHigh: p.dayHigh ?? 0,
          yearHigh: p.yearHigh ?? (p.range ? parseFloat(p.range.split("-")[1]) : 0),
          yearLow: p.yearLow ?? (p.range ? parseFloat(p.range.split("-")[0]) : 0),
          priceAvg50: p.priceAvg50 ?? 0,
          priceAvg200: p.priceAvg200 ?? 0,
          volume: p.volume ?? p.volAvg ?? 0,
          avgVolume: p.averageVolume ?? p.volAvg ?? 0,
          open: p.open ?? 0,
          previousClose: p.previousClose ?? 0,
          eps: p.eps ?? 0,
          sharesOutstanding: p.sharesOutstanding ?? 0,
          timestamp: p.timestamp ?? 0,
        };
        console.log(`  ${sym}: OK`);
      }
    } catch (e) {
      console.error(`  ${sym}: FAILED (${e.message})`);
    }
  }
  if (Object.keys(profiles).length > 0) {
    save(join(DATA_DIR, "profiles.json"), profiles);
    hasData = true;
  }

  // 4. Historical prices (1 year) — historical-price-eod-full
  console.log("Fetching historical prices...");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const fromDate = oneYearAgo.toISOString().split("T")[0];

  for (const symbol of US_SYMBOLS) {
    try {
      const hist = await fetchJson(
        `${BASE}/historical-price-eod-full?symbol=${symbol}&from=${fromDate}&apikey=${API_KEY}`
      );
      // 응답이 배열이면 { symbol, historical } 형태로 감싸기
      const output = Array.isArray(hist)
        ? { symbol, historical: hist.map((d) => ({ date: d.date, close: d.close })) }
        : { symbol: hist.symbol || symbol, historical: (hist.historical || []).map((d) => ({ date: d.date, close: d.close })) };
      save(join(HIST_DIR, `${symbol}.json`), output);
      console.log(`  ${symbol}: ${output.historical.length} days`);
    } catch (e) {
      console.error(`  ${symbol}: FAILED (${e.message})`);
    }
  }

  if (!hasData) {
    console.error("No data was fetched. Check API key and plan limits.");
    process.exit(1);
  }

  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
