# Next.js → Vite + React 마이그레이션 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.js 프로젝트를 Vite + React SPA로 마이그레이션하여 Netlify 정적 배포에 최적화

**Architecture:** 새 Vite 프로젝트를 동일 레포에 구성하고, 기존 컴포넌트/데이터/타입을 이식. React Router v7로 라우팅, react-i18next로 다국어, localStorage로 locale 저장.

**Tech Stack:** Vite 6, React 18, TypeScript, React Router v7, react-i18next, Tailwind CSS 3, lucide-react, pnpm

---

## Task 1: Vite 프로젝트 스캐폴딩

**Files:**
- Delete: `next.config.mjs`, `src/app/` (전체), `src/i18n/request.ts`
- Create: `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`
- Modify: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`

**Step 1: Next.js 의존성 제거 및 Vite 의존성 설치**

```bash
pnpm remove next next-intl eslint-config-next
pnpm add react-router-dom i18next react-i18next
pnpm add -D vite @vitejs/plugin-react @types/node
```

**Step 2: `index.html` 생성 (프로젝트 루트)**

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Service</title>
    <link rel="preload" href="/src/app/fonts/GeistVF.woff" as="font" type="font/woff" crossorigin />
    <style>
      @font-face {
        font-family: 'Geist';
        src: url('/src/app/fonts/GeistVF.woff') format('woff');
        font-weight: 100 900;
        font-display: swap;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 3: `vite.config.ts` 생성**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 4: `src/main.tsx` 생성**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app/globals.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**Step 5: `src/App.tsx` 생성 (기존 layout.tsx 대체)**

```tsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import HomePage from "@/pages/HomePage";
import StockDetailPage from "@/pages/StockDetailPage";
import GuruDetailPage from "@/pages/GuruDetailPage";

