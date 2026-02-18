// scripts/fetch-fmp-data.mjs
// GitHub Actions에서 실행: FMP API 데이터를 public/data/*.json으로 저장
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
const HIST_DIR = join(DATA_DIR, "historical");
const API_KEY = process.env.FMP_API_KEY;
const BASE = "https://financialmodelingprep.com/api/v3";

if (!API_KEY) {
  console.error("FMP_API_KEY environment variable is required");
  process.exit(1);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function save(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filePath}`);
}

// US Top 30 symbols
const US_SYMBOLS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","BRK-B","TSLA","UNH","LLY",
  "JPM","XOM","V","JNJ","PG","MA","AVGO","HD","MRK","COST",
  "ABBV","PEP","KO","ADBE","CRM","WMT","BAC","NFLX","TMO","AMD",
];

const INDEX_SYMBOLS = "^IXIC,^NYA,^KS11,^KQ11,^GSPC";
const FX_SYMBOLS = "USDKRW";
const COMMODITY_SYMBOLS = "GCUSD,SIUSD";

async function main() {
  mkdirSync(HIST_DIR, { recursive: true });

  // 1. Market indexes + forex + commodities
  console.log("Fetching market indexes...");
  const allQuoteSymbols = `${INDEX_SYMBOLS},${FX_SYMBOLS},${COMMODITY_SYMBOLS}`;
  const indexQuotes = await fetchJson(`${BASE}/quote/${allQuoteSymbols}?apikey=${API_KEY}`);

  const indexes = indexQuotes
    .filter((q) => q.symbol.startsWith("^"))
    .map((q) => ({
      symbol: q.symbol,
      name: q.name || q.symbol,
      price: q.price,
      changesPercentage: q.changesPercentage,
      change: q.change,
    }));

  const extras = indexQuotes
    .filter((q) => !q.symbol.startsWith("^"))
    .map((q) => ({
      pair: q.symbol,
      name: q.name || q.symbol,
      rate: q.price,
      change: q.change,
      changesPercentage: q.changesPercentage,
    }));

  save(join(DATA_DIR, "market-indexes.json"), { indexes, extras });

  // 2. US stock quotes
  console.log("Fetching US stock quotes...");
  const usQuotes = await fetchJson(`${BASE}/quote/${US_SYMBOLS.join(",")}?apikey=${API_KEY}`);
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

  // 3. Company profiles
  console.log("Fetching company profiles...");
  const profilesArr = await fetchJson(`${BASE}/profile/${US_SYMBOLS.join(",")}?apikey=${API_KEY}`);
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

  // 4. Historical prices (1 year)
  console.log("Fetching historical prices...");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const fromDate = oneYearAgo.toISOString().split("T")[0];

  for (const symbol of US_SYMBOLS) {
    try {
      const hist = await fetchJson(
        `${BASE}/historical-price-full/${symbol}?from=${fromDate}&apikey=${API_KEY}`
      );
      save(join(HIST_DIR, `${symbol}.json`), hist);
      console.log(`  ${symbol}: ${hist.historical?.length || 0} days`);
    } catch (e) {
      console.error(`  ${symbol}: FAILED - ${e.message}`);
    }
  }

  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
