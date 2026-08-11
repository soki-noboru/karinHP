import type { Metadata } from "next";
import { getNewsList } from "@/lib/microcms";
import NewsCard from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "お知らせ｜わが家のホームページ",
};

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const newsRes = await getNewsList("limit=50");

  return (
    <section className="section">
      <div className="section__heading">
        <h2 className="section__title">お知らせ一覧</h2>
      </div>
      {newsRes.contents.length > 0 ? (
        <div className="card-list">
          {newsRes.contents.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      ) : (
        <p className="empty-state">まだお知らせがありません。</p>
      )}
    </section>
  );
}
