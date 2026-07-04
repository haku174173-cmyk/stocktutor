// ============================================================
// Mock data layer.
//
// Every export here is the seam where a real backend / XGBoost
// model would plug in. Swap the bodies for `fetch(...)` calls and
// the UI keeps working unchanged. Data is deterministic per code
// (seeded PRNG) so reloads are stable.
// ============================================================

import type {
  AiAnalysis,
  AiPick,
  Candle,
  MacdSeries,
  MaSeries,
  Stock,
  StockDetail,
  TopMover,
  Trend,
} from "./types";

// ---- Stock universe -------------------------------------------------

interface Seed {
  code: string;
  name: string;
  market: "KOSPI" | "KOSDAQ";
  base: number; // 기준가 (원)
  drift: number; // 장기 추세 (-1 하락 ~ 1 상승)
  vol: number; // 변동성 (0.01 ~ 0.05)
}

const UNIVERSE: Seed[] = [
  { code: "005930", name: "삼성전자", market: "KOSPI", base: 78600, drift: 0.35, vol: 0.016 },
  { code: "000660", name: "SK하이닉스", market: "KOSPI", base: 201000, drift: 0.6, vol: 0.026 },
  { code: "373220", name: "LG에너지솔루션", market: "KOSPI", base: 342000, drift: -0.2, vol: 0.03 },
  { code: "247540", name: "에코프로비엠", market: "KOSDAQ", base: 168500, drift: 0.75, vol: 0.045 },
  { code: "086520", name: "에코프로", market: "KOSDAQ", base: 96700, drift: 0.55, vol: 0.05 },
  { code: "035420", name: "NAVER", market: "KOSPI", base: 189000, drift: 0.1, vol: 0.022 },
  { code: "035720", name: "카카오", market: "KOSPI", base: 41250, drift: -0.35, vol: 0.028 },
  { code: "005380", name: "현대차", market: "KOSPI", base: 254500, drift: 0.25, vol: 0.02 },
  { code: "051910", name: "LG화학", market: "KOSPI", base: 312000, drift: -0.15, vol: 0.027 },
  { code: "207940", name: "삼성바이오로직스", market: "KOSPI", base: 812000, drift: 0.3, vol: 0.019 },
  { code: "068270", name: "셀트리온", market: "KOSPI", base: 187300, drift: 0.4, vol: 0.024 },
  { code: "323410", name: "카카오뱅크", market: "KOSPI", base: 24150, drift: -0.1, vol: 0.03 },
  { code: "042700", name: "한미반도체", market: "KOSPI", base: 143200, drift: 0.85, vol: 0.042 },
  { code: "277810", name: "레인보우로보틱스", market: "KOSDAQ", base: 218000, drift: 0.7, vol: 0.048 },
  { code: "196170", name: "알테오젠", market: "KOSDAQ", base: 312500, drift: 0.65, vol: 0.04 },
  { code: "091990", name: "셀트리온헬스케어", market: "KOSDAQ", base: 74800, drift: 0.2, vol: 0.03 },
];

// ---- Seeded PRNG ----------------------------------------------------

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Date helpers ---------------------------------------------------

const TODAY = new Date("2026-06-27T00:00:00");

