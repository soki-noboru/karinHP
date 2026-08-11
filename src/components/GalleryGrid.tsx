"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/microcms";

// 3列 × 2行 = 6件まで最初に表示します。
const INITIAL_VISIBLE_COUNT = 6;

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = !showAll && items.length > INITIAL_VISIBLE_COUNT;

  return (
    <>
      <div className="gallery-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="gallery-grid__item"
            onClick={() => setSelected(item)}
            aria-label={item.title}
          >
            <Image
              src={item.image.url}
              alt={item.title}
              width={300}
              height={300}
              sizes="33vw"
            />
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="news-accordion__more gallery-grid__more"
          onClick={() => setShowAll(true)}
        >
          もっと見る
        </button>
      )}

      {selected && (
        <div
          className="lightbox-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            className="lightbox-overlay__close"
            onClick={() => setSelected(null)}
            aria-label="閉じる"
          >
            ✕
          </button>
          <Image
            src={selected.image.url}
            alt={selected.title}
            width={selected.image.width}
            height={selected.image.height}
            sizes="100vw"
            style={{ maxHeight: "80vh", width: "auto", objectFit: "contain" }}
          />
          <div className="lightbox-overlay__caption">
            <p className="lightbox-overlay__title">{selected.title}</p>
            {selected.description && (
              <p className="lightbox-overlay__description">{selected.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
