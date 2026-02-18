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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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

// 한국 주식 심볼 (KOSPI 30 + KOSDAQ 15)
const KR_KOSPI_SYMBOLS = [
  "005930.KS","000660.KS","373220.KS","207940.KS","005380.KS",
  "000270.KS","005490.KS","068270.KS","105560.KS","035420.KS",
  "055550.KS","051910.KS","006400.KS","086790.KS","012330.KS",
  "035720.KS","138040.KS","316140.KS","015760.KS","096770.KS",
  "028260.KS","066570.KS","017670.KS","012450.KS","003670.KS",
  "033780.KS","034020.KS","032830.KS","010130.KS","011200.KS",
];

const KR_KOSDAQ_SYMBOLS = [
  "247540.KQ","086520.KQ","066970.KQ","028300.KQ","196170.KQ",
  "068760.KQ","058470.KQ","034230.KQ","293490.KQ","263750.KQ",
  "035760.KQ","253450.KQ","035900.KQ","112040.KQ","108860.KQ",
];

// 인덱스 이름 매핑 (FMP에서 한국어 이름이 안 올 수 있으므로)
const INDEX_NAMES = {
  "^GSPC": "S&P 500",
  "^IXIC": "나스닥",
  "^DJI": "다우존스",
  "^KS11": "코스피",
  "^KQ11": "코스닥",
};

