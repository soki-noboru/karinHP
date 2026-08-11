import Image from "next/image";
import {
  getGalleryList,
  getMenuList,
  getNewsList,
  getProfile,
} from "@/lib/microcms";
import GalleryGrid from "@/components/GalleryGrid";
import NewsAccordion from "@/components/NewsAccordion";
import ContactForm from "@/components/ContactForm";

// ビルド時にmicroCMSへ接続できない状態でもデプロイが失敗しないよう、
// このページはリクエスト時にレンダリングします（データ自体はfetchのrevalidate設定でキャッシュされます）。
export const dynamic = "force-dynamic";

async function fetchProfileOrNull() {
  try {
    return await getProfile();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [profile, newsRes, galleryRes, menuRes] = await Promise.all([
    fetchProfileOrNull(),
    getNewsList("limit=20"),
    getGalleryList("limit=100"),
    getMenuList(),
  ]);

  return (
    <>
      {/* ヒーロー（プロフィール写真・キャッチコピー） */}
      <div className="hero">
        {profile?.photo && (
          <div className="hero__photo">
            <Image
              src={profile.photo.url}
              alt={profile.name}
              width={216}
              height={216}
              sizes="108px"
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
        {menuRes.contents.length > 0 ? (
          <div>
            {menuRes.contents.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="menu-card__row">
                  <span className="menu-card__title">{item.title}</span>
                  <span className="menu-card__price">{item.price}</span>
                </div>
                {item.duration && (
                  <p className="menu-card__duration">
                    所要時間目安: {item.duration}
                  </p>
                )}
                {item.description && (
                  <p className="menu-card__desc">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">現在、鑑定メニューを準備中です。</p>
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
