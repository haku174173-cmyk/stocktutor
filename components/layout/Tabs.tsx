"use client";

import styles from "./Tabs.module.css";

export type TabKey = "ai-chart" | "my-invest";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "ai-chart",
    label: "AI 차트분석",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path d="M4 19V5M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 15l3-4 3 2 4-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "my-invest",
    label: "내 투자분석",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 12V5M12 12l5 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <nav className={styles.tabs}>
      <div className={styles.inner}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${active === t.key ? styles.active : ""}`}
            onClick={() => onChange(t.key)}
            aria-current={active === t.key}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
