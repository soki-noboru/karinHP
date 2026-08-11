"use client";

import { useState } from "react";
import type { News } from "@/types/microcms";
import { formatDate } from "@/lib/format";

export default function NewsAccordion({ items }: { items: News[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="news-accordion">
      {items.map((news) => {
        const isOpen = openId === news.id;
        return (
          <div key={news.id} className="news-accordion__item">
            <button
              type="button"
              className="news-accordion__header"
              onClick={() => setOpenId(isOpen ? null : news.id)}
            >
              <span className="news-accordion__meta">
                {news.category && <span className="badge">{news.category}</span>}
                <span>{formatDate(news.publishedAt)}</span>
              </span>
              <span className="news-accordion__title">{news.title}</span>
              <span className={`news-accordion__arrow${isOpen ? " is-open" : ""}`}>
                ›
              </span>
            </button>
            {isOpen && (
              <div className="news-accordion__body">
                {news.eyecatch && (
                  <img src={news.eyecatch.url} alt="" className="news-accordion__image" />
                )}
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
