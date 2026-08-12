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

// ラジオの放送スケジュール（日本時間）: 毎週木曜日 21:30〜22:00
// ※放送の曜日・時間が変わった場合は、この3つの定数を更新してください。
const RADIO_ON_AIR_WEEKDAY = "Thu"; // Intlのweekday: "short"（en-US）表記
const RADIO_ON_AIR_START_MINUTES = 21 * 60 + 30; // 21:30
const RADIO_ON_AIR_END_MINUTES = 22 * 60; // 22:00

/**
 * 現在（日本時間）が、ラジオの放送時間内かどうかを判定します。
 * サーバー（VercelはUTC）でもブラウザでも同じ結果になるよう、
 * 常に日本時間(Asia/Tokyo)基準で曜日・時刻を取り出して比較します。
 */
export function isRadioOnAirNow(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? NaN);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? NaN);

  if (weekday !== RADIO_ON_AIR_WEEKDAY || Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  const minutesSinceMidnight = hour * 60 + minute;
  return (
    minutesSinceMidnight >= RADIO_ON_AIR_START_MINUTES &&
    minutesSinceMidnight < RADIO_ON_AIR_END_MINUTES
  );
}
