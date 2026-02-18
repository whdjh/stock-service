# 차트 + FMP API 연동 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** mock 데이터를 GitHub Actions + FMP API로 전환하고, 주가 라인 차트와 포트폴리오 파이 차트를 추가한다.

**Architecture:** GitHub Actions cron이 FMP API 데이터를 `public/data/*.json`으로 저장. SPA는 정적 JSON을 fetch. API 키는 GitHub Secrets. 한국 주식/고수 포트폴리오는 정적 데이터 유지.

**Tech Stack:** lightweight-charts, recharts, GitHub Actions

---

## Task 1: 의존성 설치 및 데이터 디렉토리 구조

**Files:**
- Modify: `package.json`
- Create: `public/data/.gitkeep`

**Step 1: 차트 라이브러리 설치**

```bash
pnpm add lightweight-charts recharts
```

**Step 2: 데이터 디렉토리 생성**

```bash
mkdir -p public/data/historical
```

**Step 3: 커밋**

```bash
git add -A
git commit -m "chore: lightweight-charts, recharts 설치 및 데이터 디렉토리 생성"
```

---

## Task 2: mock 데이터를 정적 JSON으로 분리

현재 `src/data/mock.ts` (3000+ 라인)에서 API로 전환할 데이터를 `public/data/`로 분리한다. mock.ts에는 한국 주식, 고수, 섹터 등 정적 데이터만 남긴다.

**Files:**
- Create: `scripts/seed-data.ts` (mock에서 JSON 추출하는 1회성 스크립트)
- Create: `public/data/market-indexes.json`
- Create: `public/data/us-stocks.json`
- Create: `public/data/profiles.json`
- Modify: `src/data/mock.ts` (미국 주식/프로필/지수 데이터 제거, 정적 데이터만 유지)

**Step 1: mock 데이터에서 JSON 파일 생성**

`public/data/market-indexes.json` — 현재 `marketIndexes` + `sidebarExtras` 합쳐서 저장:

```json
{
  "indexes": [...marketIndexes 배열],
  "extras": [...sidebarExtras 배열]
}
```

`public/data/us-stocks.json` — 현재 `usStocks` 배열 그대로.

`public/data/profiles.json` — 현재 `companyProfiles` 객체 그대로.

각 JSON 파일은 mock.ts의 현재 데이터를 그대로 복사해서 생성한다.

**Step 2: `src/data/mock.ts` 정리**

미국 주식 시세(`usStocks`), 회사 프로필(`companyProfiles`), 시장 지수(`marketIndexes`), 환율(`sidebarExtras`) 내보내기를 제거한다. 대신 이들은 JSON에서 로드할 것이다.

남겨둘 것: `gurus`, `guruDetails`, `krStocks`, `kosdaqStocks`, `usSectors`, `krSectors`, `getGuruById` 함수.

`getCompanyProfile`, `getStockBySymbol` 함수도 제거 (hooks로 대체).

**Step 3: 커밋**

```bash
git add -A
git commit -m "chore: mock 데이터를 정적 JSON으로 분리"
```

---

## Task 3: 데이터 로딩 hooks 생성

`public/data/*.json`에서 데이터를 fetch하는 커스텀 hooks.

**Files:**
- Create: `src/hooks/useJsonData.ts`

**Step 1: 범용 JSON 로더 hook 생성**

```tsx
import { useState, useEffect } from "react";

interface UseJsonDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useJsonData<T>(path: string): UseJsonDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${path}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [path]);

  return { data, loading, error };
}
```

**Step 2: 커밋**

```bash
git add src/hooks/useJsonData.ts
git commit -m "feat: 정적 JSON 로딩 hook 추가"
```

---

## Task 4: Sidebar를 JSON 데이터로 전환

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: mock import를 useJsonData로 교체**

```tsx
import { useJsonData } from "@/hooks/useJsonData";
import { MarketIndex, ExchangeRate } from "@/types";
import Badge from "@/components/ui/Badge";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MarketData {
  indexes: MarketIndex[];
  extras: ExchangeRate[];
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { data, loading } = useJsonData<MarketData>("/data/market-indexes.json");

  if (loading || !data) {
    return (
      <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
        <div className="bg-surface rounded-3xl p-5 shadow-plastic">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-32" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
      <div className="bg-surface rounded-3xl p-5 shadow-plastic">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              {t("sidebar.title")}
            </h2>
          </div>
          <LocaleSwitcher />
        </div>
        <div className="space-y-3">
          {data.indexes.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{index.name}</p>
                <p className="text-xs text-muted">{index.price.toLocaleString()}</p>
              </div>
              <Badge value={index.changesPercentage} />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-3">
            {data.extras.map((item) => (
              <div key={item.pair} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted">{item.rate.toLocaleString()}</p>
                </div>
                <Badge value={item.changesPercentage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Step 2: 커밋**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: Sidebar를 정적 JSON 데이터로 전환"
```

