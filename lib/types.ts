// ============================================================
// Domain types. Mock data conforms to these so a real API /
// XGBoost model response can be swapped in without UI changes.
// ============================================================

export type Market = "KOSPI" | "KOSDAQ";

/** Trend classification from the model. */
export type Trend = "상승" | "횡보" | "하락";

/** Base identity + last quote for a stock. */
export interface Stock {
  code: string; // 6-digit ticker, e.g. "005930"
  name: string; // 종목명
  market: Market;
  price: number; // 현재가 (KRW)
  changePct: number; // 전일 대비 등락률 (%)
}

/** 급등 종목 — includes volume context. */
export interface TopMover extends Stock {
  volume: number; // 거래량 (주)
  volumeVsAvgPct: number; // 평균 대비 거래량 (%)
}

/** AI 추천 종목 — includes recommendation confidence. */
export interface AiPick extends Stock {
  recommendPct: number; // 추천 확률 (%)
  reasonTag: string; // 짧은 근거 태그, 예: "골든크로스 임박"
}

/** One OHLCV candle. `time` is "YYYY-MM-DD" (lightweight-charts business day). */
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** 종합 판단 액션 (색/문구 매핑에 사용). */
export type VerdictAction = "매수 대기" | "홀딩" | "익절 추천" | "매수" | "관망";

/** AI 분석 카드에 표시되는 모든 근거. */
export interface AiAnalysis {
  trend: Trend;
  trendProb: { up: number; flat: number; down: number }; // 상승/횡보/하락 확률 (합 100)
  position: string; // 현재 위치, 예: "지지선 근처"
  maOrder: string; // 이평선 배열, 예: "5 > 20 > 60 > 120"
  maBullish: boolean; // 정배열 여부
  volumeNote: string; // 예: "평균 대비 +150%"
  orderbook: { label: string; stars: number }; // 호가, 예: {"매수벽 우세", 4}
  verdict: { action: VerdictAction; confidence: number }; // 예: {"매수 대기", 80}
  explanation: string; // AI 설명 문단
  entryZone: { low: number; high: number }; // 매수 관심 구간
  stopLoss: number; // 손절가
  takeProfit: number; // 익절가
  goldenCrossTime?: string; // 골든크로스 발생 시점(있으면)
}

/** Moving-average overlays keyed by period. Each is a series of {time, value}. */
export interface MaSeries {
  period: 5 | 20 | 60 | 120;
  color: string;
  points: { time: string; value: number }[];
}

/** MACD sub-panel data. */
export interface MacdSeries {
  macd: { time: string; value: number }[];
  signal: { time: string; value: number }[];
  histogram: { time: string; value: number }[];
}

/** Everything needed to render the analysis container for one stock. */
export interface StockDetail {
  stock: Stock;
  candles: Candle[];
  ma: MaSeries[];
  macd: MacdSeries;
  analysis: AiAnalysis;
}
