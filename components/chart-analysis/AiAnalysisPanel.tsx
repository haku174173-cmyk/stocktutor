"use client";

import type { AiAnalysis, Stock } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import styles from "./AiAnalysisPanel.module.css";

const TREND_CLASS: Record<AiAnalysis["trend"], string> = {
  상승: styles.up,
  횡보: styles.flat,
  하락: styles.down,
};

const VERDICT_TONE: Record<string, string> = {
  매수: styles.toneBuy,
  "매수 대기": styles.toneWait,
  홀딩: styles.toneHold,
  "익절 추천": styles.toneTake,
  관망: styles.toneWatch,
};

function Stars({ n }: { n: number }) {
  return (
    <span className={styles.stars} aria-label={`${n} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? styles.starOn : styles.starOff}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AiAnalysisPanel({
  stock,
  analysis,
}: {
  stock: Stock;
  analysis: AiAnalysis;
}) {
  const { trendProb, verdict } = analysis;

  return (
    <div className={`panel ${styles.panel}`}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headTitle}>
          <span className={styles.aiDot} />
          <span>AI 분석 카드</span>
        </div>
        <span className={styles.headSub}>단타 트레이딩 관점</span>
      </div>

      {/* Trend hero */}
      <div className={styles.trendBlock}>
        <div className={styles.trendTop}>
          <span className="eyebrow">현재 추세</span>
          <span className={`${styles.trendBadge} ${TREND_CLASS[analysis.trend]}`}>
            {analysis.trend}
          </span>
        </div>
        <div className={styles.probRow}>
          <Prob label="상승" value={trendProb.up} cls={styles.pUp} />
          <Prob label="횡보" value={trendProb.flat} cls={styles.pFlat} />
          <Prob label="하락" value={trendProb.down} cls={styles.pDown} />
        </div>
      </div>

      {/* Metric grid */}
      <div className={styles.metrics}>
        <Metric label="현재 위치" value={analysis.position} />
        <Metric
          label="이평선 배열"
          value={<span className="mono">{analysis.maOrder}</span>}
          tag={analysis.maBullish ? { text: "정배열", cls: styles.tagGood } : { text: "혼조", cls: styles.tagWarn }}
        />
        <Metric label="거래량" value={<span className="mono">{analysis.volumeNote}</span>} />
        <Metric
          label="호가"
          value={
            <span className={styles.orderbook}>
              {analysis.orderbook.label} <Stars n={analysis.orderbook.stars} />
            </span>
          }
        />
      </div>

      {/* Verdict */}
      <div className={`${styles.verdict} ${VERDICT_TONE[verdict.action] ?? ""}`}>
        <div className={styles.verdictHead}>
          <span className="eyebrow">AI 종합 판단</span>
          <span className={`${styles.confidence} mono`}>{verdict.confidence}%</span>
        </div>
        <div className={styles.verdictAction}>{verdict.action}</div>
        <div className={styles.confBar}>
          <span className={styles.confFill} style={{ width: `${verdict.confidence}%` }} />
        </div>
      </div>

      {/* Trade levels */}
      <div className={styles.levels}>
        <Level label="매수 관심" color="ai" value={`${formatPrice(analysis.entryZone.low)} ~ ${formatPrice(analysis.entryZone.high)}`} />
        <Level label="익절 목표" color="up" value={`${formatPrice(analysis.takeProfit)}원`} />
        <Level label="손절 라인" color="down" value={`${formatPrice(analysis.stopLoss)}원`} />
      </div>

      {/* Explanation */}
      <div className={styles.explain}>
        <span className="eyebrow">AI 설명</span>
        <p>{analysis.explanation}</p>
      </div>

      <p className={styles.disclaimer}>
        ※ 본 분석은 과거 데이터 학습 기반의 참고 정보이며 투자 판단의 책임은 본인에게 있습니다.
      </p>
    </div>
  );
}

function Prob({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={styles.prob}>
      <div className={styles.probHead}>
        <span>{label}</span>
        <span className="mono">{value}%</span>
      </div>
      <div className={styles.probTrack}>
        <span className={`${styles.probBar} ${cls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tag,
}: {
  label: string;
  value: React.ReactNode;
  tag?: { text: string; cls: string };
}) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>
        {value}
        {tag && <span className={`${styles.tag} ${tag.cls}`}>{tag.text}</span>}
      </span>
    </div>
  );
}

function Level({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "up" | "down" | "ai";
}) {
  return (
    <div className={`${styles.level} ${styles[`level_${color}`]}`}>
      <span className={styles.levelLabel}>{label}</span>
      <span className={`${styles.levelValue} mono`}>{value}</span>
    </div>
  );
}
