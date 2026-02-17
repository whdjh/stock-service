# Stock Service MVP Design

## Overview

주식 정보 대시보드 서비스. 고수(버핏, 펠로시, 국민연금)들의 포트폴리오와 국가별 시총 Top 30, 테마 섹터를 한눈에 확인할 수 있는 웹 앱.

## Decisions

- **범위:** 대시보드 + 종목 상세 + 고수 상세 + 사이드바 전체 구현
- **데이터:** Mock 데이터만 사용 (API 연동은 추후)
- **차트:** 제외 (숫자/프로그레스 바로 대체)
- **커뮤니티:** 제외
- **폴더 구조:** 페이지 중심 구조 (A안)

## Tech Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS Only (외부 UI/애니메이션 라이브러리 금지)
- lucide-react (아이콘)

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx               # 루트 레이아웃 (사이드바 포함)
│   ├── page.tsx                 # 메인 대시보드
│   ├── stock/[ticker]/page.tsx  # 종목 상세
│   └── guru/[id]/page.tsx       # 고수 상세
├── components/
│   ├── ui/                      # Card, Button, Badge
│   ├── layout/                  # Sidebar
│   ├── guru/                    # GuruCard
│   ├── stock/                   # RankingList, StockMetrics
│   └── sector/                  # SectorCard
├── data/
│   └── mock.ts                  # Mock 데이터 통합
└── types/
    └── index.ts                 # 공통 타입 정의
