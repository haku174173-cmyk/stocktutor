"use client";

import dynamic from "next/dynamic";
import { getStockDetail } from "@/lib/mockData";
import { formatPct, formatPrice, signClass } from "@/lib/format";
import TopMoversCard from "./TopMoversCard";
import AiPicksCard from "./AiPicksCard";
import PlaceholderCard from "./PlaceholderCard";
import AiAnalysisPanel from "./AiAnalysisPanel";
import styles from "./ChartAnalysisTab.module.css";

// lightweight-charts touches the DOM/window — client-only, no SSR.
const StockChart = dynamic(() => import("./StockChart"), {
  ssr: false,
  loading: () => <div className={styles.chartLoading}>차트 로딩 중…</div>,
});

export default function ChartAnalysisTab({
  selectedCode,
  onSelect,
}: {
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const detail = getStockDetail(selectedCode);

  return (
    <div className={styles.tab}>
      {/* Top row: 급등 / AI 추천 / placeholder */}
      <section className={styles.cardsRow}>
        <TopMoversCard selectedCode={selectedCode} onSelect={onSelect} />
        <AiPicksCard selectedCode={selectedCode} onSelect={onSelect} />
        <PlaceholderCard />
      </section>

      {/* Analysis container */}
      {detail && (
        <section className={styles.container} key={selectedCode}>
          <div className={styles.left}>
            <div className={styles.stockHead}>
              <div className={styles.stockId}>
                <span className={styles.badge} data-market={detail.stock.market}>
                  {detail.stock.market}
                </span>
                <h2 className={styles.stockName}>{detail.stock.name}</h2>
                <span className={`${styles.stockCode} mono`}>{detail.stock.code}</span>
              </div>
              <div className={styles.stockQuote}>
                <span className={`${styles.price} mono`}>
                  {formatPrice(detail.stock.price)}
                  <em>원</em>
                </span>
                <span className={`${styles.change} mono ${signClass(detail.stock.changePct)}`}>
                  {formatPct(detail.stock.changePct)}
                </span>
              </div>
            </div>
            <StockChart detail={detail} />
          </div>

          <div className={styles.right}>
            <AiAnalysisPanel stock={detail.stock} analysis={detail.analysis} />
          </div>
        </section>
      )}
    </div>
  );
}
