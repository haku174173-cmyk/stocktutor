"use client";

import SearchBar from "./SearchBar";
import Watchlist from "./Watchlist";
import styles from "./Header.module.css";

export default function Header({
  onSelectStock,
}: {
  onSelectStock: (code: string) => void;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo placeholder */}
        <a className={styles.logo} href="#" aria-label="StockTutor 홈">
          <span className={styles.mark}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                d="M3 17.5 9 11l4 3.2L21 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="21" cy="6" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span className={styles.wordmark}>
            Stock<b>Tutor</b>
            <em className={styles.ai}>AI</em>
          </span>
        </a>

        <SearchBar onSelect={onSelectStock} />

        <Watchlist onSelect={onSelectStock} />
      </div>
    </header>
  );
}
