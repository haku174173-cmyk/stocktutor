"use client";

import { getTopMovers } from "@/lib/mockData";
import { formatPct, formatVolume, signClass } from "@/lib/format";
import styles from "./Cards.module.css";

export default function TopMoversCard({
  selectedCode,
  onSelect,
}: {
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const movers = getTopMovers();

  return (
    <div className={`panel ${styles.card} ${styles.hot}`}>
      <div className={styles.head}>
        <div className={styles.title}>
          <span className={styles.titleIcon}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
              <path
                d="M13 2 5 13h5l-1 9 8-12h-5l1-8z"
                fill="currentColor"
              />
            </svg>
          </span>
          급등 종목 <span className="mono" style={{ color: "var(--text-mid)", fontWeight: 600 }}>TOP 5</span>
        </div>
        <span className={styles.chip}>거래량 급증</span>
      </div>

      <ul className={styles.list}>
        {movers.map((s, i) => (
          <li key={s.code}>
            <button
              className={`${styles.row} ${s.code === selectedCode ? styles.rowActive : ""}`}
              onClick={() => onSelect(s.code)}
            >
              <span className={`${styles.rank} ${i === 0 ? styles.rankTop : ""}`}>{i + 1}</span>
              <span className={styles.info}>
                <span className={styles.name}>
                  <span className={styles.nameText}>{s.name}</span>
                </span>
                <span className={styles.sub}>
                  <span className={styles.subCode}>{s.code}</span>
                  <span>·</span>
                  <span>거래량 {formatVolume(s.volume)}</span>
                </span>
              </span>
              <span className={styles.nums}>
                <span className={`${styles.metric} ${signClass(s.changePct)}`}>
                  {formatPct(s.changePct)}
                </span>
                <span className={styles.metricSub}>
                  평균比 {s.volumeVsAvgPct >= 0 ? "+" : ""}
                  {s.volumeVsAvgPct}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