/** N most-recent weekdays ending at TODAY, ascending "YYYY-MM-DD". */
function tradingDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date(TODAY);
  while (out.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      out.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

// ---- Candle generation ----------------------------------------------

const DAYS = 260; // ~1년치 거래일
const dates = tradingDays(DAYS);

function roundTick(p: number): number {
  // 국내 호가단위 근사
  if (p >= 500000) return Math.round(p / 1000) * 1000;
  if (p >= 100000) return Math.round(p / 500) * 500;
  if (p >= 50000) return Math.round(p / 100) * 100;
  if (p >= 10000) return Math.round(p / 50) * 50;
  if (p >= 5000) return Math.round(p / 10) * 10;
  return Math.round(p / 5) * 5;
}

function generateCandles(seed: Seed): Candle[] {
  const rand = mulberry32(hashSeed(seed.code));
  const candles: Candle[] = [];
  let price = seed.base * (0.7 + rand() * 0.15); // 1년 전 시작가
  const driftPerDay = (seed.drift * 0.0009);

  for (let i = 0; i < DAYS; i++) {
    // random walk with drift + occasional shocks + gentle cyclicality
    const cycle = Math.sin((i / DAYS) * Math.PI * 3) * seed.vol * 0.4;
    const shock = rand() < 0.05 ? (rand() - 0.5) * seed.vol * 6 : 0;
    const ret = driftPerDay + cycle + (rand() - 0.5) * 2 * seed.vol + shock;

    const open = price;
    let close = open * (1 + ret);
    const hi = Math.max(open, close) * (1 + rand() * seed.vol);
    const lo = Math.min(open, close) * (1 - rand() * seed.vol);

    close = roundTick(close);
    const baseVol = 800_000 + rand() * 4_000_000;
    const volSpike = Math.abs(ret) > seed.vol * 1.5 ? 1.6 + rand() * 2.2 : 1;

    candles.push({
      time: dates[i],
      open: roundTick(open),
      high: roundTick(hi),
      low: roundTick(lo),
      close,
      volume: Math.round(baseVol * volSpike),
    });
    price = close;
  }
  return candles;
}

// ---- Indicators -----------------------------------------------------

const MA_COLORS: Record<number, string> = {
  5: "#ffd166",
  20: "#2ee6c4",
  60: "#4d8dff",
  120: "#b39ddb",
};

function sma(closes: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i];
    if (i >= period) sum -= closes[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

function buildMa(candles: Candle[]): MaSeries[] {
  const closes = candles.map((c) => c.close);
  return ([5, 20, 60, 120] as const).map((period) => {
    const series = sma(closes, period);
    return {
      period,
      color: MA_COLORS[period],
      points: candles
        .map((c, i) => ({ time: c.time, value: series[i] }))
        .filter((p): p is { time: string; value: number } => p.value !== null),
    };
  });
}

function buildMacd(candles: Candle[]): MacdSeries {
  const closes = candles.map((c) => c.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = closes.map((_, i) => ema12[i] - ema26[i]);
  const signalLine = ema(macdLine, 9);
  return {
    macd: candles.map((c, i) => ({ time: c.time, value: macdLine[i] })),
    signal: candles.map((c, i) => ({ time: c.time, value: signalLine[i] })),
    histogram: candles.map((c, i) => ({ time: c.time, value: macdLine[i] - signalLine[i] })),
  };
}

/** Find the most recent 5>20 golden cross date, if any (last 40 days). */
function findGoldenCross(ma: MaSeries[]): string | undefined {
  const ma5 = ma.find((m) => m.period === 5)!.points;
  const ma20 = ma.find((m) => m.period === 20)!.points;
  const map20 = new Map(ma20.map((p) => [p.time, p.value]));
  const merged = ma5
    .map((p) => ({ time: p.time, v5: p.value, v20: map20.get(p.time) }))
    .filter((p): p is { time: string; v5: number; v20: number } => p.v20 !== undefined);

  for (let i = merged.length - 1; i > 0 && i > merged.length - 40; i--) {
    const prev = merged[i - 1];
    const cur = merged[i];
    if (prev.v5 <= prev.v20 && cur.v5 > cur.v20) return cur.time;
  }
  return undefined;
}

// ---- AI analysis derivation ----------------------------------------

function pct(a: number, b: number): number {
  return ((a - b) / b) * 100;
}

function deriveAnalysis(seed: Seed, candles: Candle[], ma: MaSeries[]): AiAnalysis {
  const rand = mulberry32(hashSeed(seed.code + "ai"));
  const last = candles[candles.length - 1];
  const closes = candles.map((c) => c.close);

  const maNow = ([5, 20, 60, 120] as const).map((p) => {
    const s = ma.find((m) => m.period === p)!.points;
    return s[s.length - 1]?.value ?? last.close;
  });
  const [m5, m20, m60, m120] = maNow;

  // trend: compare recent slope of ma20
  const ma20pts = ma.find((m) => m.period === 20)!.points;
  const slope = pct(
    ma20pts[ma20pts.length - 1].value,
    ma20pts[Math.max(0, ma20pts.length - 11)].value,
  );

  let trend: Trend;
  if (slope > 2.5) trend = "상승";
  else if (slope < -2.5) trend = "하락";
  else trend = "횡보";

  // trend probabilities biased by slope
  const up = Math.round(Math.min(88, Math.max(12, 50 + slope * 3 + (rand() - 0.5) * 8)));
  const down = Math.round(Math.min(80, Math.max(8, 45 - slope * 2.5 + (rand() - 0.5) * 8)));
  const flat = Math.max(4, 100 - up - down);
  const norm = up + down + flat;
  const trendProb = {
    up: Math.round((up / norm) * 100),
    flat: Math.round((flat / norm) * 100),
    down: Math.round((down / norm) * 100),
  };

  // moving-average alignment
  const maBullish = m5 >= m20 && m20 >= m60 && m60 >= m120;
  const maOrder = [
    { p: 5, v: m5 },
    { p: 20, v: m20 },
    { p: 60, v: m60 },
    { p: 120, v: m120 },
  ]
    .sort((a, b) => b.v - a.v)
    .map((x) => x.p)
    .join(" > ");

  // position relative to nearby swing low/high (last 20d)
  const recent = candles.slice(-20);
  const swingLow = Math.min(...recent.map((c) => c.low));
  const swingHigh = Math.max(...recent.map((c) => c.high));
  const rangePos = (last.close - swingLow) / Math.max(1, swingHigh - swingLow);
  let position: string;
  if (rangePos < 0.25) position = "지지선 근처";
  else if (rangePos > 0.78) position = "저항선 근처";
  else if (Math.abs(last.close - m20) / m20 < 0.01) position = "20일선 지지 테스트";
  else position = "박스권 중단";

  // volume vs 20d avg
  const avgVol = recent.reduce((s, c) => s + c.volume, 0) / recent.length;
  const volPct = Math.round(pct(last.volume, avgVol));
  const volumeNote = `평균 대비 ${volPct >= 0 ? "+" : ""}${volPct}%`;

  // orderbook pressure (mock)
  const stars = Math.max(2, Math.min(5, Math.round(3 + slope / 4 + (rand() - 0.4) * 2)));
  const orderbook = {
    label: stars >= 4 ? "매수벽 우세" : stars <= 2 ? "매도벽 우세" : "매수·매도 균형",
    stars,
  };

  // verdict
  const gcTime = findGoldenCross(ma);
  let action: AiAnalysis["verdict"]["action"];
  let confidence: number;
  if (trend === "상승" && rangePos < 0.4) {
    action = "매수";
    confidence = 74 + Math.round(rand() * 12);
  } else if (trend === "상승" && rangePos > 0.75) {
    action = "익절 추천";
    confidence = 68 + Math.round(rand() * 12);
  } else if (trend === "상승") {
    action = "홀딩";
    confidence = 70 + Math.round(rand() * 12);
  } else if (trend === "횡보") {
    action = "매수 대기";
    confidence = 72 + Math.round(rand() * 12);
  } else {
    action = "관망";
    confidence = 66 + Math.round(rand() * 14);
  }

  // entry / stop / target zones
  const entryLow = roundTick(Math.min(m20, m5) * 0.99);
  const entryHigh = roundTick(Math.max(m5, last.close) * 1.005);
  const stopLoss = roundTick(swingLow * 0.985);
  const takeProfit = roundTick(last.close * (1 + Math.max(0.06, seed.vol * 4)));

  const explanation = buildExplanation({
    name: seed.name,
    trend,
    position,
    maBullish,
    volPct,
    orderbook: orderbook.label,
    gc: !!gcTime,
    action,
  });

  return {
    trend,
    trendProb,
    position,
    maOrder,
    maBullish,
    volumeNote,
    orderbook,
    verdict: { action, confidence },
    explanation,
    entryZone: { low: entryLow, high: entryHigh },
    stopLoss,
    takeProfit,
    goldenCrossTime: gcTime,
  };
}

function buildExplanation(a: {
  name: string;
  trend: Trend;
  position: string;
  maBullish: boolean;
  volPct: number;
  orderbook: string;
  gc: boolean;
  action: string;
}): string {
  const parts: string[] = [];
  parts.push(
    `${a.name}은(는) 현재 ${a.trend} 추세로, 단기 이동평균선 기준 ${a.position}에 위치해 있습니다.`,
  );
  if (a.maBullish) {
    parts.push("5·20·60·120일선이 정배열을 이루어 중기 상승 구조가 유효합니다.");
  } else {
    parts.push("이동평균선이 아직 정배열을 완성하지 못해 방향성 확인이 필요합니다.");
  }
  if (a.gc) parts.push("최근 단기 골든크로스가 발생해 매수 심리가 개선되는 구간입니다.");
  parts.push(
    `거래량은 20일 평균 대비 ${a.volPct >= 0 ? "+" : ""}${a.volPct}% 수준이며, 호가는 ${a.orderbook} 상태입니다.`,
  );
  const tail: Record<string, string> = {
    매수: "지지 구간에서의 분할 매수 접근이 유효하며, 손절 라인을 반드시 준수하는 단타 전략을 권장합니다.",
    "익절 추천": "단기 과열 신호가 감지되어 분할 익절로 수익을 확정하는 것이 유리합니다.",
    홀딩: "추세가 살아있어 기존 보유 물량은 홀딩하되 이탈 시 대응이 필요합니다.",
    "매수 대기": "박스권 상단 돌파 또는 거래량 동반 반등을 확인한 뒤 진입하는 것이 안전합니다.",
    관망: "하락 추세가 우세해 신규 진입보다는 관망하며 추세 전환 신호를 기다리는 것이 바람직합니다.",
  };
  parts.push(tail[a.action] ?? "");
  return parts.join(" ");
}

// ---- Assemble detail per stock (cached) -----------------------------

const detailCache = new Map<string, StockDetail>();

function buildDetail(seed: Seed): StockDetail {
  const cached = detailCache.get(seed.code);
  if (cached) return cached;

  const candles = generateCandles(seed);
  const ma = buildMa(candles);
  const macd = buildMacd(candles);
  const analysis = deriveAnalysis(seed, candles, ma);
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const detail: StockDetail = {
    stock: {
      code: seed.code,
      name: seed.name,
      market: seed.market,
      price: last.close,
      changePct: +pct(last.close, prev.close).toFixed(2),
    },
    candles,
    ma,
    macd,
    analysis,
  };
  detailCache.set(seed.code, detail);
  return detail;
}

// ---- Public API (swap these for real fetches) -----------------------

export function listStocks(): Stock[] {
  return UNIVERSE.map((s) => buildDetail(s).stock);
}

export function getStockDetail(code: string): StockDetail | undefined {
  const seed = UNIVERSE.find((s) => s.code === code);
  return seed ? buildDetail(seed) : undefined;
}

export function searchStocks(query: string): Stock[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listStocks()
    .filter((s) => s.name.toLowerCase().includes(q) || s.code.includes(q))
    .slice(0, 8);
}

/** 급등 종목 Top5 — 등락률 기준 상위. */
export function getTopMovers(): TopMover[] {
  return UNIVERSE.map((s) => {
    const d = buildDetail(s);
    const last = d.candles[d.candles.length - 1];
    const recent = d.candles.slice(-20);
    const avgVol = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
    return {
      ...d.stock,
      volume: last.volume,
      volumeVsAvgPct: Math.round(pct(last.volume, avgVol)),
    };
  })
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5);
}

/** AI 추천 종목 Top5 — 추천 확률 기준 상위. */
export function getAiPicks(): AiPick[] {
  return UNIVERSE.map((s) => {
    const d = buildDetail(s);
    const a = d.analysis;
    const recommendPct = a.verdict.confidence;
    const reasonTag = a.goldenCrossTime
      ? "골든크로스 발생"
      : a.maBullish
        ? "이평선 정배열"
        : a.trend === "상승"
          ? "상승 추세 지속"
          : a.orderbook.label;
    return { ...d.stock, recommendPct, reasonTag };
  })
    .filter((p) => p.recommendPct >= 70)
    .sort((a, b) => b.recommendPct - a.recommendPct)
    .slice(0, 5);
}

/** 관심종목 (mock — 실제로는 유저 저장소). */
export function getWatchlist(): Stock[] {
  const codes = ["005930", "000660", "042700", "247540"];
  return codes
    .map((c) => getStockDetail(c)?.stock)
    .filter((s): s is Stock => !!s);
}

/** 기본 선택 종목. */
export const DEFAULT_CODE = "042700";
