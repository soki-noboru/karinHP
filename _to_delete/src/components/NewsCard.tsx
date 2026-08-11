import Link from "next/link";
import Image from "next/image";
import type { News } from "@/types/microcms";
import { formatDate } from "@/lib/format";

export default function NewsCard({ news }: { news: News }) {
  return (
    <Link href={`/news/${news.id}`} className="news-card">
      <div className="news-card__thumb">
        {news.eyecatch && (
          <Image
            src={news.eyecatch.url}
            alt=""
            width={144}
            height={144}
            sizes="72px"
          />
        )}
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          {news.category && <span className="badge">{news.category}</span>}
          <span>{formatDate(news.publishedAt)}</span>
        </div>
        <p className="news-card__title">{news.title}</p>
      </div>
    </Link>
  );
}
