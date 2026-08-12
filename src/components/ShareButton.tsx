"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type ShareButtonProps = {
  /** 共有シート（Web Share API）に渡すタイトル */
  title: string;
  /** 共有シートに渡す説明文（任意） */
  text?: string;
  /** 現在のページURLに付け足すアンカー（例: "radio" → 現在のURル + "#radio"）。省略時はページURLそのまま。 */
  anchor?: string;
  className?: string;
  children: ReactNode;
};

/**
 * スマホの共有シート（LINEなど）でこのページを共有するボタンです。
 * Web Share APIに対応していないブラウザ（主にPC）では、
 * 代わりにURLをクリップボードにコピーします。
 */
export default function ShareButton({
  title,
  text,
  anchor,
  className,
  children,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}${window.location.pathname}`;
    return anchor ? `${base}#${anchor}` : base;
  }

  async function handleShare() {
    const url = getShareUrl();
    if (!url) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // ユーザーが共有シートをキャンセルした場合などは何もしません
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // クリップボードへのコピーにも失敗した場合は何もしません
      }
    }
  }

  return (
    <button type="button" className={className} onClick={handleShare}>
      {copied ? "URLをコピーしました" : children}
    </button>
  );
}
