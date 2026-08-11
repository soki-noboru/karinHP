import type { Metadata } from "next";
import { getGalleryList } from "@/lib/microcms";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "ギャラリー｜わが家のホームページ",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryRes = await getGalleryList("limit=100");

  return (
    <section className="section">
      <div className="section__heading">
        <h2 className="section__title">ギャラリー</h2>
      </div>
      {galleryRes.contents.length > 0 ? (
        <GalleryGrid items={galleryRes.contents} />
      ) : (
        <p className="empty-state">まだ写真がありません。</p>
      )}
    </section>
  );
}