---

## Task 5: HomePage를 JSON 데이터로 전환

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Step 1: usStocks를 JSON에서 로드, 나머지(한국주식, 고수, 섹터)는 mock 유지**

```tsx
import { gurus, krStocks, kosdaqStocks, usSectors, krSectors } from "@/data/mock";
import { useJsonData } from "@/hooks/useJsonData";
import { StockQuote } from "@/types";
// ... 나머지 import 동일

export default function HomePage() {
  const { t } = useTranslation();
  const { data: usStocks, loading } = useJsonData<StockQuote[]>("/data/us-stocks.json");

  if (loading || !usStocks) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-40 h-24 bg-gray-200 rounded-3xl" />
            ))}
          </div>
          <div className="h-6 bg-gray-200 rounded w-40 mt-8" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    // 기존 JSX 동일, usStocks 변수만 JSON에서 로드된 것으로 교체
  );
}
```

**Step 2: 커밋**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: HomePage 미국 주식을 JSON 데이터로 전환"
```

---

## Task 6: StockDetailPage를 JSON 데이터로 전환

**Files:**
- Modify: `src/pages/StockDetailPage.tsx`

**Step 1: profiles.json에서 프로필 로드**

`getCompanyProfile(ticker)` 대신 `useJsonData`로 profiles.json 전체를 로드하고 ticker로 필터링.

```tsx
import { useJsonData } from "@/hooks/useJsonData";
import { CompanyProfile } from "@/types";
// guruDetails, gurus는 mock에서 계속 import

const { data: profiles, loading } = useJsonData<Record<string, CompanyProfile>>("/data/profiles.json");
const profile = profiles?.[ticker ?? ""];
```

로딩 상태와 프로필 없을 때 처리 추가.

**Step 2: 커밋**

```bash
git add src/pages/StockDetailPage.tsx
git commit -m "feat: StockDetailPage를 JSON 데이터로 전환"
```

---

## Task 7: 주가 라인 차트 컴포넌트

**Files:**
- Create: `src/components/stock/StockPriceChart.tsx`
- Modify: `src/pages/StockDetailPage.tsx`

**Step 1: StockPriceChart 컴포넌트 생성**

TradingView Lightweight Charts를 사용한 에리어 차트. 기간 필터(1M, 3M, 6M, 1Y) 포함.

```tsx
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { useJsonData } from "@/hooks/useJsonData";

interface HistoricalPrice {
  date: string;
  close: number;
}

interface HistoricalResponse {
  symbol: string;
  historical: HistoricalPrice[];
}

type Period = "1M" | "3M" | "6M" | "1Y";

interface StockPriceChartProps {
  symbol: string;
}

