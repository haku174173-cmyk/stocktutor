"use client";

import styles from "./InvestAnalysisTab.module.css";

const PREVIEW = [
  { title: "보유 종목 현황", desc: "평단가·수익률·비중을 한눈에" },
  { title: "AI 리밸런싱 제안", desc: "포트폴리오 위험도 진단 및 조정안" },
  { title: "매매일지 & 승률", desc: "내 단타 기록을 AI가 복기" },
];

export default function InvestAnalysisTab() {
  return (
    <div className={styles.tab}>
      <div className={styles.hero}>
        <span className={styles.badge}>준비 중</span>
        <h1 className={styles.title}>내 투자분석</h1>
        <p className={styles.lead}>
          내 계좌·관심종목을 연동해 AI가 포트폴리오를 진단하고
          <br />
          맞춤 매매 전략을 제안하는 공간입니다.
        </p>
      </div>

      <div className={styles.grid}>
        {PREVIEW.map((c, i) => (
          <div
            key={c.title}
            className={`panel ${styles.card}`}
            style={{ animationDelay: `${0.08 * i}s` }}
          >
            <span className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
              </svg>
            </span>
            <div className={styles.cardBody}>
              <p className={styles.cardTitle}>{c.title}</p>
              <p className={styles.cardDesc}>{c.desc}</p>
            </div>
            <div className={styles.skeleton}>
              <span style={{ width: "70%" }} />
              <span style={{ width: "45%" }} />
              <span style={{ width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
