# Stock Service MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 주식 정보 대시보드 서비스 - 고수 포트폴리오, 시총 Top 30, 테마 섹터를 보여주는 전체 UI 구현

**Architecture:** Next.js 14 App Router 기반. 사이드바(오늘의 시장)를 layout.tsx에 배치하고, 대시보드/종목 상세/고수 상세 3개 페이지를 구성. Mock 데이터는 FMP API 필드와 1:1 매핑하여 추후 API 연동 시 바로 교체 가능.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, lucide-react

**Design Reference:** `docs/plans/2026-02-18-stock-service-mvp-design.md`

---

### Task 1: Install lucide-react & scaffold folders

**Files:**
- Modify: `package.json` (via npm install)
- Create: folder structure under `src/`

**Step 1: Install lucide-react**

Run: `cd /Users/jh/project/stock-service && npm install lucide-react`

**Step 2: Create folder structure**

Run:
```bash
mkdir -p src/components/ui src/components/layout src/components/guru src/components/stock src/components/sector src/data src/types src/app/stock/\[ticker\] src/app/guru/\[id\]
```

**Step 3: Verify**

Run: `ls -R src/`
Expected: All folders exist

**Step 4: Commit**

```bash
git add -A && git commit -m "chore: install lucide-react and scaffold folder structure"
```

---

### Task 2: Configure Tailwind design tokens & globals.css

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Update tailwind.config.ts**

Replace the entire content with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F2F4F6",
        surface: "#FFFFFF",
        foreground: "#191F28",
        muted: "#8B95A1",
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Update globals.css**

Replace the entire content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  color: #191F28;
  background: #F2F4F6;
}
```

**Step 3: Verify**

Run: `npx next build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css && git commit -m "style: configure Toss-style design tokens in Tailwind"
```

---

### Task 3: Define TypeScript types (FMP API aligned)

**Files:**
- Create: `src/types/index.ts`

**Step 1: Write types file**

Create `src/types/index.ts` with all types from the design doc:

```typescript
// FMP Stock Quote API 응답 필드와 1:1 매핑
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  sharesOutstanding: number;
  timestamp: number;
}

// FMP Company Profile 확장
export interface CompanyProfile extends StockQuote {
  companyName: string;
  industry: string;
  sector: string;
  ceo: string;
  description: string;
  website: string;
  image: string;
  pbr: number;
  dividend: number;
}

// 시장 지수 (FMP Quote 서브셋)
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
}

// 13F 기관투자자 보유 종목
export interface InstitutionalHolding {
  date: string;
  filingDate: string;
  cik: string;
  symbol: string;
  nameOfIssuer: string;
  shares: number;
  titleOfClass: string;
  value: number;
  weight: number;
  lastWeight: number;
  changeInWeight: number;
  changeInWeightPercentage: number;
  sharesNumber: number;
  lastSharesNumber: number;
  changeInSharesNumber: number;
  changeInSharesNumberPercentage: number;
  isNew: boolean;
  isSoldOut: boolean;
}

// 하원의원 거래 내역
export interface HouseTrading {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  owner: string;
  type: string;
  amount: string;
  link: string;
}

// 고수 타입
export type GuruType = "institutional" | "congress" | "pension";

export interface Guru {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  type: GuruType;
  returnRate: number;
}

// 섹터 테마
export interface Sector {
  id: string;
  name: string;
  stocks: StockQuote[];
}

