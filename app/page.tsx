"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Tabs, { type TabKey } from "@/components/layout/Tabs";
import ChartAnalysisTab from "@/components/chart-analysis/ChartAnalysisTab";
import InvestAnalysisTab from "@/components/invest-analysis/InvestAnalysisTab";
import { DEFAULT_CODE } from "@/lib/mockData";
import styles from "./page.module.css";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("ai-chart");
  const [selectedCode, setSelectedCode] = useState<string>(DEFAULT_CODE);

  return (
    <div className={styles.shell}>
      <Header
        onSelectStock={(code) => {
          setSelectedCode(code);
          setActiveTab("ai-chart");
        }}
      />
      <Tabs active={activeTab} onChange={setActiveTab} />

      <main className={styles.main}>
        {activeTab === "ai-chart" ? (
          <ChartAnalysisTab
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
          />
        ) : (
          <InvestAnalysisTab />
        )}
      </main>
    </div>
  );
}
