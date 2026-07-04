"use client";

import { getAiPicks } from "@/lib/mockData";
import styles from "./Cards.module.css";

export default function AiPicksCard({
  selectedCode,
  onSelect,
}: {
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const picks = getAiPicks();

  return (
    <div className={`panel ${styles.card} ${styles.ai}`}>
      <div className={styles.head}>
        <div className={styles.title}>
          <span className={styles.titleIcon}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
              <path
                d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"
                fill="currentColor"
              />
              <circle cx="18.5" cy="17.5" r="1.6" fill="currentColor" />
            </svg>
          </span>
          AI 추천 종목 <span className="mono" style={{ color: "var(--text-mid)", fontWeight: 600 }}>TOP 5</span>
        </div>
        <span className={styles.chip}>추천 확률순</span>
      </div>

      <ul className={styles.list}>
        {picks.map((s, i) => (
          <li key={s.code}>
            <button
              className={`${styles.row} ${s.code === selectedCode ? styles.rowActive : ""}`}
              onClick={() => onSelect(s.code)}
            >
              <span className={`${styles.rank} ${i === 0 ? styles.rankTop : ""}`}>{i + 1}</span>
              <span className={styles.info}>
                <span className={styles.name}>
                  <span className={styles.nameText}>{s.name}</span>
                  <span className={styles.recTag}>{s.reasonTag}</span>
                </span>
                <span className={styles.sub}>
                  <span className={styles.subCode}>{s.code}</span>
                  <span>·</span>
                  <span>{s.market}</span>
                </span>
              </span>
              <span className={styles.probWrap}>
                <span className={styles.probBar}>
                  <span className={styles.probFill} style={{ width: `${s.recommendPct}%` }} />
                </span>
                <span className={styles.probVal}>{s.recommendPct}%</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
