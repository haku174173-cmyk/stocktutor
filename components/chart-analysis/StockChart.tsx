"use client";

import { useEffect, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import type { StockDetail } from "@/lib/types";
import styles from "./StockChart.module.css";

const UP = "#ff5b5b";
const DOWN = "#4d8dff";
const GRID = "#141b26";
const TEXT = "#7d8b9e";
const AI = "#2ee6c4";

const baseOptions = {
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: TEXT,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: GRID },
    horzLines: { color: GRID },
  },
  rightPriceScale: { borderColor: "#1e2735" },
  timeScale: { borderColor: "#1e2735" },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { color: "#3a4a60", labelBackgroundColor: "#1c2636" },
    horzLine: { color: "#3a4a60", labelBackgroundColor: "#1c2636" },
  },
};

/** "YYYY-MM-DD" → object time accepted by lightweight-charts. */
function toTime(d: string): Time {
  const [y, m, day] = d.split("-").map(Number);
  return { year: y, month: m, day } as unknown as Time;
}

export default function StockChart({ detail }: { detail: StockDetail }) {
  const priceRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);
  const [visibleMa, setVisibleMa] = useState<Record<number, boolean>>({
    5: true,
    20: true,
    60: true,
    120: true,
  });
  const visibleMaRef = useRef(visibleMa);
  visibleMaRef.current = visibleMa;
  const maSeriesRef = useRef<Map<number, ISeriesApi<"Line">> | null>(null);

  // Toggle MA visibility without rebuilding the chart.
  function toggleMa(period: number) {
    setVisibleMa((prev) => {
      const next = { ...prev, [period]: !prev[period] };
      maSeriesRef.current?.get(period)?.applyOptions({ visible: next[period] });
      return next;
    });
  }

  useEffect(() => {
    if (!priceRef.current || !macdRef.current) return;

    const priceChart = createChart(priceRef.current, {
      ...baseOptions,
      height: 360,
      timeScale: { ...baseOptions.timeScale, visible: false },
    });
    const macdChart = createChart(macdRef.current, {
      ...baseOptions,
      height: 130,
    });

    // ---- Candles ----
    const candleSeries = priceChart.addCandlestickSeries({
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
      priceFormat: { type: "price", precision: 0, minMove: 1 },
    });
    candleSeries.setData(
      detail.candles.map((c) => ({
        time: toTime(c.time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.08, bottom: 0.26 },
    });

    // ---- Volume (overlay histogram at bottom) ----
    const volumeSeries = priceChart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });
    volumeSeries.setData(
      detail.candles.map((c) => ({
        time: toTime(c.time),
        value: c.volume,
        color: c.close >= c.open ? "rgba(255,91,91,0.32)" : "rgba(77,141,255,0.32)",
      })),
    );

    // ---- Moving averages ----
    const maSeriesMap = new Map<number, ReturnType<typeof priceChart.addLineSeries>>();
    for (const ma of detail.ma) {
      const s = priceChart.addLineSeries({
        color: ma.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        visible: visibleMaRef.current[ma.period],
      });
      s.setData(ma.points.map((p) => ({ time: toTime(p.time), value: p.value })));
      maSeriesMap.set(ma.period, s);
    }
    maSeriesRef.current = maSeriesMap;

    // ---- Golden cross marker ----
    if (detail.analysis.goldenCrossTime) {
      candleSeries.setMarkers([
        {
          time: toTime(detail.analysis.goldenCrossTime),
          position: "belowBar",
          color: AI,
          shape: "arrowUp",
          text: "골든크로스",
        },
      ]);
    }

    // ---- Stop-loss / take-profit / entry price lines ----
    const { stopLoss, takeProfit, entryZone } = detail.analysis;
    candleSeries.createPriceLine({
      price: takeProfit,
      color: UP,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "익절",
    });
    candleSeries.createPriceLine({
      price: entryZone.high,
      color: AI,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: "매수관심",
    });
    candleSeries.createPriceLine({
      price: stopLoss,
      color: DOWN,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "손절",
    });

    // ---- MACD ----
    const histSeries = macdChart.addHistogramSeries({
      priceFormat: { type: "price", precision: 0, minMove: 1 },
    });
    histSeries.setData(
      detail.macd.histogram.map((p) => ({
        time: toTime(p.time),
        value: p.value,
        color: p.value >= 0 ? "rgba(255,91,91,0.5)" : "rgba(77,141,255,0.5)",
      })),
    );
    const macdLine = macdChart.addLineSeries({
      color: "#ffd166",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    macdLine.setData(detail.macd.macd.map((p) => ({ time: toTime(p.time), value: p.value })));
    const signalLine = macdChart.addLineSeries({
      color: AI,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    signalLine.setData(detail.macd.signal.map((p) => ({ time: toTime(p.time), value: p.value })));

    // ---- Show most recent ~90 bars ----
    const total = detail.candles.length;
    priceChart.timeScale().setVisibleLogicalRange({ from: total - 90, to: total + 2 });

    // ---- Sync the two time scales ----
    let syncing = false;
    const sync = (from: IChartApi, to: IChartApi) => {
      from.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (syncing || !range) return;
        syncing = true;
        to.timeScale().setVisibleLogicalRange(range);
        syncing = false;
      });
    };
    sync(priceChart, macdChart);
    sync(macdChart, priceChart);

    // ---- Responsive ----
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (e.target === priceRef.current) priceChart.applyOptions({ width: w });
        if (e.target === macdRef.current) macdChart.applyOptions({ width: w });
      }
    });
    ro.observe(priceRef.current);
    ro.observe(macdRef.current);

    return () => {
      ro.disconnect();
      priceChart.remove();
      macdChart.remove();
      maSeriesRef.current = null;
    };
  }, [detail]);

  return (
    <div className={`panel ${styles.wrap}`}>
      {/* Legend / MA toggles */}
      <div className={styles.legend}>
        <span className={styles.legendGroup}>
          {detail.ma.map((ma) => (
            <button
              key={ma.period}
              className={`${styles.maToggle} ${visibleMa[ma.period] ? "" : styles.maOff}`}
              onClick={() => toggleMa(ma.period)}
              style={{ ["--ma" as string]: ma.color }}
            >
              <span className={styles.maDot} />
              MA{ma.period}
            </button>
          ))}
        </span>
        {detail.analysis.goldenCrossTime && (
          <span className={styles.gcTag}>
            <span className={styles.gcDot} /> 골든크로스 감지
          </span>
        )}
      </div>

      <div ref={priceRef} className={styles.priceChart} />
      <div className={styles.macdLabel}>
        MACD <span>(12, 26, 9)</span>
      </div>
      <div ref={macdRef} className={styles.macdChart} />
    </div>
  );
}
