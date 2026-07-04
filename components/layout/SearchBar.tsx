"use client";

import { useEffect, useRef, useState } from "react";
import { searchStocks } from "@/lib/mockData";
import { formatPct, signClass } from "@/lib/format";
import type { Stock } from "@/lib/types";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  onSelect,
}: {
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results: Stock[] = query.trim() ? searchStocks(query) : [];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function choose(code: string) {
    onSelect(code);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active].code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.field}>
        <svg className={styles.icon} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className={styles.input}
          placeholder="종목명 또는 코드 검색 (예: 삼성전자, 005930)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="종목 검색"
        />
        <kbd className={styles.kbd}>⌘K</kbd>
      </div>

      {open && results.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {results.map((s, i) => (
            <li
              key={s.code}
              role="option"
              aria-selected={i === active}
              className={`${styles.item} ${i === active ? styles.itemActive : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s.code);
              }}
            >
              <span className={styles.badge} data-market={s.market}>
                {s.market}
              </span>
              <span className={styles.name}>{s.name}</span>
              <span className={`${styles.code} mono`}>{s.code}</span>
              <span className={`${styles.price} mono`}>{s.price.toLocaleString("ko-KR")}</span>
              <span className={`${styles.chg} mono ${signClass(s.changePct)}`}>
                {formatPct(s.changePct)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
      )}
    </div>
  );
}
