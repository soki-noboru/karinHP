"use client";

import { useState } from "react";
import type { RadioArchiveEntry } from "@/types/microcms";
import { formatDate } from "@/lib/format";

// 「過去の放送」は最初は3件だけ表示し、4件目以降は「もっと見る」で開きます
// （お知らせ・ギャラリーの一覧と同じ挙動に揃えています）
const INITIAL_VISIBLE_COUNT = 3;

// 「過去の放送を聴く」の見出しに添える音声の波形アイコン
function WaveformIcon() {
  return (
    <svg
      className="radio-archive__icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="4" y1="9" x2="4" y2="15" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="6" x2="16" y2="18" />
      <line x1="20" y1="9" x2="20" y2="15" />
    </svg>
  );
}

export default function RadioArchive({ items }: { items: RadioArchiveEntry[] }) {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = !showAll && items.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="radio-archive">
      <p className="radio-archive__heading">
        <WaveformIcon />
        過去の放送を聴く
      </p>
      {visibleItems.map((item, index) => {
        const label = `${formatDate(item.broadcastDate)}放送分${
          item.title ? `・${item.title}` : ""
        }`;
        return (
          <div className="radio-archive__item" key={`${item.audioUrl}-${index}`}>
            <span className="radio-archive__label">
              {label}
              {/* 一番新しい回（先頭）だけ「NEW」を付けます */}
              {index === 0 && (
                <span className="badge radio-archive__new-badge">NEW</span>
              )}
            </span>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- 音声のみのラジオ放送のため字幕は用意していません */}
            <audio
              controls
              preload="none"
              src={item.audioUrl}
              aria-label={`${label}の放送音声`}
            >
              お使いのブラウザは音声再生に対応していません。
            </audio>
          </div>
        );
      })}

      {hasMore && (
        <button
          type="button"
          className="news-accordion__more radio-archive__more"
          onClick={() => setShowAll(true)}
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
