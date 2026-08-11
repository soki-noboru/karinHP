import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getNewsDetail } from "@/lib/microcms";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

async function fetchNewsOrNull(id: string) {
  try {
    return await getNewsDetail(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await fetchNewsOrNull(params.id);
  return { title: news ? `${news.title}｜わが家のホームページ` : "お知らせ" };
}

export default async function NewsDetailPage({ params }: Props) {
  const news = await fetchNewsOrNull(params.id);

  if (!news) {
    notFound();
  }

  return (
    <article className="article">
      {news.eyecatch && (
        <div className="article__eyecatch">
          <Image
            src={news.eyecatch.url}
            alt=""
            width={news.eyecatch.width}
            height={news.eyecatch.height}
            sizes="480px"
            priority
          />
        </div>
      )}
      <h1 className="article__title">{news.title}</h1>
      <div className="article__meta">
        {news.category && <span className="badge">{news.category}</span>}
        <span>{formatDate(news.publishedAt)}</span>
      </div>
      {/* microCMSのリッチエディタで作成された記事本文（母がmicroCMS管理画面から入力）を表示します */}
      <div
        className="article__body"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </article>
  );
}
