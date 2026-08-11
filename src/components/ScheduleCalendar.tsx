"use client";

import { useMemo, useState } from "react";
import type { ScheduleEntry } from "@/types/microcms";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

// 日本時間(Asia/Tokyo)の日付フォーマッタ。
// en-CA ロケールは "YYYY-MM-DD" 形式で返ってくるため、そのままキーとして使えます。
const JST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * microCMSの日付フィールドは "2026-08-12T15:00:00.000Z" のような
 * 日付+時刻(UTC)の文字列で返ってくるため、日本時間の "YYYY-MM-DD" に変換します。
 * すでに "YYYY-MM-DD" 形式（時刻部分なし）の場合はそのまま扱います。
 */
function toJstDateKey(rawDate: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }
  return JST_DATE_FORMATTER.format(parsed);
}

/**
 * "鑑定可"ではなく"鑑定可能"のように、microCMS側の選択肢の文言が
 * 完全一致しないケースがあっても正しく色分けできるよう、
 * 部分一致で判定します（未設定の場合も考慮）。
 */
function classifyType(type: ScheduleEntry["type"] | null | undefined): "ok" | "ng" | "event" {
  const value = type ?? "";
  if (value.includes("イベント")) return "event";
  if (value.includes("鑑定可")) return "ok";
  return "ng";
}

function badgeClass(type: ScheduleEntry["type"]) {
  return `calendar__badge--${classifyType(type)}`;
}

function dotClass(type: ScheduleEntry["type"]) {
  return `calendar__dot--${classifyType(type)}`;
}

/** 開始・終了時刻とラベルから、バッジに表示する文言を組み立てます */
function badgeText(entry: ScheduleEntry) {
  let timeRange: string | null = null;
  if (entry.startTime && entry.endTime) {
    timeRange = `${entry.startTime}〜${entry.endTime}`;
  } else if (entry.startTime) {
    timeRange = `${entry.startTime}〜`;
  } else if (entry.endTime) {
    timeRange = `〜${entry.endTime}`;
  }

  const parts = [timeRange, entry.label].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }
  // 時刻もラベルも未入力の場合は区分名だけ表示します
  return entry.type;
}

/** "2026-8-13" のようなキーを "8月13日(木)" のような表示用文字列に変換します */
function formatDateKeyForModal(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = WEEKDAYS[date.getDay()];
  return `${m}月${d}日(${weekday})`;
}

// 今月から前後何ヶ月まで移動できるようにするか
const MONTH_RANGE = 3;

export default function ScheduleCalendar({ entries }: { entries: ScheduleEntry[] }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  // 年月を1つの数値（例: 2026年8月 → 2026*12+7）にして比較しやすくします
  const monthIndex = year * 12 + month;
  const todayMonthIndex = today.getFullYear() * 12 + today.getMonth();
  const minMonthIndex = todayMonthIndex - MONTH_RANGE;
  const maxMonthIndex = todayMonthIndex + MONTH_RANGE;
  const canGoPrev = monthIndex > minMonthIndex;
  const canGoNext = monthIndex < maxMonthIndex;

  const entryMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const entry of entries) {
      const key = toJstDateKey(entry.date);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goPrevMonth() {
    if (!canGoPrev) return;
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (!canGoNext) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function openDay(key: string) {
    setSelectedDateKey(key);
    setOpenEntryId(null);
  }

  function closeModal() {
    setSelectedDateKey(null);
    setOpenEntryId(null);
  }

  const selectedEntries = selectedDateKey ? entryMap.get(selectedDateKey) ?? [] : [];

  return (
    <>
    <div className="calendar">
      <div className="calendar__header">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="前の月"
          className="calendar__nav"
          disabled={!canGoPrev}
        >
          ‹
        </button>
        <span className="calendar__title">
          {year}年{month + 1}月
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="次の月"
          className="calendar__nav"
          disabled={!canGoNext}
        >
          ›
        </button>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="calendar__weekday">
            {w}
          </span>
        ))}
      </div>

      <div className="calendar__grid">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar__cell calendar__cell--empty" />;
          }
          const key = dateKey(year, month, day);
          const dayEntries = entryMap.get(key) ?? [];
          const isToday = isCurrentMonth && day === today.getDate();
          const hasEntries = dayEntries.length > 0;
          return (
            <button
              key={key}
              type="button"
              className={`calendar__cell${isToday ? " calendar__cell--today" : ""}${
                hasEntries ? " calendar__cell--clickable" : ""
              }`}
              onClick={() => hasEntries && openDay(key)}
              disabled={!hasEntries}
              aria-label={hasEntries ? `${day}日の予定を見る` : undefined}
            >
              <span className="calendar__date">{day}</span>
              {dayEntries.map((entry, i) => (
                <span key={i} className={`calendar__badge ${badgeClass(entry.type)}`}>
                  {badgeText(entry)}
                </span>
              ))}
            </button>
          );
        })}
      </div>

      <div className="calendar__legend">
        <span>
          <i className="calendar__dot calendar__dot--ok" />
          鑑定可能
        </span>
        <span>
          <i className="calendar__dot calendar__dot--ng" />
          予定あり
        </span>
        <span>
          <i className="calendar__dot calendar__dot--event" />
          イベント
        </span>
      </div>
    </div>

    {selectedDateKey && (
      <div className="day-modal-overlay" role="button" tabIndex={0} onClick={closeModal}>
        <div
          className="day-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="day-modal__close"
            onClick={closeModal}
            aria-label="閉じる"
          >
            ✕
          </button>
          <p className="day-modal__title">{formatDateKeyForModal(selectedDateKey)}のスケジュール</p>
          <div className="day-modal__list">
            {selectedEntries.map((entry) => {
              const isOpen = openEntryId === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="day-modal__entry"
                  onClick={() => setOpenEntryId(isOpen ? null : entry.id)}
                >
                  <span className="day-modal__entry-header">
                    <i className={`calendar__dot ${dotClass(entry.type)}`} />
                    <span className="day-modal__entry-text">{badgeText(entry)}</span>
                  </span>
                  {isOpen && (
                    <span className="day-modal__entry-note">
                      {entry.note ? entry.note : "補足はありません。"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
