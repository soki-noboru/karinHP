import type { Metadata } from "next";
import Image from "next/image";
import { getProfile } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "プロフィール｜四柱推命鑑定",
};

export const dynamic = "force-dynamic";

async function fetchProfileOrNull() {
  try {
    return await getProfile();
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const profile = await fetchProfileOrNull();

  if (!profile) {
    return (
      <p className="empty-state">
        現在、プロフィールを準備中です。microCMSの「profile」APIにコンテンツを1件作成・公開してください。
      </p>
    );
  }

  return (
    <>
      <div className="profile-hero">
        {profile.photo && (
          <div className="profile-hero__photo">
            <Image
              src={profile.photo.url}
              alt={profile.name}
              width={256}
              height={256}
              sizes="128px"
            />
          </div>
        )}
        <p className="profile-hero__name">{profile.name}</p>
        {profile.catchCopy && (
          <p className="profile-hero__catch">{profile.catchCopy}</p>
        )}

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
      </div>

      <div className="section">
        <div
          className="profile-body"
          dangerouslySetInnerHTML={{ __html: profile.bio }}
        />
      </div>
    </>
  );
}
