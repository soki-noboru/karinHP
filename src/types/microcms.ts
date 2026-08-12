// microCMSの管理画面で作成するAPIスキーマに対応する型定義です。
// フィールドを追加・変更した場合は、ここも合わせて更新してください。

/** microCMSのリスト形式APIに共通して付与される項目 */
export type MicroCMSListContent = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

/** microCMSの画像フィールドの型 */
export type MicroCMSImage = {
  url: string;
  width: number;
  height: number;
};

/** お知らせ・ブログ記事 (APIエンドポイント: news) */
export type NewsCategory = "お知らせ" | "ブログ" | "イベント";

export type News = MicroCMSListContent & {
  title: string; // ※必須
  instagramUrl?: string; // Instagramの投稿URL（本文の代わりにこちらだけでもOK）
  content?: string; // リッチエディタのHTML（本文を書く場合。instagramUrlと併用も可）
  eyecatch?: MicroCMSImage;
  category?: NewsCategory;
  // 表示日付は入力不要。公開日時（publishedAt）を自動的に使用します。
};

/** 写真ギャラリー (APIエンドポイント: gallery) */
export type GalleryItem = MicroCMSListContent & {
  title: string;
  image: MicroCMSImage;
  description?: string;
};

/** 鑑定メニュー・料金表 (APIエンドポイント: menu) */
export type MenuItem = MicroCMSListContent & {
  title: string; // メニュー名 例: 対面鑑定 ※必須
  price: string; // 例: ¥8,000（税込） ※必須。数値ではなく文字列にして自由な表記を許容
  time?: string; // 鑑定時間 例: 30分（任意）
  description?: string; // 説明（任意）。メニューをクリックした際の詳細モーダルに表示します。
};

/**
 * ラジオの過去放送1回分（profileの「radioArchive」繰り返しフィールドの中身）。
 * microCMSの繰り返しフィールドは、各要素にfieldId（どのカスタムフィールドから
 * 作られた項目かの識別子）が自動で付きますが、ここでは使わないので任意にしています。
 */
export type RadioArchiveEntry = {
  fieldId?: string;
  broadcastDate: string; // 放送日（例: "2026-06-11"）
  audioUrl: string; // 放送音声のURL
  title?: string; // 補足タイトル（任意。例: ゲスト回 など）
};

/** プロフィール (APIエンドポイント: profile / シングル形式) */
export type Profile = {
  name: string; // 例: 華鈴
  catchCopy?: string; // 例: 四柱推命鑑定士
  photo?: MicroCMSImage;
  bio: string; // リッチエディタのHTML
  instagramUrl?: string;
  lineUrl?: string;
  radioUrl?: string;
  radioProgramName?: string; // ラジオの番組名 例: 華鈴の未来予想図
  radioStation?: string; // 放送局 例: ゆめのたね放送局（グリーンチャンネル）
  radioScheduleText?: string; // 放送日時の表示用テキスト 例: 毎週木曜日 21:30〜22:00
  radioArchive?: RadioArchiveEntry[]; // 過去の放送一覧（繰り返しフィールド）。かりんさんがmicroCMS側で追加・削除できます
  updatedAt: string;
};

/** スケジュール・カレンダー (APIエンドポイント: schedule) */
export type ScheduleType = "鑑定可" | "不可" | "イベント";

export type ScheduleEntry = MicroCMSListContent & {
  date: string; // YYYY-MM-DD
  startTime?: string; // 開始時刻 例: "13:00"（空欄可）
  endTime?: string; // 終了時刻 例: "17:00"（空欄可）
  label?: string; // 例: マルシェ／講座 など、時間以外に添えたい短い文言（任意）
  type: ScheduleType; // 色分け用の区分
  note?: string; // 補足（任意）
};

/** microCMSのリストAPIのレスポンス形式 */
export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

/** microCMSのWebhookから送られてくるペイロード（必要な項目のみ） */
export type MicroCMSWebhookPayload = {
  service?: string;
  api?: string; // "news" | "gallery" など、更新されたAPIのエンドポイント名
  id?: string;
  type?: "new" | "edit" | "delete" | string;
};