// 고수 상세
export interface GuruDetail extends Guru {
  holdings: InstitutionalHolding[];
  trades?: HouseTrading[];
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: add FMP API-aligned TypeScript type definitions"
```

---

### Task 4: Create mock data

**Files:**
- Create: `src/data/mock.ts`

**Step 1: Write mock data**

Create `src/data/mock.ts` with realistic data for all types. Include:

- `marketIndexes`: 나스닥(^IXIC), 코스피(^KS11), 코스닥(^KQ11) - 3개
- `gurus`: 버핏, 펠로시, 국민연금 - 3개
- `usStocks`: 미국 시총 Top 30 (AAPL, MSFT, NVDA, GOOGL, AMZN, META, BRK-B, TSLA, UNH, LLY, JPM, XOM, V, JNJ, PG, MA, AVGO, HD, MRK, COST, ABBV, PEP, KO, ADBE, CRM, WMT, BAC, NFLX, TMO, AMD)
- `krStocks`: 한국 시총 Top 30 (삼성전자, SK하이닉스, LG에너지솔루션, 삼성바이오로직스, 현대차, 기아, POSCO홀딩스, 셀트리온, KB금융, NAVER, 신한지주, LG화학, 삼성SDI, 하나금융지주, 현대모비스, 카카오, 메리츠금융지주, 우리금융지주, 한국전력, SK이노베이션, 삼성물산, LG전자, SK텔레콤, 한화에어로스페이스, 포스코퓨처엠, KT&G, 두산에너빌리티, 삼성생명, 고려아연, HMM)
- `sectors`: 2차전지, AI 반도체, 바이오, 방산 - 각 5종목
- `guruDetails`: 각 고수별 holdings 10개, 펠로시는 trades도 포함

각 StockQuote는 모든 필드를 포함하되, 실제와 비슷한 값 사용. 가격은 USD/KRW 구분.

**중요:** 이 파일은 크므로 하나의 파일에 모든 데이터를 정의. 헬퍼 함수로 `getStockBySymbol`, `getGuruById` 등을 export.

```typescript
import {
  StockQuote, CompanyProfile, MarketIndex, InstitutionalHolding,
  HouseTrading, Guru, GuruDetail, Sector,
} from "@/types";

export const marketIndexes: MarketIndex[] = [
  { symbol: "^IXIC", name: "나스닥", price: 18972.42, changesPercentage: 1.24, change: 232.57 },
  { symbol: "^KS11", name: "코스피", price: 2687.44, changesPercentage: -0.38, change: -10.23 },
  { symbol: "^KQ11", name: "코스닥", price: 868.52, changesPercentage: 0.67, change: 5.78 },
];

export const gurus: Guru[] = [
  { id: "buffett", name: "워렌 버핏", nameEn: "Warren Buffett", description: "버크셔 해서웨이 CEO. 가치투자의 전설.", type: "institutional", returnRate: 19.8 },
  { id: "pelosi", name: "낸시 펠로시", nameEn: "Nancy Pelosi", description: "전 미 하원의장. 테크주 투자로 유명.", type: "congress", returnRate: 65.5 },
  { id: "nps", name: "국민연금", nameEn: "National Pension Service", description: "대한민국 국민연금공단. 세계 3위 연기금.", type: "pension", returnRate: 8.92 },
];

export const usStocks: StockQuote[] = [
  // 30개 종목 — 실제 시세에 가까운 mock 값
  // 각 종목에 symbol, name, price, changesPercentage, change, dayLow, dayHigh,
  // yearHigh, yearLow, marketCap, priceAvg50, priceAvg200, volume, avgVolume,
  // exchange, open, previousClose, eps, pe, sharesOutstanding, timestamp 필드 포함
];

export const krStocks: StockQuote[] = [
  // 30개 종목 — KRW 단위
];

export const sectors: Sector[] = [
  // 4개 섹터, 각 5종목 (StockQuote 재활용)
];

export const guruDetails: Record<string, GuruDetail> = {
  // buffett: holdings 10개 (InstitutionalHolding)
  // pelosi: holdings + trades (HouseTrading)
  // nps: holdings 10개
};

// 헬퍼 함수
export function getStockBySymbol(symbol: string): StockQuote | undefined {
  return [...usStocks, ...krStocks].find((s) => s.symbol === symbol);
}

export function getGuruById(id: string): GuruDetail | undefined {
  return guruDetails[id];
}

export function getCompanyProfile(symbol: string): CompanyProfile | undefined {
  // StockQuote에 프로필 필드 추가한 mock 데이터 반환
  // 실제 구현 시 profiles Map 사용
}
```

**주의:** 실제 구현 시 모든 30개 종목의 전체 필드 값을 채워야 함. plan에서는 구조만 명시.

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/data/mock.ts && git commit -m "feat: add FMP API-aligned mock data for all entities"
```

---

### Task 5: Build Card component (compound + flat pattern)

**Files:**
- Create: `src/components/ui/Card.tsx`

**Step 1: Write Card component**

```tsx
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ title, description, children, className = "", onClick }: CardProps) {
  const clickable = onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "";
  return (
    <div className={`bg-surface rounded-3xl p-5 ${clickable} ${className}`} onClick={onClick}>
      {children ?? (
        <>
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </>
      )}
    </div>
  );
}

function Header({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

Card.Header = Header;
Card.Body = Body;

export default Card;
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/Card.tsx && git commit -m "feat: add Card component with compound/flat pattern"
```

---

### Task 6: Build Badge component

**Files:**
- Create: `src/components/ui/Badge.tsx`

**Step 1: Write Badge component**

```tsx
interface BadgeProps {
  value: number;
  showSign?: boolean;
  suffix?: string;
  className?: string;
}

export default function Badge({ value, showSign = true, suffix = "%", className = "" }: BadgeProps) {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? "text-red-500 bg-red-50" : isDown ? "text-blue-500 bg-blue-50" : "text-muted bg-gray-100";
  const sign = showSign && isUp ? "+" : "";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-medium ${color} ${className}`}>
      {sign}{value.toFixed(2)}{suffix}
    </span>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/ui/Badge.tsx && git commit -m "feat: add Badge component for price changes"
