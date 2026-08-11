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
