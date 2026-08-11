import type {
  GalleryItem,
  MenuItem,
  MicroCMSListResponse,
  News,
  Profile,
  ScheduleEntry,
} from "@/types/microcms";

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

// デフォルトの再生成間隔（秒）。Webhookが届かなくても、この間隔で自動的に最新化されます。
const DEFAULT_REVALIDATE_SECONDS = 60;

type FetchOptions = {
  /** ISRの再生成間隔（秒）。Webhookでの即時反映と併用できます。 */
  revalidate?: number;
  /** on-demand revalidateで使うタグ（/api/revalidateから呼び出します） */
  tags?: string[];
};

/**
 * microCMSのREST APIを直接呼び出す薄いラッパーです。
 * microcms-js-sdkを使わずfetchを直接使うことで、Next.jsのキャッシュ機構
 * （revalidate / タグベースの再検証）をそのまま活用できるようにしています。
 */
async function microcmsFetch<T>(
  path: string,
  { revalidate = DEFAULT_REVALIDATE_SECONDS, tags = [] }: FetchOptions = {}
): Promise<T> {
  if (!SERVICE_DOMAIN || !API_KEY) {
    throw new Error(
      "環境変数 MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が設定されていません。.env.local を確認してください。"
    );
  }

  const res = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1${path}`, {
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
    },
    next: { revalidate, tags },
  });

  if (!res.ok) {
    throw new Error(
      `microCMSへのリクエストに失敗しました: ${res.status} ${res.statusText} (${path})`
    );
  }

  return res.json() as Promise<T>;
}

/** お知らせ・ブログ記事の一覧を取得します（新しい公開日が先頭に来るように並べます） */
export function getNewsList(queryString = "orders=-publishedAt") {
  const suffix = queryString ? `?${queryString}` : "";
  return microcmsFetch<MicroCMSListResponse<News>>(`/news${suffix}`, {
    tags: ["news"],
  });
}

/** お知らせ・ブログ記事の詳細を1件取得します */
export function getNewsDetail(id: string) {
  return microcmsFetch<News>(`/news/${id}`, {
    tags: ["news", `news-${id}`],
  });
}

/** 写真ギャラリーの一覧を取得します（新しく公開したものが先頭に来るように並べます） */
export function getGalleryList(queryString = "orders=-publishedAt") {
  const suffix = queryString ? `?${queryString}` : "";
  return microcmsFetch<MicroCMSListResponse<GalleryItem>>(`/gallery${suffix}`, {
    tags: ["gallery"],
  });
}

/** 鑑定メニュー・料金表の一覧を取得します（作成した順に表示されます） */
export function getMenuList(queryString = "limit=100") {
  return microcmsFetch<MicroCMSListResponse<MenuItem>>(`/menu?${queryString}`, {
    tags: ["menu"],
  });
}

/** プロフィール（シングル形式API）を取得します */
export function getProfile() {
  return microcmsFetch<Profile>("/profile", {
    tags: ["profile"],
  });
}

/** スケジュール（カレンダー表示用）の一覧を取得します（microCMSのlimit上限は100件） */
export function getScheduleList(queryString = "orders=date&limit=100") {
  return microcmsFetch<MicroCMSListResponse<ScheduleEntry>>(`/schedule?${queryString}`, {
    tags: ["schedule"],
  });
}
