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

function badgeClass(type: ScheduleEntry["type"]) {
  if (type === "鑑定可") return "calendar__badge--ok";
  if (type === "イベント") return "calendar__badge--event";
  return "calendar__badge--ng";
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

export default function ScheduleCalendar({ entries }: { entries: ScheduleEntry[] }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11

  const entryMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
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
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" onClick={goPrevMonth} aria-label="前の月" className="calendar__nav">
          ‹
        </button>
        <span className="calendar__title">
          {year}年{month + 1}月
        </span>
        <button type="button" onClick={goNextMonth} aria-label="次の月" className="calendar__nav">
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
          return (
            <div key={key} className={`calendar__cell${isToday ? " calendar__cell--today" : ""}`}>
              <span className="calendar__date">{day}</span>
              {dayEntries.map((entry, i) => (
                <span key={i} className={`calendar__badge ${badgeClass(entry.type)}`}>
                  {badgeText(entry)}
                </span>
              ))}
            </div>
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
  );
}