```

---

### Task 7: Build Button component

**Files:**
- Create: `src/components/ui/Button.tsx`

**Step 1: Write Button component**

```tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary: "bg-foreground text-white hover:bg-foreground/90",
  secondary: "bg-gray-100 text-foreground hover:bg-gray-200",
  ghost: "text-muted hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx && git commit -m "feat: add Button component with variant/size props"
```

---

### Task 8: Build Sidebar component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

**Step 1: Write Sidebar component**

사이드바는 "오늘의 시장" 섹션. 나스닥, 코스피, 코스닥 지수를 Badge와 함께 표시.

```tsx
import { marketIndexes } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import { TrendingUp } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="bg-surface rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-foreground" />
          <h2 className="text-base font-semibold text-foreground">오늘의 시장</h2>
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
        </div>
      </div>
    </aside>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx && git commit -m "feat: add Sidebar with market indexes"
```

---

### Task 9: Update root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout**

루트 레이아웃에 사이드바를 배치. lang="ko", metadata 업데이트. 모바일에선 사이드바가 상단, 데스크톱에선 좌측.

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Stock Service",
  description: "고수들의 포트폴리오와 시장 동향을 한눈에",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} font-sans antialiased bg-background min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` (dev server 확인) → `http://localhost:3000` 접속 시 사이드바가 보이는지 확인
Run: `npx next build` 로 빌드 성공 확인

**Step 3: Commit**

```bash
git add src/app/layout.tsx && git commit -m "feat: update root layout with sidebar and Toss-style design"
```

---

### Task 10: Build GuruCard component

**Files:**
- Create: `src/components/guru/GuruCard.tsx`

**Step 1: Write GuruCard**

고수 아이콘 카드. 이름, 수익률, 간단 설명. 클릭 시 `/guru/[id]`로 이동.

```tsx
"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const Icon = guruIcons[guru.type] ?? User;

  return (
    <Card className="min-w-[160px]" onClick={() => router.push(`/guru/${guru.id}`)}>
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

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/guru/GuruCard.tsx && git commit -m "feat: add GuruCard component"
```

---

### Task 11: Build RankingList component

**Files:**
- Create: `src/components/stock/RankingList.tsx`

**Step 1: Write RankingList**

시총 Top 30 리스트. 미국/한국 탭 전환 기능 포함. 순위, 기업명, 현재가, 등락률 표시.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { StockQuote } from "@/types";
import Badge from "@/components/ui/Badge";

interface RankingListProps {
  usStocks: StockQuote[];
  krStocks: StockQuote[];
}

