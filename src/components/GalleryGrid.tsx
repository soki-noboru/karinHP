"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/microcms";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
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
              sizes="50vw"
            />
          </button>
        ))}
      </div>

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
            {selected.title}
            {selected.description ? ` — ${selected.description}` : ""}
          </div>
        </div>
      )}
    </>
  );
}
