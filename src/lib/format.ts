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
// ※放送の曜日・時間が変わった場合は、この4つの定数を更新してください
// （RADIO_ON_AIR_WEEKDAYとRADIO_ON_AIR_WEEKDAY_INDEXは同じ曜日を指すようにしてください）。
const RADIO_ON_AIR_WEEKDAY = "Thu"; // Intlのweekday: "short"（en-US）表記
const RADIO_ON_AIR_WEEKDAY_INDEX = 4; // 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
const RADIO_ON_AIR_START_MINUTES = 21 * 60 + 30; // 21:30
const RADIO_ON_AIR_END_MINUTES = 22 * 60; // 22:00

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 現在時刻（日本時間）を、年月日・曜日・時分に分解して取り出します。 */
function getJstNowParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: map.weekday ?? "",
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

/**
 * 現在（日本時間）が、ラジオの放送時間内かどうかを判定します。
 * サーバー（VercelはUTC）でもブラウザでも同じ結果になるよう、
 * 常に日本時間(Asia/Tokyo)基準で曜日・時刻を取り出して比較します。
 */
export function isRadioOnAirNow(now: Date = new Date()): boolean {
  const { weekday, hour, minute } = getJstNowParts(now);

  if (weekday !== RADIO_ON_AIR_WEEKDAY || Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  const minutesSinceMidnight = hour * 60 + minute;
  return (
    minutesSinceMidnight >= RADIO_ON_AIR_START_MINUTES &&
    minutesSinceMidnight < RADIO_ON_AIR_END_MINUTES
  );
}

/**
 * 放送中でない場合に、次回の放送日時を「8月13日(木) 21:30〜」のような
 * 表示用の文字列として返します。放送中の場合はnullを返します
 * （その場合は「放送中」バッジの方を表示してください）。
 */
export function getNextRadioBroadcastLabel(now: Date = new Date()): string | null {
  if (isRadioOnAirNow(now)) return null;

  const { year, month, day, weekday, hour, minute } = getJstNowParts(now);
  const currentWeekdayIndex = WEEKDAY_SHORT_TO_INDEX[weekday] ?? 0;
  const minutesSinceMidnight = hour * 60 + minute;

  let daysUntilNext = (RADIO_ON_AIR_WEEKDAY_INDEX - currentWeekdayIndex + 7) % 7;
  // 放送当日で、すでに放送時間が終わっている場合は「次の週」を指すようにします
  if (daysUntilNext === 0 && minutesSinceMidnight >= RADIO_ON_AIR_END_MINUTES) {
    daysUntilNext = 7;
  }

  // 日本時間の「年月日」だけを使ったカレンダー計算です。時刻・タイムゾーンの変換を挟まないUTC基準の
  // Dateで日数を加算するだけなので、サーバーとブラウザで日付がズレる心配がありません。
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  targetDate.setUTCDate(targetDate.getUTCDate() + daysUntilNext);

  const targetMonth = targetDate.getUTCMonth() + 1;
  const targetDay = targetDate.getUTCDate();
  const startHour = Math.floor(RADIO_ON_AIR_START_MINUTES / 60);
  const startMinute = RADIO_ON_AIR_START_MINUTES % 60;

  return `${targetMonth}月${targetDay}日(木) ${pad2(startHour)}:${pad2(startMinute)}〜`;
}
