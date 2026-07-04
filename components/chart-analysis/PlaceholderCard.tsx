"use client";

import styles from "./PlaceholderCard.module.css";

export default function PlaceholderCard() {
  return (
    <div className={`panel ${styles.card}`}>
      <div className={styles.inner}>
        <span className={styles.icon}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <p className={styles.title}>추가 위젯 영역</p>
        <p className={styles.desc}>
          섹터 히트맵 · 수급 동향 · 뉴스 감성분석 등<br />
          다음 업데이트에서 채워질 공간입니다.
        </p>
        <span className={styles.tag}>준비 중</span>
      </div>
    </div>
  );
}
