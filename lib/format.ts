// Shared formatters for KRW prices, percentages, and large volumes.

export function formatPrice(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatPct(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/** 12,345,678 → "1,234만" / "1.2억" 근사 (거래량 축약). */
export function formatVolume(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;
  return n.toLocaleString("ko-KR");
}

/** Color class name based on sign (Korean convention: up=red, down=blue). */
export function signClass(n: number): string {
  if (n > 0) return "c-up";
  if (n < 0) return "c-down";
  return "c-flat";
}
