import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state">
      <p>ページが見つかりませんでした。</p>
      <Link href="/" className="back-link">
        ホームへ戻る
      </Link>
    </div>
  );
}