export default function RankingList({ usStocks, krStocks }: RankingListProps) {
  const [tab, setTab] = useState<"us" | "kr">("us");
  const stocks = tab === "us" ? usStocks : krStocks;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "us" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          미국
        </button>
        <button
          onClick={() => setTab("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "kr" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          한국
        </button>
      </div>
      <div className="space-y-2">
        {stocks.map((stock, i) => (
          <Link
            key={stock.symbol}
            href={`/stock/${stock.symbol}`}
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
                {tab === "kr" ? "₩" : "$"}{stock.price.toLocaleString()}
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

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/stock/RankingList.tsx && git commit -m "feat: add RankingList with US/KR tab switching"
```

---

### Task 12: Build SectorCard component

**Files:**
- Create: `src/components/sector/SectorCard.tsx`

**Step 1: Write SectorCard**

테마 섹터 카드. 섹터 이름 + Top 5 종목 리스트.

```tsx
import Link from "next/link";
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
              href={`/stock/${stock.symbol}`}
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

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/sector/SectorCard.tsx && git commit -m "feat: add SectorCard with top 5 stocks"
```

---

### Task 13: Assemble Dashboard page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Write Dashboard page**

기존 보일러플레이트를 완전히 교체. 3개 섹션 배치:
1. 고수들의 지갑 (GuruCard 가로 스크롤)
2. 시총 Top 30 (RankingList)
3. 지금 뜨는 섹터 (SectorCard 그리드)

```tsx
import { gurus, usStocks, krStocks, sectors } from "@/data/mock";
import GuruCard from "@/components/guru/GuruCard";
import RankingList from "@/components/stock/RankingList";
import SectorCard from "@/components/sector/SectorCard";
import { Wallet, Trophy, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 섹션 1: 고수들의 지갑 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">고수들의 지갑</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} guru={guru} />
          ))}
        </div>
      </section>

      {/* 섹션 2: 시총 Top 30 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">시총 Top 30</h2>
        </div>
        <RankingList usStocks={usStocks} krStocks={krStocks} />
      </section>

      {/* 섹션 3: 지금 뜨는 섹터 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">지금 뜨는 섹터</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sectors.map((sector) => (
            <SectorCard key={sector.id} sector={sector} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` → http://localhost:3000 에서 대시보드 전체 확인
- 사이드바에 시장 지수 3개 표시
- 고수 카드 3개 가로 배치
- 시총 Top 30 미국/한국 탭 전환
- 섹터 카드 4개 그리드

**Step 3: Commit**

```bash
git add src/app/page.tsx && git commit -m "feat: assemble dashboard with all 3 sections"
```

---

### Task 14: Build StockMetrics component

**Files:**
- Create: `src/components/stock/StockMetrics.tsx`

**Step 1: Write StockMetrics**

핵심 지표 표시: 시가총액, PER, PBR, 배당수익률.

```tsx
import { CompanyProfile } from "@/types";

interface StockMetricsProps {
  profile: CompanyProfile;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

const metrics = [
  { label: "시가총액", key: "marketCap" as const, format: formatMarketCap },
  { label: "PER", key: "pe" as const, format: (v: number) => v.toFixed(2) },
  { label: "PBR", key: "pbr" as const, format: (v: number) => v.toFixed(2) },
  { label: "배당수익률", key: "dividend" as const, format: (v: number) => `${v.toFixed(2)}%` },
];

export default function StockMetrics({ profile }: StockMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(({ label, key, format }) => (
        <div key={key} className="bg-surface rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">{label}</p>
          <p className="text-base font-semibold text-foreground">{format(profile[key])}</p>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/stock/StockMetrics.tsx && git commit -m "feat: add StockMetrics for key financial indicators"
```

---

### Task 15: Build Stock Detail page

**Files:**
- Create: `src/app/stock/[ticker]/page.tsx`

**Step 1: Write Stock Detail page**

현재가, 등락, 핵심 지표, 고수 포트폴리오 배지 표시.

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompanyProfile, guruDetails } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import StockMetrics from "@/components/stock/StockMetrics";
import { ArrowLeft, Award } from "lucide-react";

interface Props {
  params: { ticker: string };
}

export default function StockDetailPage({ params }: Props) {
  const profile = getCompanyProfile(params.ticker);
  if (!profile) return notFound();

  // 이 종목을 보유한 고수 찾기
  const holdingGurus = Object.entries(guruDetails)
    .filter(([_, detail]) =>
      detail.holdings.some((h) => h.symbol === params.ticker)
    )
    .map(([_, detail]) => detail);

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={16} />
        대시보드
      </Link>

      {/* 종목 헤더 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">{profile.companyName}</h1>
          <span className="text-sm text-muted">{profile.symbol}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-foreground">
            ${profile.price.toLocaleString()}
          </span>
          <Badge value={profile.changesPercentage} />
          <span className="text-sm text-muted">
            {profile.change > 0 ? "+" : ""}{profile.change.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 핵심 지표 */}
      <StockMetrics profile={profile} />

      {/* 고수 배지 */}
      {holdingGurus.length > 0 && (
        <div className="bg-surface rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">고수의 선택</h3>
          </div>
          <div className="space-y-2">
            {holdingGurus.map((guru) => (
              <Link
                key={guru.id}
                href={`/guru/${guru.id}`}
                className="block text-sm text-muted hover:text-foreground"
              >
                이 종목은 <span className="font-medium text-foreground">{guru.name}</span> 포트폴리오에 포함되어 있습니다
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 종목 정보 */}
      <div className="bg-surface rounded-3xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">기업 정보</h3>
        <p className="text-sm text-muted leading-relaxed">{profile.description}</p>
        <div className="mt-3 flex gap-4 text-xs text-muted">
          <span>{profile.sector}</span>
          <span>{profile.industry}</span>
          <span>{profile.exchange}</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` → http://localhost:3000/stock/AAPL 접속하여 종목 상세 페이지 확인

**Step 3: Commit**

```bash
git add src/app/stock/\\[ticker\\]/page.tsx && git commit -m "feat: add Stock Detail page with metrics and guru badges"
```

---

### Task 16: Build Guru Detail page

**Files:**
- Create: `src/app/guru/[id]/page.tsx`

**Step 1: Write Guru Detail page**

고수 프로필, Top Holdings 10개 (비중 % + 프로그레스 바), 최근 활동 (매수/매도).

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGuruById } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  params: { id: string };
}

export default function GuruDetailPage({ params }: Props) {
  const guru = getGuruById(params.id);
  if (!guru) return notFound();

  const topHoldings = guru.holdings
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  // 최근 활동: 비중 변화가 있는 종목
  const recentActivity = guru.holdings
    .filter((h) => h.changeInSharesNumberPercentage !== 0)
    .sort((a, b) => Math.abs(b.changeInSharesNumberPercentage) - Math.abs(a.changeInSharesNumberPercentage))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={16} />
        대시보드
      </Link>

      {/* 고수 프로필 */}
      <div className="bg-surface rounded-3xl p-6">
        <h1 className="text-2xl font-bold text-foreground">{guru.name}</h1>
        <p className="text-sm text-muted mt-1">{guru.nameEn}</p>
        <p className="text-sm text-muted mt-3">{guru.description}</p>
        <div className="mt-3">
          <Badge value={guru.returnRate} suffix="% /yr" />
        </div>
      </div>

      {/* Top Holdings */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Top Holdings</h2>
        <div className="space-y-3">
          {topHoldings.map((holding) => (
            <Link
              key={holding.symbol}
              href={`/stock/${holding.symbol}`}
              className="block bg-surface rounded-2xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{holding.nameOfIssuer}</p>
                  <p className="text-xs text-muted">{holding.symbol}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{holding.weight.toFixed(2)}%</span>
              </div>
              {/* 비중 프로그레스 바 */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-foreground rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(holding.weight, 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 활동 */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">최근 활동</h2>
          <div className="space-y-2">
            {recentActivity.map((holding) => {
              const isBuy = holding.changeInSharesNumberPercentage > 0;
              return (
                <Link
                  key={holding.symbol}
                  href={`/stock/${holding.symbol}`}
                  className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {isBuy ? (
                      <TrendingUp size={16} className="text-red-500" />
                    ) : (
                      <TrendingDown size={16} className="text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{holding.nameOfIssuer}</p>
                      <p className="text-xs text-muted">{holding.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge value={holding.changeInSharesNumberPercentage} />
                    <p className="text-xs text-muted mt-1">
                      {isBuy ? "매수" : "매도"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 펠로시: 의회 거래 내역 */}
      {guru.trades && guru.trades.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">의회 거래 내역</h2>
          <div className="space-y-2">
            {guru.trades.map((trade, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{trade.symbol}</p>
                  <p className="text-xs text-muted">{trade.transactionDate}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    trade.type === "purchase" ? "text-red-500" : "text-blue-500"
                  }`}>
                    {trade.type === "purchase" ? "매수" : "매도"}
                  </span>
                  <p className="text-xs text-muted">{trade.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` → http://localhost:3000/guru/buffett 접속하여 고수 상세 페이지 확인

**Step 3: Commit**

```bash
git add src/app/guru/\\[id\\]/page.tsx && git commit -m "feat: add Guru Detail page with holdings and activity"
```

---

### Task 17: Final verification & build

**Step 1: Full build check**

Run: `npx next build`
Expected: Build succeeds with no errors

**Step 2: Visual check**

Run: `npm run dev` and verify:
- [ ] `/` — 사이드바 + 3개 섹션 모두 렌더링
- [ ] 고수 카드 클릭 → `/guru/buffett` 이동
- [ ] 시총 리스트 종목 클릭 → `/stock/AAPL` 이동
- [ ] 미국/한국 탭 전환 동작
- [ ] 모바일 반응형 (사이드바가 상단으로 이동)
- [ ] 뒤로가기 링크 동작

**Step 3: Lint**

Run: `npm run lint`
Fix any issues.

**Step 4: Final commit (if any fixes)**

```bash
git add -A && git commit -m "fix: resolve lint issues and final polish"
```
