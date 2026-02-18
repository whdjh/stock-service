# Next.js → Vite + React 마이그레이션 설계

## 배경
- 커뮤니티 기능 불필요, 서버사이드 기능 미사용
- Netlify 배포 → 정적 빌드가 자연스러운 조합
- 프로젝트 규모가 작아(소스 18개, 컴포넌트 11개) 클린 스타트가 효율적

## 기술 스택

| 항목 | 선택 |
|------|------|
| 빌드 도구 | Vite 6 |
| 프레임워크 | React 18 + TypeScript |
| 라우팅 | React Router v7 |
| i18n | react-i18next + i18next |
| 스타일링 | Tailwind CSS 3 |
| 아이콘 | lucide-react |
| 패키지 매니저 | pnpm |
| 배포 | Netlify (정적 빌드) |

## 디렉토리 구조

```
src/
├── components/
│   ├── ui/           # Button, Card, Badge, Tooltip
│   ├── layout/       # Sidebar, LocaleSwitcher
│   ├── guru/         # GuruCard
│   ├── stock/        # RankingList, StockMetrics
│   └── sector/       # SectorCard, SectorTabs
├── pages/
│   ├── HomePage.tsx
│   ├── StockDetailPage.tsx
│   └── GuruDetailPage.tsx
├── data/             # mock.ts
├── types/            # index.ts
├── i18n/             # react-i18next 설정 + 딕셔너리
│   ├── index.ts
│   ├── ko.json
│   └── en.json
├── App.tsx           # Router + Layout
└── main.tsx          # 엔트리포인트
```

## 라우팅 매핑

| Next.js | React Router |
|---------|-------------|
| `app/page.tsx` | `/` → `HomePage` |
| `app/stock/[ticker]/page.tsx` | `/stock/:ticker` → `StockDetailPage` |
| `app/guru/[id]/page.tsx` | `/guru/:id` → `GuruDetailPage` |

## 주요 변환 사항

### 컴포넌트
- Server Component → 일반 컴포넌트 (`async` 제거)
- `"use client"` 디렉티브 제거
- `next/link` → React Router `<Link>`
- `useRouter()` → `useNavigate()`
- `layout.tsx` Sidebar+Content → `App.tsx`에서 처리

### i18n
- `getTranslations()` → `useTranslation()` 훅
- 기존 ko.json, en.json 딕셔너리 구조 유지
- locale 저장: **localStorage** (쿠키 대신)

### 배포
- `vite build` → `dist/`
- `netlify.toml` SPA 리다이렉트 (`/* → /index.html`)
