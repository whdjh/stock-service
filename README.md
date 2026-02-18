# Stock Service

주식 정보 대시보드 서비스. 고수(버핏, 펠로시, 국민연금)들의 포트폴리오와 국가별 시총 Top 30, 테마 섹터를 한눈에 확인할 수 있는 웹 앱.

## 기술 스택

- **프레임워크:** Vite 7 + React 18 + TypeScript
- **라우팅:** React Router v7
- **스타일링:** Tailwind CSS 3
- **다국어:** react-i18next (한국어/영어, localStorage 저장)
- **아이콘:** lucide-react
- **패키지 매니저:** pnpm

## 시작하기

```bash
pnpm install
pnpm dev
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm lint` | ESLint 실행 |

## 프로젝트 구조

```
src/
├── components/
│   ├── guru/          # 고수 관련 컴포넌트
│   ├── layout/        # Sidebar, LocaleSwitcher
│   ├── sector/        # 섹터 관련 컴포넌트
│   ├── stock/         # 종목 관련 컴포넌트
│   └── ui/            # 공통 UI (Card, Badge, Button, Tooltip)
├── data/              # Mock 데이터
├── i18n/              # 다국어 설정 및 번역 파일
├── pages/             # 페이지 컴포넌트 (Home, StockDetail, GuruDetail)
├── types/             # TypeScript 타입 정의
├── App.tsx            # 라우터 설정 및 레이아웃
├── main.tsx           # 앱 엔트리포인트
└── globals.css        # 글로벌 스타일
```