export default function App() {
  return (
    <div className="font-[Geist] antialiased bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stock/:ticker" element={<StockDetailPage />} />
              <Route path="/guru/:id" element={<GuruDetailPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
```

**Step 6: `tsconfig.json` 수정**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 7: `package.json` scripts 수정**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

**Step 8: `tailwind.config.ts` content 경로 수정**

`content` 배열에서 `./src/app/**` 경로는 유지하되(globals.css 참조), `./src/pages/**` 추가:

```typescript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

**Step 9: `postcss.config.mjs` 수정**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 10: `.eslintrc.json` 수정**

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh"],
  "rules": {
    "react-refresh/only-export-components": "warn"
  }
}
```

ESLint 플러그인 추가:
```bash
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh
```

**Step 11: Next.js 전용 파일 삭제**

```bash
rm next.config.mjs src/i18n/request.ts
```

**Step 12: 커밋**

```bash
git add -A
git commit -m "chore: Next.js 제거 및 Vite 프로젝트 스캐폴딩"
```

---

## Task 2: i18n 설정 (react-i18next)

**Files:**
- Create: `src/i18n/index.ts`
- Move: `src/dictionaries/ko.json` → `src/i18n/ko.json`, `src/dictionaries/en.json` → `src/i18n/en.json`
- Delete: `src/dictionaries/` 폴더

**Step 1: `src/i18n/index.ts` 생성**

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./ko.json";
import en from "./en.json";

const savedLocale = localStorage.getItem("locale") || "ko";

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: savedLocale,
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

**Step 2: 딕셔너리 파일 이동**

```bash
mv src/dictionaries/ko.json src/i18n/ko.json
mv src/dictionaries/en.json src/i18n/en.json
rm -rf src/dictionaries
```

**Step 3: 커밋**

```bash
git add -A
git commit -m "feat: react-i18next 기반 i18n 설정 (localStorage 저장)"
```

---

## Task 3: UI 컴포넌트 이식 (Button, Card, Badge, Tooltip)

**Files:**
- Modify: `src/components/ui/Card.tsx`, `src/components/ui/Tooltip.tsx`
- No change: `src/components/ui/Badge.tsx`, `src/components/ui/Button.tsx` (Next.js 의존성 없음)

**Step 1: `Card.tsx` — 변경 불필요** (Next.js 의존성 없음, 그대로 사용)

**Step 2: `Badge.tsx` — 변경 불필요**

**Step 3: `Button.tsx` — 변경 불필요**

**Step 4: `Tooltip.tsx` — `"use client"` 디렉티브만 제거**

`src/components/ui/Tooltip.tsx` 1행의 `"use client";` 삭제.

**Step 5: 커밋**

```bash
git add -A
git commit -m "chore: UI 컴포넌트에서 Next.js 디렉티브 제거"
```

---

## Task 4: Layout 컴포넌트 이식 (Sidebar, LocaleSwitcher)

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`, `src/components/layout/LocaleSwitcher.tsx`

**Step 1: `LocaleSwitcher.tsx` 수정**

기존 (next-intl + cookie):
```tsx
"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
```

변경 후 (react-i18next + localStorage):
```tsx
import { useTranslation } from "react-i18next";

const locales = ["ko", "en"] as const;

export default function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  function switchLocale(locale: string) {
    localStorage.setItem("locale", locale);
    i18n.changeLanguage(locale);
  }

  return (
    <div className="flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`w-16 py-1 rounded-lg text-xs font-medium text-center transition-colors ${
            locale === current
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          {locale === "ko" ? "한국어" : "English"}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: `Sidebar.tsx` 수정**

기존 (server component + next-intl):
```tsx
import { getTranslations } from "next-intl/server";
export default async function Sidebar() {
  const t = await getTranslations("sidebar");
```

변경 후 (일반 컴포넌트 + react-i18next):
```tsx
import { marketIndexes, sidebarExtras } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
      <div className="bg-surface rounded-3xl p-5">
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
          {marketIndexes.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{index.name}</p>
                <p className="text-xs text-muted">{index.price.toLocaleString()}</p>
              </div>
              <Badge value={index.changesPercentage} />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-3">
            {sidebarExtras.map((item) => (
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

**Step 3: 커밋**

```bash
git add -A
git commit -m "feat: Sidebar, LocaleSwitcher를 react-i18next + localStorage로 전환"
```

---

## Task 5: 도메인 컴포넌트 이식 (GuruCard, RankingList, StockMetrics, SectorCard, SectorTabs)

**Files:**
- Modify: `src/components/guru/GuruCard.tsx`, `src/components/stock/RankingList.tsx`, `src/components/stock/StockMetrics.tsx`, `src/components/sector/SectorCard.tsx`, `src/components/sector/SectorTabs.tsx`

**Step 1: `GuruCard.tsx` 수정**

변경점: `"use client"` 제거, `useRouter` → `useNavigate`

```tsx
import { useNavigate } from "react-router-dom";
import { Guru } from "@/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { User, Landmark, Building2 } from "lucide-react";

const guruIcons = {
  institutional: Building2,
  congress: Landmark,
  pension: Building2,
};

interface GuruCardProps {
  guru: Guru;
}

export default function GuruCard({ guru }: GuruCardProps) {
  const navigate = useNavigate();
  const Icon = guruIcons[guru.type] ?? User;

  return (
    <Card
      className="min-w-[160px]"
      onClick={() => navigate(`/guru/${guru.id}`)}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={24} className="text-muted" />
        </div>
        <p className="text-sm font-semibold text-foreground">{guru.name}</p>
        <Badge value={guru.returnRate} suffix="% /yr" />
      </div>
    </Card>
  );
}
```

**Step 2: `RankingList.tsx` 수정**

변경점: `"use client"` 제거, `next/link` → `react-router-dom Link`, `useTranslations` → `useTranslation`

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StockQuote } from "@/types";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";

interface RankingListProps {
  usStocks: StockQuote[];
  krStocks: StockQuote[];
  kosdaqStocks: StockQuote[];
}

export default function RankingList({
  usStocks,
  krStocks,
  kosdaqStocks,
}: RankingListProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<"us" | "kr">("us");
  const [usExchange, setUsExchange] = useState<"all" | "NASDAQ" | "NYSE">("all");
  const [krExchange, setKrExchange] = useState<"all" | "KOSPI" | "KOSDAQ">("all");

  let stocks: StockQuote[];
  let currency: string;

  if (country === "us") {
    const allUs = usStocks;
    stocks =
      usExchange === "all" ? allUs : allUs.filter((s) => s.exchange === usExchange);
    currency = "$";
  } else {
    const allKr = [...krStocks, ...kosdaqStocks].sort(
      (a, b) => b.marketCap - a.marketCap
    );
    stocks =
      krExchange === "all" ? allKr : allKr.filter((s) => s.exchange === krExchange);
    currency = "₩";
  }

  return (
    <div>
      {/* Country tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setCountry("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "us"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.us")}
        </button>
        <button
          onClick={() => setCountry("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.kr")}
        </button>
      </div>

      {/* Exchange sub-tabs */}
      <div className="flex gap-2 mb-4">
        {country === "us" ? (
          <>
            {(["all", "NASDAQ", "NYSE"] as const).map((ex) => (
              <div key={ex} className="flex items-center gap-1">
                <button
                  onClick={() => setUsExchange(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    usExchange === ex
                      ? "bg-gray-200 text-foreground"
                      : "bg-gray-50 text-muted hover:bg-gray-100"
                  }`}
                >
                  {ex === "all" ? t("common.all") : ex}
                </button>
                {ex !== "all" && <Tooltip text={t(`tooltip.exchange.${ex}`)} />}
              </div>
            ))}
          </>
        ) : (
          <>
            {(["all", "KOSPI", "KOSDAQ"] as const).map((ex) => (
              <div key={ex} className="flex items-center gap-1">
                <button
                  onClick={() => setKrExchange(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    krExchange === ex
                      ? "bg-gray-200 text-foreground"
                      : "bg-gray-50 text-muted hover:bg-gray-100"
                  }`}
                >
                  {ex === "all" ? t("common.all") : ex}
                </button>
                {ex !== "all" && <Tooltip text={t(`tooltip.exchange.${ex}`)} />}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Stock list */}
      <div className="space-y-2">
        {stocks.map((stock, i) => (
          <Link
            key={stock.symbol}
            to={`/stock/${stock.symbol}`}
            className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted w-6 text-right">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-xs text-muted">{stock.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {currency}
                {stock.price.toLocaleString()}
              </p>
              <Badge value={stock.changesPercentage} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: `StockMetrics.tsx` 수정**

변경점: `async` 제거, `getTranslations` → `useTranslation`

```tsx
import { CompanyProfile } from "@/types";
import { useTranslation } from "react-i18next";

interface StockMetricsProps {
  profile: CompanyProfile;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

export default function StockMetrics({ profile }: StockMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      label: t("stockDetail.marketCap"),
      key: "marketCap" as const,
      format: formatMarketCap,
    },
    {
      label: t("stockDetail.per"),
      key: "pe" as const,
      format: (v: number) => v.toFixed(2),
    },
    {
      label: t("stockDetail.pbr"),
      key: "pbr" as const,
      format: (v: number) => v.toFixed(2),
    },
    {
      label: t("stockDetail.dividendYield"),
      key: "dividend" as const,
      format: (v: number) => `${v.toFixed(2)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(({ label, key, format }) => (
        <div key={key} className="bg-surface rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">{label}</p>
          <p className="text-base font-semibold text-foreground">
            {format(profile[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: `SectorCard.tsx` 수정**

변경점: `next/link` → `react-router-dom Link`

```tsx
import { Link } from "react-router-dom";
import { Sector } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface SectorCardProps {
  sector: Sector;
}

export default function SectorCard({ sector }: SectorCardProps) {
  return (
    <Card>
      <Card.Header>
        <h3 className="text-base font-semibold text-foreground">{sector.name}</h3>
      </Card.Header>
      <Card.Body>
        <div className="space-y-2">
          {sector.stocks.slice(0, 5).map((stock) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              className="flex items-center justify-between py-1 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <span className="text-sm text-foreground">{stock.name}</span>
              <Badge value={stock.changesPercentage} />
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
```

**Step 5: `SectorTabs.tsx` 수정**

변경점: `"use client"` 제거, `next/link` → `react-router-dom Link`, `useTranslations` → `useTranslation`

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sector } from "@/types";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";

interface SectorTabsProps {
  usSectors: Sector[];
  krSectors: Sector[];
}

const sectorKeys: Record<string, string> = {
  "information-technology": "informationTechnology",
  "health-care": "healthCare",
  financials: "financials",
  "consumer-discretionary": "consumerDiscretionary",
  "communication-services": "communicationServices",
  industrials: "industrials",
  "consumer-staples": "consumerStaples",
  energy: "energy",
  materials: "materials",
  utilities: "utilities",
  "real-estate": "realEstate",
};

export default function SectorTabs({
  usSectors,
  krSectors,
}: SectorTabsProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<"us" | "kr">("us");
  const sectors = country === "us" ? usSectors : krSectors;
  const [activeId, setActiveId] = useState(sectors[0]?.id ?? "");

  const activeSector = sectors.find((s) => s.id === activeId) ?? sectors[0];

  function handleCountryChange(c: "us" | "kr") {
    setCountry(c);
    const newSectors = c === "us" ? usSectors : krSectors;
    setActiveId(newSectors[0]?.id ?? "");
  }

  function getSectorName(sector: Sector): string {
    const key = sectorKeys[sector.id];
    if (key) {
      return t(`sectors.${key}`);
    }
    return sector.name;
  }

  function getSectorTooltip(sector: Sector): string | null {
    const key = sectorKeys[sector.id];
    if (key) {
      return t(`tooltip.sector.${key}`);
    }
    return null;
  }

  return (
    <div>
      {/* Country tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleCountryChange("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "us"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.us")}
        </button>
        <button
          onClick={() => handleCountryChange("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.kr")}
        </button>
      </div>

      {/* Sector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {sectors.map((sector) => {
          const tip = getSectorTooltip(sector);
          return (
            <div key={sector.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveId(sector.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sector.id === activeId
                    ? "bg-gray-200 text-foreground"
                    : "bg-gray-50 text-muted hover:bg-gray-100"
                }`}
              >
                {getSectorName(sector)}
              </button>
              {tip && <Tooltip text={tip} />}
            </div>
          );
        })}
      </div>

      {/* Stock list */}
      {activeSector && (
        <div className="space-y-2">
          {activeSector.stocks.map((stock, i) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted w-6 text-right">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{stock.name}</p>
                  <p className="text-xs text-muted">{stock.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {country === "kr" ? "₩" : "$"}
                  {stock.price.toLocaleString()}
                </p>
                <Badge value={stock.changesPercentage} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 도메인 컴포넌트를 React Router + react-i18next로 전환"
```

---

## Task 6: 페이지 컴포넌트 생성

**Files:**
- Create: `src/pages/HomePage.tsx`, `src/pages/StockDetailPage.tsx`, `src/pages/GuruDetailPage.tsx`
- Delete: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/stock/`, `src/app/guru/`

**Step 1: `src/pages/HomePage.tsx` 생성**

기존 `app/page.tsx`를 변환: `async` 제거, `getTranslations` → `useTranslation`

```tsx
import { gurus, usStocks, krStocks, kosdaqStocks, usSectors, krSectors } from "@/data/mock";
import { useTranslation } from "react-i18next";
import GuruCard from "@/components/guru/GuruCard";
import RankingList from "@/components/stock/RankingList";
import SectorTabs from "@/components/sector/SectorTabs";
import { Wallet, Trophy, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Gurus */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("gurus.title")}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} guru={guru} />
          ))}
        </div>
      </section>

      {/* Ranking */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("ranking.title")}
          </h2>
        </div>
        <RankingList
          usStocks={usStocks}
          krStocks={krStocks}
          kosdaqStocks={kosdaqStocks}
        />
      </section>

      {/* Sectors */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("sectors.title")}
          </h2>
        </div>
        <SectorTabs
          usSectors={usSectors}
          krSectors={krSectors}
        />
      </section>
    </div>
  );
}
```

**Step 2: `src/pages/StockDetailPage.tsx` 생성**

기존 `app/stock/[ticker]/page.tsx`를 변환: `async` 제거, `params` → `useParams`, `notFound()` → `Navigate`, `next/link` → `react-router-dom Link`

```tsx
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Building2, Landmark } from "lucide-react";
import { getCompanyProfile, guruDetails, gurus } from "@/data/mock";
import { useTranslation } from "react-i18next";
import StockMetrics from "@/components/stock/StockMetrics";

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const { t } = useTranslation();
  const profile = ticker ? getCompanyProfile(ticker) : undefined;

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const isKR = profile.exchange === "KRX";
  const currencyPrefix = isKR ? "₩" : "$";
  const isUp = profile.changesPercentage > 0;
  const isDown = profile.changesPercentage < 0;

  const gurusHoldingStock = gurus
    .map((guru) => {
      const detail = guruDetails[guru.id];
      if (!detail) return null;
      const holding = detail.holdings.find((h) => h.symbol === ticker);
      if (!holding) return null;
      return { guru, holding };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t("common.back")}
      </Link>

      <div className="bg-surface rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.companyName}
            </h1>
            <p className="text-sm text-muted mt-1">
              {profile.symbol} &middot; {profile.exchange}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {currencyPrefix}
              {profile.price.toLocaleString()}
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              {isUp ? (
                <TrendingUp size={16} className="text-red-500" />
              ) : isDown ? (
                <TrendingDown size={16} className="text-blue-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  isUp ? "text-red-500" : isDown ? "text-blue-500" : "text-muted"
                }`}
              >
                {isUp ? "+" : ""}
                {profile.change.toLocaleString()} ({isUp ? "+" : ""}
                {profile.changesPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <StockMetrics profile={profile} />

      {gurusHoldingStock.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("stockDetail.guruChoice")}
          </h2>
          <div className="space-y-3">
            {gurusHoldingStock.map(({ guru, holding }) => {
              const Icon = guru.type === "congress" ? Landmark : Building2;
              return (
                <Link
                  key={guru.id}
                  to={`/guru/${guru.id}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon size={20} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {guru.name}
                      </p>
                      <p className="text-xs text-muted">{guru.nameEn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {t("common.weight")} {holding.weight.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">
                      {holding.sharesNumber.toLocaleString()}
                      {t("common.shares")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("stockDetail.companyInfo")}
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {profile.description}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.sector")}</p>
            <p className="text-sm font-medium text-foreground">{profile.sector}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.industry")}</p>
            <p className="text-sm font-medium text-foreground">{profile.industry}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.exchange")}</p>
            <p className="text-sm font-medium text-foreground">{profile.exchange}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">CEO</p>
            <p className="text-sm font-medium text-foreground">{profile.ceo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: `src/pages/GuruDetailPage.tsx` 생성**

기존 `app/guru/[id]/page.tsx`를 변환: 동일한 패턴 적용

```tsx
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { getGuruById } from "@/data/mock";
import { useTranslation } from "react-i18next";
import Badge from "@/components/ui/Badge";

const guruIcons = {
  institutional: Building2,
  congress: Landmark,
  pension: Building2,
};

function formatValue(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export default function GuruDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const guru = id ? getGuruById(id) : undefined;

  if (!guru) {
    return <Navigate to="/" replace />;
  }

  const Icon = guruIcons[guru.type] ?? Building2;

  const topHoldings = [...guru.holdings]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  const recentActivity = guru.holdings.filter(
    (h) => h.changeInSharesNumberPercentage !== 0
  );

  const maxWeight = topHoldings.length > 0 ? topHoldings[0].weight : 100;

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t("common.back")}
      </Link>

      <div className="bg-surface rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon size={28} className="text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{guru.name}</h1>
              <Badge value={guru.returnRate} suffix={`% ${t("common.perYear")}`} />
            </div>
            <p className="text-sm text-muted mt-0.5">{guru.nameEn}</p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              {guru.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("guruDetail.topHoldings")}
        </h2>
        <div className="space-y-3">
          {topHoldings.map((holding, i) => (
            <Link
              key={holding.symbol}
              to={`/stock/${holding.symbol}`}
              className="block py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted w-6 text-right">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {holding.nameOfIssuer}
                    </p>
                    <p className="text-xs text-muted">{holding.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {holding.weight.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted">
                    {formatValue(holding.value)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-foreground rounded-full h-1.5 transition-all"
                  style={{
                    width: `${(holding.weight / maxWeight) * 100}%`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {recentActivity.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("guruDetail.recentActivity")}
          </h2>
          <div className="space-y-2">
            {recentActivity.map((holding) => {
              const isBuy = holding.changeInSharesNumberPercentage > 0;
              return (
                <Link
                  key={holding.symbol}
                  to={`/stock/${holding.symbol}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isBuy ? (
                      <ArrowUpCircle size={20} className="text-red-500" />
                    ) : (
                      <ArrowDownCircle size={20} className="text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {holding.nameOfIssuer}
                      </p>
                      <p className="text-xs text-muted">{holding.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      value={holding.changeInSharesNumberPercentage}
                      suffix="%"
                    />
                    <p className="text-xs text-muted mt-1">
                      {isBuy ? t("common.buy") : t("common.sell")}{" "}
                      {Math.abs(
                        holding.changeInSharesNumber
                      ).toLocaleString()}
                      {t("common.shares")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {guru.trades && guru.trades.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("guruDetail.congressTrades")}
          </h2>
          <div className="space-y-2">
            {guru.trades.map((trade, i) => {
              const isPurchase = trade.type === "purchase";
              const typeLabel = isPurchase
                ? t("common.buy")
                : trade.type === "sale_full"
                ? t("common.fullSell")
                : t("common.partialSell");
              return (
                <Link
                  key={`${trade.symbol}-${trade.transactionDate}-${i}`}
                  to={`/stock/${trade.symbol}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isPurchase ? (
                      <TrendingUp size={20} className="text-red-500" />
                    ) : (
                      <TrendingDown size={20} className="text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {trade.symbol}
                      </p>
                      <p className="text-xs text-muted">
                        {trade.transactionDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                        isPurchase
                          ? "text-red-500 bg-red-50"
                          : "text-blue-500 bg-blue-50"
                      }`}
                    >
                      {typeLabel}
                    </span>
                    <p className="text-xs text-muted mt-1">{trade.amount}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Next.js app 디렉토리에서 페이지 파일 삭제 (폰트, CSS는 유지)**

```bash
rm src/app/page.tsx src/app/layout.tsx
rm -rf src/app/stock src/app/guru
```

**Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 페이지 컴포넌트를 React Router 기반으로 재구성"
```

---

## Task 7: Netlify 배포 설정 및 빌드 검증

**Files:**
- Create: `netlify.toml`, `public/_redirects`

**Step 1: `netlify.toml` 생성**

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 2: `public/_redirects` 생성 (백업)**

```
/*    /index.html   200
```

**Step 3: 폰트 파일 이동**

```bash
mkdir -p public/fonts
cp src/app/fonts/GeistVF.woff public/fonts/
cp src/app/fonts/GeistMonoVF.woff public/fonts/
```

그리고 `index.html`의 폰트 경로를 업데이트:
```html
<link rel="preload" href="/fonts/GeistVF.woff" as="font" type="font/woff" crossorigin />
<style>
  @font-face {
    font-family: 'Geist';
    src: url('/fonts/GeistVF.woff') format('woff');
    font-weight: 100 900;
    font-display: swap;
  }
</style>
```

**Step 4: `src/app/fonts/` 디렉토리 삭제**

```bash
rm -rf src/app/fonts
```

**Step 5: 빌드 테스트**

```bash
pnpm build
```

Expected: `dist/` 폴더에 정적 파일 생성, 에러 없음

**Step 6: 로컬 프리뷰 테스트**

```bash
pnpm preview
```

Expected: `http://localhost:4173`에서 대시보드가 정상 렌더링

**Step 7: 커밋**

```bash
git add -A
git commit -m "feat: Netlify 배포 설정 및 폰트 파일 정리"
```

---

## Task 8: 정리 및 최종 검증

**Files:**
- Delete: 남아있는 Next.js 잔재 파일
- Modify: `.gitignore`

**Step 1: 불필요한 파일 정리**

```bash
rm -rf src/app/fonts  # 이미 삭제했으면 skip
rm -rf .next          # Next.js 빌드 캐시
```

`src/app/` 디렉토리에 `globals.css`만 남아있는지 확인. 남아있다면 `src/`로 이동:

```bash
mv src/app/globals.css src/globals.css
rm -rf src/app
```

`src/main.tsx`에서 import 경로 수정:
```tsx
import "./globals.css";  // ./app/globals.css에서 변경
```

**Step 2: `.gitignore` 업데이트**

`.next` 대신 `dist` 추가 확인:
```
dist
node_modules
```

**Step 3: 전체 빌드 + 프리뷰 최종 검증**

```bash
pnpm build && pnpm preview
```

검증 항목:
- [ ] 홈페이지 (`/`) 정상 렌더링
- [ ] 고수 카드 클릭 → `/guru/:id` 이동
- [ ] 주식 클릭 → `/stock/:ticker` 이동
- [ ] 뒤로가기 링크 동작
- [ ] 탭 전환 (미국/한국, 거래소, 섹터) 동작
- [ ] 언어 전환 (한국어/English) 동작 + localStorage 저장
- [ ] 새로고침 시 선택한 언어 유지

**Step 4: 최종 커밋**

```bash
git add -A
git commit -m "chore: Next.js 잔재 파일 정리 및 최종 검증"
```
