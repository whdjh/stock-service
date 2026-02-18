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
  try {
    const indexes = [];
    const extras = [];

    for (const sym of ["^GSPC", "^IXIC", "^NYA", "^KS11", "^KQ11"]) {
      try {
        const data = await fetchJson(`${BASE}/quote?symbol=${encodeURIComponent(sym)}&apikey=${API_KEY}`);
        const q = Array.isArray(data) ? data[0] : data;
        if (q) indexes.push({ symbol: q.symbol, name: q.name || q.symbol, price: q.price, changesPercentage: q.changesPercentage, change: q.change });
        console.log(`  Index ${sym}: OK`);
      } catch (e) {
        console.warn(`  Index ${sym}: SKIP (${e.message})`);
      }
    }

    try {
      const data = await fetchJson(`${BASE}/quote?symbol=USDKRW&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q) extras.push({ pair: "USD/KRW", name: "달러/원", rate: q.price, change: q.change, changesPercentage: q.changesPercentage });
      console.log("  Forex USDKRW: OK");
    } catch (e) {
      console.warn(`  Forex USDKRW: SKIP (${e.message})`);
    }

    for (const [sym, name] of [["GCUSD", "금 (oz)"], ["SIUSD", "은 (oz)"]]) {
      try {
        const data = await fetchJson(`${BASE}/quote?symbol=${sym}&apikey=${API_KEY}`);
        const q = Array.isArray(data) ? data[0] : data;
        if (q) extras.push({ pair: q.symbol, name, rate: q.price, change: q.change, changesPercentage: q.changesPercentage });
        console.log(`  Commodity ${sym}: OK`);
      } catch (e) {
        console.warn(`  Commodity ${sym}: SKIP (${e.message})`);
      }
    }

    if (indexes.length > 0 || extras.length > 0) {
      save(join(DATA_DIR, "market-indexes.json"), { indexes, extras });
      hasData = true;
    }
  } catch (e) {
    console.warn(`Market indexes failed: ${e.message}`);
  }

  // 2. US stock quotes
  console.log("Fetching US stock quotes...");
  try {
    const data = await fetchJson(`${BASE}/quote?symbol=${US_SYMBOLS.join(",")}&apikey=${API_KEY}`);
    const usQuotes = Array.isArray(data) ? data : [data];
    const usStocks = usQuotes.map((q) => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      changesPercentage: q.changesPercentage,
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
    hasData = true;
  } catch (e) {
    console.error(`US stocks FAILED: ${e.message}`);
  }

  // 3. Company profiles
  console.log("Fetching company profiles...");
  try {
    const data = await fetchJson(`${BASE}/profile?symbol=${US_SYMBOLS.join(",")}&apikey=${API_KEY}`);
    const profilesArr = Array.isArray(data) ? data : [data];
    const profiles = {};
    for (const p of profilesArr) {
      profiles[p.symbol] = {
        symbol: p.symbol,
        name: p.companyName,
        companyName: p.companyName,
        price: p.price,
        change: p.changes,
        changesPercentage: parseFloat(p.changesPercentage) || 0,
        marketCap: p.mktCap,
        pe: p.pe || 0,
        pbr: p.pb || 0,
        dividend: p.lastDiv || 0,
        sector: p.sector,
        industry: p.industry,
        ceo: p.ceo,
        description: p.description,
        exchange: p.exchangeShortName,
        website: p.website,
        image: p.image,
        dayLow: 0,
        dayHigh: 0,
        yearHigh: p.range ? parseFloat(p.range.split("-")[1]) : 0,
        yearLow: p.range ? parseFloat(p.range.split("-")[0]) : 0,
        priceAvg50: 0,
        priceAvg200: 0,
        volume: p.volAvg,
        avgVolume: p.volAvg,
        open: 0,
        previousClose: 0,
        eps: 0,
        sharesOutstanding: 0,
        timestamp: 0,
      };
    }
    save(join(DATA_DIR, "profiles.json"), profiles);
    hasData = true;
  } catch (e) {
    console.error(`Profiles FAILED: ${e.message}`);
  }

  // 4. Historical prices (1 year)
  console.log("Fetching historical prices...");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const fromDate = oneYearAgo.toISOString().split("T")[0];

  for (const symbol of US_SYMBOLS) {
    try {
      const hist = await fetchJson(
        `${BASE}/historical-price-full?symbol=${symbol}&from=${fromDate}&apikey=${API_KEY}`
      );
      save(join(HIST_DIR, `${symbol}.json`), hist);
      const count = Array.isArray(hist) ? hist.length : hist.historical?.length || 0;
      console.log(`  ${symbol}: ${count} days`);
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
