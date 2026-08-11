import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "四柱推命鑑定士 華鈴 ホームページ",
  description: "四柱推命鑑定・鑑定メニュー・お知らせ・お問い合わせ。",
  // スマートフォンの「ホーム画面に追加」で見せるアプリ名（アイコンは app/icon.png・app/apple-icon.png を自動で使用）
  appleWebApp: {
    title: "かりん",
  },
};

// スマートフォンでの表示を前提にした初期表示です。
// ピンチズームは禁止せず、見えづらい場合に拡大できるようにしています（アクセシビリティ配慮）。
// themeColorは、ホーム画面追加時やAndroidのブラウザ上部の色をサイトのピンクに合わせます。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e2839e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="page-shell">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
