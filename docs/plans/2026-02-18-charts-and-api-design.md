# 차트 + FMP API 전체 연동 설계

## 목표

mock 데이터를 FMP API 실시간 데이터로 전환하고, 주가 라인 차트(TradingView)와 포트폴리오 파이 차트(Recharts)를 추가한다.

## 아키텍처

100% 클라이언트 SPA. 백엔드 없음. FMP API를 브라우저에서 직접 호출.

## 기술 스택 추가

- `lightweight-charts`: TradingView 주가 라인 차트 (~45KB gzip)
- `recharts`: 포트폴리오 파이 차트 (~190KB gzip)

## API 클라이언트 + 캐싱 구조

```
src/
├── api/
│   ├── fmp.ts         # fetch wrapper (API key, error handling)
│   └── cache.ts       # localStorage TTL 캐시
├── hooks/
│   ├── useFetch.ts          # 공통 fetch + cache + loading/error 상태
│   ├── useMarketIndexes.ts  # 사이드바 지수
│   ├── useStockQuotes.ts    # 시총 Top N
│   ├── useCompanyProfile.ts # 종목 프로필
│   ├── useHistoricalPrice.ts # 차트 데이터
│   └── useGuruHoldings.ts   # 고수 포트폴리오
```

## FMP API 엔드포인트

| 기능 | 엔드포인트 | 캐시 TTL |
|------|-----------|----------|
| 사이드바 지수 | `GET /quote/{symbols}` | 5분 |
| 시총 Top 30 | `GET /stock-screener?marketCapMoreThan=...&limit=30` | 5분 |
| 종목 프로필 | `GET /profile/{symbol}` | 24시간 |
| 주가 차트 | `GET /historical-price-full/{symbol}` | 1시간 |
| 고수 포트폴리오 | 정적 데이터 (FMP 무료 플랜 제한) | - |

## 캐시 전략

localStorage 기반 TTL 캐시. 키: `fmp:{endpoint}:{params}`, 값: `{ data, expiry }`.

## 로딩/에러 처리

- 로딩: Tailwind animate-pulse 스켈레톤 UI
- 에러/API 한도 초과: mock 데이터로 fallback

## 주가 라인 차트

StockDetailPage 가격 영역 아래에 배치. TradingView Lightweight Charts 에리어 차트. 기간 선택: 1M, 3M, 6M, 1Y.

## 포트폴리오 파이 차트

GuruDetailPage Top Holdings 위에 배치. Recharts PieChart. 상위 10개 종목 비중 + 기타.
