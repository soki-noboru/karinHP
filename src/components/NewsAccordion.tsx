"use client";

import { useState } from "react";
import type { News } from "@/types/microcms";
import { formatDate } from "@/lib/format";

export default function NewsAccordion({ items }: { items: News[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="news-accordion">
      {items.map((news) => {
        // Instagramの投稿URLが設定されていれば、本文があってもリンクへ直接飛ばします。
        const isLink = Boolean(news.instagramUrl);
        // リンクではなく、本文がある場合のみ開閉できるようにします。
        const isExpandable = !isLink && Boolean(news.content);
        const isOpen = isExpandable && openId === news.id;

        const headerInner = (
          <>
            <span className="news-accordion__meta">
              {news.category && <span className="badge">{news.category}</span>}
              <span>{formatDate(news.date)}</span>
            </span>
            <span className="news-accordion__title">{news.title}</span>
            {isLink && <span className="news-accordion__arrow">↗</span>}
            {isExpandable && (
              <span className={`news-accordion__arrow${isOpen ? " is-open" : ""}`}>›</span>
            )}
          </>
        );

        if (isLink) {
          return (
            <div key={news.id} className="news-accordion__item">
              <a
                className="news-accordion__header"
                href={news.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {headerInner}
              </a>
            </div>
          );
        }

        return (
          <div key={news.id} className="news-accordion__item">
            <button
              type="button"
              className="news-accordion__header"
              onClick={() => {
                if (isExpandable) {
                  setOpenId(isOpen ? null : news.id);
                }
              }}
            >
              {headerInner}
            </button>
            {isOpen && (
              <div className="news-accordion__body">
                {news.eyecatch && (
                  <img src={news.eyecatch.url} alt="" className="news-accordion__image" />
                )}
                {news.content && (
                  <div dangerouslySetInnerHTML={{ __html: news.content }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
