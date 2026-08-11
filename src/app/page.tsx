import Image from "next/image";
import {
  getGalleryList,
  getMenuList,
  getNewsList,
  getProfile,
  getScheduleList,
} from "@/lib/microcms";
import GalleryGrid from "@/components/GalleryGrid";
import NewsAccordion from "@/components/NewsAccordion";
import ContactForm from "@/components/ContactForm";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import { parsePriceForSort } from "@/lib/format";

// ビルド時にmicroCMSへ接続できない状態でもデプロイが失敗しないよう、
// このページはリクエスト時にレンダリングします（データ自体はfetchのrevalidate設定でキャッシュされます）。
// (デプロイ動作確認のための更新)
export const dynamic = "force-dynamic";

const EMPTY_LIST = { contents: [], totalCount: 0, offset: 0, limit: 0 };

async function fetchProfileOrNull() {
  try {
    return await getProfile();
  } catch (error) {
    console.error("[home] プロフィールの取得に失敗しました:", error);
    return null;
  }
}

// microCMS側の設定不備（APIキーの権限不足など）でページ全体が落ちないよう、
// 各リストの取得はそれぞれ個別にエラーを捕まえ、失敗時は空リスト扱いにします。
// 失敗時はVercelのFunction Logsにエラー内容が出るようにしています。
async function fetchListSafe<T>(
  label: string,
  fetcher: () => Promise<T>
): Promise<T | typeof EMPTY_LIST> {
  try {
    return await fetcher();
  } catch (error) {
    console.error(`[home] ${label}の取得に失敗しました:`, error);
    return EMPTY_LIST;
  }
}

export default async function HomePage() {
  const [profile, newsRes, galleryRes, menuRes, scheduleRes] = await Promise.all([
    fetchProfileOrNull(),
    fetchListSafe("お知らせ", () => getNewsList("orders=-publishedAt&limit=20")),
    fetchListSafe("ギャラリー", () => getGalleryList("orders=-publishedAt&limit=100")),
    fetchListSafe("鑑定メニュー", () => getMenuList()),
    fetchListSafe("スケジュール", () => getScheduleList()),
  ]);

  // 料金の安い順に並べ替えます（料金は自由記述のテキストのため、数字部分だけを取り出して比較します）
  const sortedMenu = [...menuRes.contents].sort(
    (a, b) => parsePriceForSort(a.price) - parsePriceForSort(b.price)
  );

  return (
    <>
      {/* ヒーロー（プロフィール写真・キャッチコピー） */}
      <div className="hero">
        {profile?.photo && (
          <div className="hero__photo">
            <Image
              src={profile.photo.url}
              alt={profile.name}
              width={540}
              height={540}
              sizes="270px"
              priority
            />
          </div>
        )}
        <span className="hero__eyebrow">Fortune Telling</span>
        <p className="hero__title">{profile?.name ?? "四柱推命鑑定"}</p>
        <p className="hero__lead">
          {profile?.catchCopy ??
            "生まれ持った運命の流れを読み解き、これからの一歩を照らします。"}
        </p>
        <a href="#contact" className="hero__cta">
          ご相談・ご予約はこちら
        </a>
      </div>

      {/* プロフィール・自己紹介 */}
      {profile?.bio && (
        <section className="section" id="profile">
          <div className="section__heading" style={{ display: "block" }}>
            <span className="section__eyebrow">Profile</span>
            <h2 className="section__title">プロフィール</h2>
          </div>
          <div
            className="profile-body"
            dangerouslySetInnerHTML={{ __html: profile.bio }}
          />
          {(profile.instagramUrl || profile.lineUrl) && (
            <div className="sns-links">
              {profile.instagramUrl && (
                <a
                  className="sns-links__item"
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
              {profile.lineUrl && (
                <a
                  className="sns-links__item"
                  href={profile.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  公式LINE
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* 鑑定メニュー */}
      <section className="section" id="menu">
        <div className="section__heading" style={{ display: "block" }}>
          <span className="section__eyebrow">Menu</span>
          <h2 className="section__title">鑑定メニュー・料金</h2>
        </div>
        {sortedMenu.length > 0 ? (
          <div>
            {sortedMenu.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="menu-card__row">
                  <span className="menu-card__title">{item.title}</span>
                  <span className="menu-card__price">{item.price}</span>
                </div>
                {item.time && <p className="menu-card__time">鑑定時間: {item.time}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">現在、鑑定メニューを準備中です。</p>
        )}
      </section>

      {/* スケジュール・カレンダー */}
      <section className="section" id="schedule">
        <div className="section__heading" style={{ display: "block" }}>
          <span className="section__eyebrow">Schedule</span>
          <h2 className="section__title">スケジュール</h2>
        </div>
        {scheduleRes.contents.length > 0 ? (
          <ScheduleCalendar entries={scheduleRes.contents} />
        ) : (
          <p className="empty-state">現在、スケジュールを準備中です。</p>
        )}
      </section>

      {/* お知らせ */}
      <section className="section" id="news">
        <div className="section__heading" style={{ display: "block" }}>
          <span className="section__eyebrow">News</span>
          <h2 className="section__title">お知らせ</h2>
        </div>
        {newsRes.contents.length > 0 ? (
          <NewsAccordion items={newsRes.contents} />
        ) : (
          <p className="empty-state">まだお知らせがありません。</p>
        )}
      </section>

      {/* ギャラリー */}
      <section className="section" id="gallery">
        <div className="section__heading" style={{ display: "block" }}>
          <span className="section__eyebrow">Gallery</span>
          <h2 className="section__title">ギャラリー</h2>
        </div>
        {galleryRes.contents.length > 0 ? (
          <GalleryGrid items={galleryRes.contents} />
        ) : (
          <p className="empty-state">まだ写真がありません。</p>
        )}
      </section>

      {/* お問い合わせ・ご予約 */}
      <section className="section" id="contact">
        <div className="section__heading" style={{ display: "block" }}>
          <span className="section__eyebrow">Contact</span>
          <h2 className="section__title">お問い合わせ・ご予約</h2>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
