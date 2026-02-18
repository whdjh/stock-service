# 차트 + FMP API 전체 연동 설계

## 목표

mock 데이터를 FMP API 데이터로 전환하고, 주가 라인 차트(TradingView)와 포트폴리오 파이 차트(Recharts)를 추가한다.

## 아키텍처

GitHub Actions가 FMP API에서 데이터를 가져와 `public/data/*.json`으로 저장 → 커밋/푸시 → Netlify 자동 배포. SPA는 정적 JSON만 읽음. 백엔드 없음. API 키는 GitHub Secrets에만 존재.

```
GitHub Actions (cron) → FMP API → public/data/*.json → git push → Netlify 배포
브라우저 → /data/*.json (정적 파일)
```

## 기술 스택 추가

- `lightweight-charts`: TradingView 주가 라인 차트 (~45KB gzip)
- `recharts`: 포트폴리오 파이 차트 (~190KB gzip)

## 데이터 파일 구조

```
public/data/
├── market-indexes.json      # 사이드바 지수 + 환율 + 금은
├── us-stocks.json           # 미국 시총 Top 30
├── profiles.json            # 종목 프로필 (전체)
├── historical/
│   ├── AAPL.json            # 종목별 1년 일봉
│   ├── MSFT.json
│   └── ...
└── gurus.json               # 고수 포트폴리오 (정적 유지)
```

## 데이터 소스 분류

| 데이터 | 소스 | 갱신 주기 |
|--------|------|----------|
| 미국 시장 지수 | FMP `/quote` | 매일 장마감 후 |
| 미국 시총 Top 30 | FMP `/quote` | 매일 장마감 후 |
| 종목 프로필 | FMP `/profile` | 주 1회 |
| 주가 차트 (일봉) | FMP `/historical-price-full` | 매일 장마감 후 |
| 환율/금은 | FMP `/quote` | 매일 |
| 한국 주식 | mock 데이터 유지 | 수동 |
| 고수 포트폴리오 | 정적 데이터 유지 | 수동 (분기별) |

## API 호출 예산 (무료 250회/일)

| 데이터 | 호출수 | 비고 |
|--------|--------|------|
| 지수+환율+금은 | 1회 | batch quote |
| US Top 30 시세 | 1회 | batch quote |
| 프로필 30개 | 1회 | batch profile |
| 차트 30종목 | 30회 | 개별 호출 |
| **합계** | **~33회/일** | 여유 충분 |

## 주가 라인 차트

StockDetailPage 가격 영역 아래. TradingView Lightweight Charts 에리어 차트. 기간 필터: 1M, 3M, 6M, 1Y.

## 포트폴리오 파이 차트

GuruDetailPage Top Holdings 위. Recharts PieChart. 상위 5개 + 기타.
