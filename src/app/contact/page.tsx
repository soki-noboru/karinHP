import type { Metadata } from "next";
import { getProfile } from "@/lib/microcms";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ・ご予約｜四柱推命鑑定",
};

export const dynamic = "force-dynamic";

async function fetchProfileOrNull() {
  try {
    return await getProfile();
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const profile = await fetchProfileOrNull();

  return (
    <section className="section">
      <div className="section__heading" style={{ display: "block" }}>
        <span className="section__eyebrow">Contact</span>
        <h2 className="section__title">お問い合わせ・ご予約</h2>
      </div>

      <ContactForm />

      {profile && (profile.instagramUrl || profile.lineUrl) && (
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <p className="form__note" style={{ marginBottom: 10 }}>
            SNSからのお問い合わせも受け付けています
          </p>
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
        </div>
      )}
    </section>
  );
}
