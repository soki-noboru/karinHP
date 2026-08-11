/**
 * ISO日時文字列を "2026年8月11日" のような表示用の文字列に変換します。
 * 日本時間（Asia/Tokyo）を基準に変換するため、UTCとのズレで日付が
 * 前後にずれることを防ぎます。
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * 料金の表示用文字列（例: "¥8,000（税込）"）から、並び替え専用の数値を取り出します。
 * 「¥」「,」「（税込）」などの数字以外の文字を取り除いてから数値化するため、
 * 料金フィールドの表記は自由なまま、安い順・高い順の並び替えに使えます。
 * 数字を含まない場合は並び替え時に一番最後に表示されるよう、非常に大きな値を返します。
 */
export function parsePriceForSort(price: string): number {
  const digits = price.replace(/[^0-9]/g, "");
  if (!digits) return Number.POSITIVE_INFINITY;
  return Number(digits);
}
