"use client";

import { useState } from "react";
import Image from "next/image";
import type { News } from "@/types/microcms";
import { formatDate } from "@/lib/format";

const INITIAL_VISIBLE_COUNT = 5;

/**
 * リッチエディタは何も書かなくても "<p><br></p>" のような
 * 見た目上は空のHTMLを保存することがあるため、タグを取り除いた上で
 * 実際に表示する内容があるかどうかを判定します（画像だけの場合はOK扱い）。
 */
function hasVisibleContent(html?: string) {
  if (!html) return false;
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (stripped.length > 0) return true;
  return /<img[\s>]/i.test(html);
}

export default function NewsAccordion({ items }: { items: News[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = !showAll && items.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="news-accordion">
      {visibleItems.map((news) => {
        const instagramUrl = news.instagramUrl?.trim();
        // Instagramの投稿URLが設定されていれば、本文があってもリンクへ直接飛ばします。
        const isLink = Boolean(instagramUrl);
        // リンクではなく、実際に表示できる本文がある場合のみ開閉できるようにします。
        const isExpandable = !isLink && hasVisibleContent(news.content);
        const isOpen = isExpandable && openId === news.id;

        const headerInner = (
          <>
            <span className="news-accordion__meta">
              {news.category && <span className="badge">{news.category}</span>}
              <span>{formatDate(news.publishedAt)}</span>
            </span>
            <span className="news-accordion__title">{news.title}</span>
            {isLink && <span className="news-accordion__arrow">↗</span>}
            {isExpandable && (
              <span className={`news-accordion__arrow${isOpen ? " is-open" : ""}`}>›</span>
            )}
          </>
        );

        if (isLink && instagramUrl) {
          return (
            <div key={news.id} className="news-accordion__item">
              <a
                className="news-accordion__header"
                href={instagramUrl}
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
                  <Image
                    src={news.eyecatch.url}
                    alt=""
                    width={news.eyecatch.width}
                    height={news.eyecatch.height}
                    sizes="(min-width: 480px) 480px, 100vw"
                    className="news-accordion__image"
                  />
                )}
                {news.content && (
                  <div dangerouslySetInnerHTML={{ __html: news.content }} />
                )}
              </div>
            )}
          </div>
        );
      })}

      {hasMore && (
        <button
          type="button"
          className="news-accordion__more"
          onClick={() => setShowAll(true)}
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