async function main() {
  mkdirSync(HIST_DIR, { recursive: true });
  let hasData = false;

  // 1. Market indexes + forex + commodities
  console.log("Fetching market indexes...");
  const indexes = [];
  const extras = [];

  for (const sym of ["^GSPC", "^IXIC", "^DJI", "^KS11", "^KQ11"]) {
    try {
      const data = await fetchJson(`${BASE}/quote?symbol=${encodeURIComponent(sym)}&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q) indexes.push({
        symbol: q.symbol,
        name: INDEX_NAMES[sym] || q.name || q.symbol,
        price: q.price,
        changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
        change: q.change,
      });
      console.log(`  Index ${sym}: OK`);
    } catch (e) {
      console.warn(`  Index ${sym}: SKIP (${e.message})`);
    }
    await delay(200);
  }

  // Forex
  for (const [sym, pair, name] of [["USDKRW", "USD/KRW", "달러/원"], ["USDJPY", "USD/JPY", "달러/엔"]]) {
    try {
      const data = await fetchJson(`${BASE}/quote?symbol=${sym}&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q) extras.push({
        pair,
        name,
        rate: q.price,
        change: q.change,
        changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
      });
      console.log(`  Forex ${sym}: OK`);
    } catch (e) {
      console.warn(`  Forex ${sym}: SKIP (${e.message})`);
    }
    await delay(200);
  }

  // Commodities
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
    await delay(200);
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
      await delay(200);
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
    await delay(200);
  }
  if (Object.keys(profiles).length > 0) {
    save(join(DATA_DIR, "profiles.json"), profiles);
    hasData = true;
  }

  // 4. Historical prices (1 year)
  console.log("Fetching historical prices...");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const fromDate = oneYearAgo.toISOString().split("T")[0];

  for (const symbol of US_SYMBOLS) {
    try {
      const hist = await fetchJson(
        `${BASE}/historical-price-eod/full?symbol=${symbol}&from=${fromDate}&apikey=${API_KEY}`
      );
      const output = Array.isArray(hist)
        ? { symbol, historical: hist.map((d) => ({ date: d.date, close: d.close })) }
        : { symbol: hist.symbol || symbol, historical: (hist.historical || []).map((d) => ({ date: d.date, close: d.close })) };
      save(join(HIST_DIR, `${symbol}.json`), output);
      console.log(`  ${symbol}: ${output.historical.length} days`);
    } catch (e) {
      console.error(`  ${symbol}: FAILED (${e.message})`);
    }
    await delay(200);
  }

  // 5. Buffett 13F 데이터 (Berkshire Hathaway CIK: 0001067983)
  console.log("Fetching Buffett 13F holdings...");
  try {
    const data = await fetchJson(
      `${BASE}/institutional-ownership/extract?cik=0001067983&apikey=${API_KEY}`
    );
    const holdings = Array.isArray(data) ? data : [];
    if (holdings.length > 0) {
      const mapped = holdings.map((h) => ({
        date: h.date || h.reportDate || "",
        filingDate: h.filingDate || "",
        cik: h.cik || "0001067983",
        symbol: h.symbol || h.ticker || "",
        nameOfIssuer: h.nameOfIssuer || h.securityName || h.companyName || "",
        shares: h.shares || h.sharesNumber || 0,
        titleOfClass: h.titleOfClass || h.securityType || "COM",
        value: h.value || h.marketValue || 0,
        weight: h.weight || h.portfolioPercent || 0,
        lastWeight: h.lastWeight || h.previousWeight || 0,
        changeInWeight: h.changeInWeight || 0,
        changeInWeightPercentage: h.changeInWeightPercentage || 0,
        sharesNumber: h.sharesNumber || h.shares || 0,
        lastSharesNumber: h.lastSharesNumber || h.previousShares || 0,
        changeInSharesNumber: h.changeInSharesNumber || 0,
        changeInSharesNumberPercentage: h.changeInSharesNumberPercentage || 0,
        isNew: h.isNew || false,
        isSoldOut: h.isSoldOut || false,
      }));
      save(join(DATA_DIR, "guru-buffett.json"), mapped);
      console.log(`  Buffett: ${mapped.length} holdings saved`);
      hasData = true;
    } else {
      console.warn("  Buffett: No holdings data returned");
    }
  } catch (e) {
    console.warn(`  Buffett 13F: SKIP (${e.message})`);
  }

  // 6. Pelosi 의회 거래 데이터
  console.log("Fetching Pelosi house trades...");
  try {
    const data = await fetchJson(
      `${BASE}/house-trades-by-name?name=Nancy+Pelosi&apikey=${API_KEY}`
    );
    const trades = Array.isArray(data) ? data : [];
    if (trades.length > 0) {
      const mapped = trades.map((t) => ({
        symbol: t.symbol || t.ticker || "",
        disclosureDate: t.disclosureDate || "",
        transactionDate: t.transactionDate || "",
        firstName: t.firstName || "Nancy",
        lastName: t.lastName || "Pelosi",
        office: t.office || "House",
        owner: t.owner || "",
        type: t.type || t.transactionType || "",
        amount: t.amount || "",
        link: t.link || t.ptrLink || "",
      }));
      save(join(DATA_DIR, "guru-pelosi.json"), mapped);
      console.log(`  Pelosi: ${mapped.length} trades saved`);
      hasData = true;
    } else {
      console.warn("  Pelosi: No trades data returned");
    }
  } catch (e) {
    console.warn(`  Pelosi trades: SKIP (${e.message})`);
  }

  // 7. 한국 주식 데이터
  console.log("Fetching Korean stocks...");
  const krStocks = [];
  const allKrSymbols = [...KR_KOSPI_SYMBOLS, ...KR_KOSDAQ_SYMBOLS];

  for (const fmpSymbol of allKrSymbols) {
    try {
      const data = await fetchJson(`${BASE}/quote?symbol=${encodeURIComponent(fmpSymbol)}&apikey=${API_KEY}`);
      const q = Array.isArray(data) ? data[0] : data;
      if (q && q.price) {
        // 심볼에서 .KS/.KQ 제거, exchange 결정
        const cleanSymbol = fmpSymbol.replace(/\.(KS|KQ)$/, "");
        const exchange = fmpSymbol.endsWith(".KS") ? "KOSPI" : "KOSDAQ";
        krStocks.push({
          symbol: cleanSymbol,
          name: q.name || cleanSymbol,
          price: q.price,
          changesPercentage: q.changePercentage ?? q.changesPercentage ?? 0,
          change: q.change ?? 0,
          dayLow: q.dayLow ?? 0,
          dayHigh: q.dayHigh ?? 0,
          yearHigh: q.yearHigh ?? 0,
          yearLow: q.yearLow ?? 0,
          marketCap: q.marketCap ?? 0,
          priceAvg50: q.priceAvg50 ?? 0,
          priceAvg200: q.priceAvg200 ?? 0,
          volume: q.volume ?? 0,
          avgVolume: q.avgVolume ?? 0,
          exchange,
          open: q.open ?? 0,
          previousClose: q.previousClose ?? 0,
          eps: q.eps ?? 0,
          pe: q.pe ?? 0,
          sharesOutstanding: q.sharesOutstanding ?? 0,
          timestamp: q.timestamp ?? 0,
        });
        console.log(`  ${fmpSymbol}: OK`);
      }
    } catch (e) {
      console.warn(`  ${fmpSymbol}: SKIP (${e.message})`);
    }
    await delay(300);
  }

  if (krStocks.length > 0) {
    save(join(DATA_DIR, "kr-stocks.json"), krStocks);
    console.log(`  ${krStocks.length} Korean stocks saved`);
    hasData = true;
  } else {
    console.warn("  Korean stocks: No data fetched (FMP may not support .KS/.KQ symbols)");
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
