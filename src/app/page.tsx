import Image from "next/image";
import {
  getGalleryList,
  getMenuList,
  getNewsList,
  getProfile,
  getScheduleList,
} from "@/lib/microcms";
import GalleryGrid from "@/components/GalleryGrid";
import MenuList from "@/components/MenuList";
import NewsAccordion from "@/components/NewsAccordion";
import ContactForm from "@/components/ContactForm";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ShareButton from "@/components/ShareButton";
import {
  formatDate,
  getNextRadioBroadcastLabel,
  isRadioOnAirNow,
  parsePriceForSort,
} from "@/lib/format";

// ラジオ出演セクション用の小さなアイコン（外部ライブラリを増やさず、インラインSVGで用意）
// 番組名の行のアイコン。マイクよりも「ラジオ番組」感が出るよう、
// アンテナ付きのラジオ受信機の形にしています。
function RadioSetIcon() {
  return (
    <svg
      className="radio-card__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8l3-4" />
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <circle cx="7.5" cy="13" r="1.4" />
      <line x1="12.5" y1="11" x2="12.5" y2="15" />
      <line x1="15.5" y1="11" x2="15.5" y2="15" />
      <line x1="18.5" y1="11" x2="18.5" y2="15" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="radio-card__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function AntennaIcon() {
  return (
    <svg
      className="radio-card__icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21v-8" />
      <path d="M9 13l3-8 3 8" />
      <path d="M6.5 9.5a7.5 7.5 0 0 1 11 0" />
      <path d="M4 6.5a11 11 0 0 1 16 0" />
    </svg>
  );
}

function RadioWaveIcon({ className = "sns-links__icon" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.5 5.5a9.5 9.5 0 0 0 0 13" />
      <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
    </svg>
  );
}

// 「過去の放送を聴く」の見出しに添える音声の波形アイコン
function WaveformIcon() {
  return (
    <svg
      className="radio-archive__icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="4" y1="9" x2="4" y2="15" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="6" x2="16" y2="18" />
      <line x1="20" y1="9" x2="20" y2="15" />
    </svg>
  );
}

// 「この番組をシェア」ボタン用のアイコン
function ShareIcon() {
  return (
    <svg
      className="sns-links__icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="6" r="2.6" />
      <circle cx="18" cy="18" r="2.6" />
      <line x1="8.2" y1="10.8" x2="15.8" y2="7.2" />
      <line x1="8.2" y1="13.2" x2="15.8" y2="16.8" />
    </svg>
  );
}

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

  // ラジオが今まさに放送中かどうか、そうでなければ次回の放送日時を求めます
  const isRadioOnAir = isRadioOnAirNow();
  const nextRadioBroadcastLabel = isRadioOnAir ? null : getNextRadioBroadcastLabel();

  // 過去のラジオ放送一覧（profileの繰り返しフィールド）を、放送日が新しい順に並べ替えます
  const sortedRadioArchive = [...(profile?.radioArchive ?? [])].sort(
    (a, b) => new Date(b.broadcastDate).getTime() - new Date(a.broadcastDate).getTime()
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

      {/* ラジオ出演情報 */}
      {(profile?.bio ||
        profile?.radioProgramName ||
        profile?.radioStation ||
        profile?.radioScheduleText ||
        sortedRadioArchive.length > 0) && (
        <section className="section" id="radio">
          <div className="section__heading" style={{ display: "block" }}>
            <span className="section__eyebrow">On Air</span>
            <h2 className="section__title">ラジオ出演</h2>
          </div>

          {/* 放送時間帯（毎週木曜21:30〜22:00、日本時間）だけ表示される「放送中」バッジ。
              radioUrlが設定されていれば、タップしてそのまま聴きに行けるリンクにします。 */}
          {isRadioOnAir &&
            (profile?.radioUrl ? (
              <a
                className="onair-badge"
                href={profile.radioUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="onair-badge__dot" />
                放送中・今すぐ聴く
              </a>
            ) : (
              <p className="onair-badge">
                <span className="onair-badge__dot" />
                放送中
              </p>
            ))}

          {/* 放送中でない場合は、次回の放送日時を案内します */}
          {!isRadioOnAir && nextRadioBroadcastLabel && (
            <p className="next-broadcast">次回放送: {nextRadioBroadcastLabel}</p>
          )}

          {(profile?.radioProgramName ||
            profile?.radioStation ||
            profile?.radioScheduleText) && (
            <div className="radio-card">
              {profile.radioProgramName && (
                <div className="radio-card__row">
                  <RadioSetIcon />
                  <span>{profile.radioProgramName}</span>
                </div>
              )}
              {profile.radioScheduleText && (
                <div className="radio-card__row">
                  <ClockIcon />
                  <span>{profile.radioScheduleText}</span>
                </div>
              )}
              {profile.radioStation && (
                <div className="radio-card__row">
                  <AntennaIcon />
                  <span>{profile.radioStation}</span>
                </div>
              )}
            </div>
          )}

          {profile?.bio && (
            <div
              className="profile-body"
              dangerouslySetInnerHTML={{ __html: profile.bio }}
            />
          )}

          {sortedRadioArchive.length > 0 && (
            <div className="radio-archive">
              <p className="radio-archive__heading">
                <WaveformIcon />
                過去の放送を聴く
              </p>
              {sortedRadioArchive.map((item, index) => {
                const label = `${formatDate(item.broadcastDate)}放送分${
                  item.title ? `・${item.title}` : ""
                }`;
                return (
                  <div className="radio-archive__item" key={`${item.audioUrl}-${index}`}>
                    <span className="radio-archive__label">
                      {label}
                      {/* 一番新しい回（先頭）だけ「NEW」を付けます */}
                      {index === 0 && (
                        <span className="badge radio-archive__new-badge">NEW</span>
                      )}
                    </span>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption -- 音声のみのラジオ放送のため字幕は用意していません */}
                    <audio
                      controls
                      preload="none"
                      src={item.audioUrl}
                      aria-label={`${label}の放送音声`}
                    >
                      お使いのブラウザは音声再生に対応していません。
                    </audio>
                  </div>
                );
              })}
            </div>
          )}

          {(profile?.instagramUrl || profile?.lineUrl || profile?.radioUrl) && (
            <>
              <p className="sns-links__lead">SNS・ラジオはこちらから</p>
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
                {profile.radioUrl && (
                  <a
                    className="sns-links__item"
                    href={profile.radioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RadioWaveIcon />
                    ラジオ
                  </a>
                )}
                <ShareButton
                  className="sns-links__item"
                  title={`${profile?.name ?? "四柱推命鑑定"}のラジオ出演情報`}
                  text={`${profile?.radioProgramName ?? "ラジオ番組"}をチェック！`}
                  anchor="radio"
                >
                  <ShareIcon />
                  シェア
                </ShareButton>
              </div>
            </>
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
          <MenuList items={sortedMenu} />
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
