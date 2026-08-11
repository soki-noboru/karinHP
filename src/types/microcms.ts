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
  title: string; // 例: 四柱推命鑑定（対面）
  price: string; // 例: ¥8,000（税込） ※数値ではなく文字列にして自由な表記を許容
  duration?: string; // 例: 約60分
  description?: string;
  order?: number; // 表示順（小さい順に表示）
};

/** プロフィール (APIエンドポイント: profile / シングル形式) */
export type Profile = {
  name: string; // 例: 華鈴
  catchCopy?: string; // 例: 四柱推命鑑定士
  photo?: MicroCMSImage;
  bio: string; // リッチエディタのHTML
  instagramUrl?: string;
  lineUrl?: string;
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
