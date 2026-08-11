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
  title: string;
  content: string; // リッチエディタのHTML
  eyecatch?: MicroCMSImage;
  category?: NewsCategory;
};

/** 写真ギャラリー (APIエンドポイント: gallery) */
export type GalleryItem = MicroCMSListContent & {
  title: string;
  image: MicroCMSImage;
  description?: string;
  takenAt?: string; // YYYY-MM-DD
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
  label: string; // 例: 11時まで／20時以降／マルシェ／講座 など、カレンダーに表示する短い文言
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