```

## Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | 메인 대시보드 | 3개 섹션 + 사이드바 |
| `/stock/[ticker]` | 종목 상세 | e.g. `/stock/AAPL` |
| `/guru/[id]` | 고수 상세 | e.g. `/guru/buffett` |

## UI Components

### Card.tsx (합성+플랫 양립)
- 플랫: `<Card title="제목" description="설명" />`
- 합성: `<Card><Card.Header>제목</Card.Header><Card.Body>내용</Card.Body></Card>`
- 스타일: `bg-white rounded-3xl`

### Button.tsx
- `variant`: `primary` | `secondary` | `ghost`
- `size`: `sm` | `md` | `lg`
- 스타일: `rounded-xl`

### Badge.tsx
- `variant`: `up` (빨강) | `down` (파랑) | `neutral` (회색)
- 등락률 표시 용도

## Pages

### 메인 대시보드 (`/`)

**레이아웃:** 사이드바(좌) + 메인(우), 모바일에서 사이드바 상단 이동

**사이드바:** 나스닥, 코스피, 코스닥 지수 + 등락률 Badge

**섹션 1 - 고수들의 지갑:** GuruCard 가로 배치. 클릭 시 `/guru/[id]` 이동

**섹션 2 - 시총 Top 30:** RankingList (순위, 기업명, 현재가, 등락률). 미국/한국 탭 전환

**섹션 3 - 뜨는 섹터:** SectorCard 그리드. 테마별 Top 5 종목

### 종목 상세 (`/stock/[ticker]`)

- 현재가, 전일 대비 등락 (Badge)
- 핵심 지표: 시가총액, PER, PBR, 배당수익률 (StockMetrics)
- 고수 포트폴리오 포함 배지

### 고수 상세 (`/guru/[id]`)

- 고수 프로필 (이름, 설명)
- Top Holdings 10개 (비중 % + 프로그레스 바)
- 최근 활동: 매수/매도 종목 (Change %)

## Types (FMP API 필드 기반)

Mock 데이터 타입을 실제 FMP API 응답 필드에 맞춰 설계하여, 추후 API 연동 시 타입 변환 없이 바로 교체 가능하도록 한다.

### StockQuote (FMP `/stable/quote` 기반)

```typescript
// FMP Stock Quote API 응답 필드와 1:1 매핑
interface StockQuote {
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
```

### CompanyProfile (FMP `/stable/profile` 기반, 추가 지표 포함)

```typescript
interface CompanyProfile extends StockQuote {
  companyName: string;
  industry: string;
  sector: string;
  ceo: string;
  description: string;
  website: string;
  image: string;
  // 추가 지표 (FMP key-metrics 등에서 조합)
  pbr: number;       // Price-to-Book Ratio
  dividend: number;   // Dividend Yield
}
```

### MarketIndex (FMP Quote로 지수 조회)

```typescript
// ^IXIC(나스닥), ^KS11(코스피) 등도 같은 Quote 형태
interface MarketIndex {
  symbol: string;       // e.g. "^IXIC"
  name: string;         // e.g. "NASDAQ Composite"
  price: number;
  changesPercentage: number;
  change: number;
}
```

### 13F Holdings (FMP `/stable/institutional-ownership/extract` 기반)

```typescript
// 버핏(Berkshire Hathaway) 등 기관투자자 보유 종목
interface InstitutionalHolding {
  date: string;
  filingDate: string;
  cik: string;
  symbol: string;
  nameOfIssuer: string;
  shares: number;
  titleOfClass: string;
  value: number;
  // Analytics 확장 필드 (extract-with-analytics)
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
```

### House Trading (FMP `/stable/house-trades` 기반)

```typescript
// 펠로시 등 하원의원 거래 내역
interface HouseTrading {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  owner: string;          // "joint", "spouse", "self"
  type: string;           // "purchase", "sale_full", "sale_partial"
  amount: string;         // "$1,001 - $15,000" 등 범위
  link: string;
}
```

### 앱 내부 타입 (도메인 모델)

```typescript
// 고수 타입 (버핏=13F, 펠로시=HouseTrading, 국민연금=정적 JSON)
type GuruType = "institutional" | "congress" | "pension";

interface Guru {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  type: GuruType;
  returnRate: number;     // 연간 수익률 (표시용)
}

// 섹터 테마 (관리자 큐레이션)
interface Sector {
  id: string;
  name: string;
  stocks: StockQuote[];   // FMP Quote 타입 재활용
}

// 고수 상세 - 통합 뷰 모델
interface GuruDetail extends Guru {
  holdings: InstitutionalHolding[];  // 13F 기반 보유 종목
  trades?: HouseTrading[];           // 의회 거래 내역 (선택)
}
```

## Mock Data

`data/mock.ts`에 통합 관리. 모든 mock 데이터는 위 FMP API 타입과 동일한 필드 구조를 따른다:
- 시장 지수 3개 (나스닥, 코스피, 코스닥) — `MarketIndex` 타입
- 고수 3명 (버핏, 펠로시, 국민연금) — `Guru` + `GuruDetail` 타입
- 미국 Top 30, 한국 Top 30 종목 — `StockQuote` 타입
- 섹터 4개 (2차전지, AI 반도체, 바이오, 방산) 각 5종목 — `Sector` 타입
- 버핏 Holdings 10개 — `InstitutionalHolding` 타입
- 펠로시 Trades 10개 — `HouseTrading` 타입

### FMP API 엔드포인트 매핑 (추후 연동 참고)

| 데이터 | FMP Endpoint | 비고 |
|--------|-------------|------|
| 주식 시세 | `/stable/quote?symbol=AAPL` | 실시간 가격 |
| 기업 프로필 | `/stable/profile?symbol=AAPL` | 상세 정보 |
| 시장 지수 | `/stable/quote?symbol=^IXIC` | 지수도 Quote |
| 버핏 포트폴리오 | `/stable/institutional-ownership/extract?cik=0001067983` | 13F 분기별 |
| 펠로시 거래 | `/stable/house-trades?symbol=AAPL` | 의회 거래 |

## Design Tokens (Toss Style)

- 배경: `#F2F4F6`
- 카드: `#FFFFFF`
- 텍스트 주: `#191F28`
- 텍스트 보조: `#8B95A1`
- 상승: `text-red-500`
- 하락: `text-blue-500`
- 카드 둥글기: `rounded-3xl`
- 버튼 둥글기: `rounded-xl`
