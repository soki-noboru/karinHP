"use client";

import { useState } from "react";
import type { MenuItem } from "@/types/microcms";

export default function MenuList({ items }: { items: MenuItem[] }) {
  const [selected, setSelected] = useState<MenuItem | null>(null);

  function closeModal() {
    setSelected(null);
  }

  return (
    <>
      <div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="menu-card"
            onClick={() => setSelected(item)}
          >
            <div className="menu-card__row">
              <span className="menu-card__title">{item.title}</span>
              <span className="menu-card__price">{item.price}</span>
            </div>
            {item.time && <p className="menu-card__time">鑑定時間: {item.time}</p>}
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="day-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={closeModal}
        >
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
            <div className="menu-modal__row">
              <span className="menu-modal__title">{selected.title}</span>
              <span className="menu-modal__price">{selected.price}</span>
            </div>
            {selected.time && <p className="menu-modal__time">鑑定時間: {selected.time}</p>}
            {selected.description ? (
              <p className="menu-modal__description">{selected.description}</p>
            ) : (
              <p className="menu-modal__description menu-modal__description--empty">
                説明はありません。
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