function filterByPeriod(data: HistoricalPrice[], period: Period): HistoricalPrice[] {
  const now = new Date();
  const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months[period]);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return data.filter((d) => d.date >= cutoffStr);
}

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [period, setPeriod] = useState<Period>("1Y");
  const { data, loading } = useJsonData<HistoricalResponse>(`/data/historical/${symbol}.json`);

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: { background: { color: "transparent" }, textColor: "#8B95A1" },
        grid: { vertLines: { visible: false }, horzLines: { color: "#F2F4F6" } },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        timeScale: { borderVisible: false },
        rightPriceScale: { borderVisible: false },
      });
      seriesRef.current = chartRef.current.addSeries(AreaSeries, {
        lineColor: "#191F28",
        topColor: "rgba(25, 31, 40, 0.2)",
        bottomColor: "rgba(25, 31, 40, 0)",
        lineWidth: 2,
      });
    }

    const filtered = filterByPeriod(data.historical, period).reverse();
    seriesRef.current?.setData(
      filtered.map((d) => ({ time: d.date, value: d.close }))
    );
    chartRef.current?.timeScale().fitContent();

    return () => {};
  }, [data, period]);

  // resize observer
  useEffect(() => {
    if (!chartContainerRef.current || !chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chartRef.current?.applyOptions({ width });
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, [data]);

  if (loading) {
    return <div className="bg-surface rounded-3xl p-6 shadow-plastic h-[380px] animate-pulse" />;
  }

  if (!data) return null;

  const periods: Period[] = ["1M", "3M", "6M", "1Y"];

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-plastic">
      <div className="flex gap-2 mb-4">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              p === period
                ? "bg-foreground text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
```

**Step 2: StockDetailPage에 차트 추가**

StockMetrics 위에 `<StockPriceChart symbol={ticker} />` 추가.

**Step 3: 차트용 seed 데이터 생성**

AAPL의 mock 히스토리컬 데이터를 `public/data/historical/AAPL.json`에 생성. 나머지 심볼은 GitHub Actions가 채움.

**Step 4: 커밋**

```bash
git add -A
git commit -m "feat: TradingView 주가 라인 차트 추가"
```

---

## Task 8: 포트폴리오 파이 차트 컴포넌트

**Files:**
- Create: `src/components/guru/PortfolioPieChart.tsx`
- Modify: `src/pages/GuruDetailPage.tsx`

**Step 1: PortfolioPieChart 컴포넌트 생성**

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { InstitutionalHolding } from "@/types";

const COLORS = ["#191F28", "#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB"];

interface PortfolioPieChartProps {
  holdings: InstitutionalHolding[];
}

export default function PortfolioPieChart({ holdings }: PortfolioPieChartProps) {
  const top5 = [...holdings].sort((a, b) => b.weight - a.weight).slice(0, 5);
  const othersWeight = 100 - top5.reduce((sum, h) => sum + h.weight, 0);

  const chartData = [
    ...top5.map((h) => ({ name: h.symbol, value: h.weight })),
    ...(othersWeight > 0 ? [{ name: "기타", value: othersWeight }] : []),
  ];

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-plastic">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-foreground font-medium flex-1">{item.name}</span>
              <span className="text-sm text-muted">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: GuruDetailPage에 차트 추가**

Top Holdings 섹션 위에 `<PortfolioPieChart holdings={guru.holdings} />` 추가.

**Step 3: 커밋**

```bash
git add -A
git commit -m "feat: 포트폴리오 파이 차트 추가"
```

---

## Task 9: FMP 데이터 fetch 스크립트

GitHub Actions에서 실행할 Node.js 스크립트.

**Files:**
- Create: `scripts/fetch-fmp-data.mjs`

**Step 1: fetch 스크립트 생성**

```javascript
// scripts/fetch-fmp-data.mjs
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
      companyName: p.companyName,
      price: p.price,
      change: p.changes,
      changesPercentage: p.changesPercentage || 0,
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
      name: p.companyName,
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
```

**Step 2: 커밋**

```bash
git add scripts/fetch-fmp-data.mjs
git commit -m "feat: FMP API 데이터 fetch 스크립트 추가"
```

---

## Task 10: GitHub Actions 워크플로우

**Files:**
- Create: `.github/workflows/fetch-market-data.yml`

**Step 1: 워크플로우 파일 생성**

```yaml
name: Fetch Market Data

on:
  schedule:
    # 미국 장 마감 후 (EST 16:30 = UTC 21:30), 평일만
    - cron: "30 21 * * 1-5"
  workflow_dispatch: # 수동 실행 가능

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Fetch FMP data
        env:
          FMP_API_KEY: ${{ secrets.FMP_API_KEY }}
        run: node scripts/fetch-fmp-data.mjs

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/
          git diff --staged --quiet || git commit -m "chore: 시장 데이터 자동 업데이트 $(date -u +%Y-%m-%d)"
          git push
```

**Step 2: `.gitignore`에서 `public/data/` 제외 확인**

`public/data/` 가 gitignore에 없는지 확인. 없어야 JSON 파일이 커밋됨.

**Step 3: 커밋**

```bash
git add .github/workflows/fetch-market-data.yml
git commit -m "feat: GitHub Actions 시장 데이터 자동 fetch 워크플로우 추가"
```

---

## Task 11: mock.ts 정리 및 빌드 검증

**Files:**
- Modify: `src/data/mock.ts` (더 이상 사용하지 않는 내보내기 정리)

**Step 1: mock.ts에서 API로 대체된 데이터 제거**

- `marketIndexes` 배열 제거
- `sidebarExtras` 배열 제거
- `usStocks` 배열 제거
- `companyProfiles` 객체 제거
- `getCompanyProfile()` 함수 제거
- `getStockBySymbol()` 함수 제거

남기는 것: `gurus`, `guruDetails`, `krStocks`, `kosdaqStocks`, `usSectors`, `krSectors`, `getGuruById()`

**Step 2: 빌드 검증**

```bash
pnpm build
```

**Step 3: 커밋**

```bash
git add -A
git commit -m "chore: API로 대체된 mock 데이터 정리 및 빌드 검증"
```

---

## Task 12: 최종 검증

**검증 항목:**
- [ ] `pnpm build` 성공
- [ ] 홈 로드 시 스켈레톤 → 데이터 표시
- [ ] 종목 상세 → 차트 렌더링 (seed 데이터)
- [ ] 고수 상세 → 파이 차트 렌더링
- [ ] 사이드바 데이터 표시
- [ ] 한국 주식/섹터 정상 동작 (mock 데이터)

**필요 사항 안내:**
1. FMP API 키 발급: https://site.financialmodelingprep.com/register
2. GitHub Secrets에 `FMP_API_KEY` 추가
3. 첫 실행: Actions 탭에서 "Fetch Market Data" 워크플로우 수동 실행
