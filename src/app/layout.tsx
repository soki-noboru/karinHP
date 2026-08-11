import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "四柱推命鑑定",
  description: "四柱推命鑑定・鑑定メニュー・お知らせ・お問い合わせ。",
};

// スマートフォンでの表示を前提に、拡大縮小を抑えつつ見やすい初期表示にします
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
