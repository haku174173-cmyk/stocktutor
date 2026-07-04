# StockTutor — AI 주식 동향 예측 홈페이지

XGBoost 기반 AI가 5~10년치 차트·호가·거래량을 학습해 추천 종목과 근거(상승/횡보/하락 %,
손절·익절 구간)를 제시하는 대시보드. **현재 단계는 프론트엔드 UI + 목업 데이터**이며, ML/데이터
파이프라인은 아직 없다.

## 기술 스택
- **Next.js 14 (App Router) + React 18 + TypeScript**
- **lightweight-charts v4** (TradingView) — 캔들·거래량·이평선·MACD·마커·가격선
- 스타일: CSS Modules + `app/globals.css`의 CSS 변수 토큰
- 폰트: Pretendard(한글) + IBM Plex Mono(숫자) — CDN import
- 디자인: 다크 트레이딩 터미널, 상승=빨강(`--up`)/하락=파랑(`--down`), AI 시그니처=민트(`--ai`)

## 실행
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 타입체크 + 프로덕션 빌드
```

## 구조
- `app/page.tsx` — 클라이언트 루트. `activeTab`, `selectedCode` 상태 보유.
- `app/globals.css` — 색/폰트/반경 등 전역 디자인 토큰. 색은 반드시 여기 변수를 사용.
- `components/layout/` — `Header`(로고/`SearchBar`/`Watchlist`), `Tabs`(스티키).
- `components/chart-analysis/` — `ChartAnalysisTab`(상단 3카드 + 3/5·2/5 컨테이너),
  `TopMoversCard`·`AiPicksCard`·`PlaceholderCard`, `StockChart`(lightweight-charts, `ssr:false`
  동적 임포트), `AiAnalysisPanel`(AI 분석 카드).
- `components/invest-analysis/InvestAnalysisTab.tsx` — "내 투자분석" 탭 placeholder.
- `lib/types.ts` — 도메인 타입.
- `lib/mockData.ts` — **목업 데이터 계층. 실제 API/모델 교체 지점.** 시드 PRNG로 종목별
  캔들·이평선·MACD·AI분석을 결정론적으로 생성. `getTopMovers`/`getAiPicks`/`getStockDetail`/
  `searchStocks`/`getWatchlist`를 `fetch(...)`로 바꾸면 백엔드 연동 완료.
- `lib/format.ts` — 가격/퍼센트/거래량 포매터, `signClass`(등락 색상).

## 규칙
- 색상은 항상 `globals.css`의 CSS 변수를 사용(하드코딩 지양). 단, `StockChart.tsx`는
  lightweight-charts에 JS 값이 필요해 상단 상수로 테마색을 복제해 둠 — 토큰 변경 시 함께 수정.
- 한국 관례상 **상승=빨강, 하락=파랑**.
- 컴포넌트는 CSS Module과 1:1 짝을 이룸(`Foo.tsx` + `Foo.module.css`).

## TODO (다음 단계)
- 실제 시세/차트 데이터 소스 및 XGBoost 서빙 API 연동(`lib/mockData.ts` 교체)
- "내 투자분석" 탭 실제 구현(보유종목·리밸런싱·매매일지)
- placeholder 카드(섹터 히트맵/수급/뉴스 감성) 채우기
