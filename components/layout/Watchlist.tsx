"use client";

import { useEffect, useRef, useState } from "react";
import { getWatchlist } from "@/lib/mockData";
import { formatPct, formatPrice, signClass } from "@/lib/format";
import styles from "./Watchlist.module.css";

export default function Watchlist({
  onSelect,
}: {
  onSelect: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const items = getWatchlist();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path
            d="M12 4.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 16.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 4.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.label}>관심종목</span>
        <span className={styles.count}>{items.length}</span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className="eyebrow">내 관심종목</span>
            <span className={styles.hint}>클릭 시 분석</span>
          </div>
          <ul className={styles.list}>
            {items.map((s) => (
              <li key={s.code}>
                <button
                  className={styles.row}
                  onClick={() => {
                    onSelect(s.code);
                    setOpen(false);
                  }}
                >
                  <span className={styles.rowMain}>
                    <span className={styles.rowName}>{s.name}</span>
                    <span className={`${styles.rowCode} mono`}>{s.code}</span>
                  </span>
                  <span className={styles.rowNums}>
                    <span className={`${styles.rowPrice} mono`}>{formatPrice(s.price)}</span>
                    <span className={`${styles.rowChg} mono ${signClass(s.changePct)}`}>
                      {formatPct(s.changePct)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
