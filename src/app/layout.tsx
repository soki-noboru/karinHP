import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "四柱推命鑑定",
  description: "四柱推命鑑定・鑑定メニュー・お知らせ・お問い合わせ。",
};

// スマートフォンでの表示を前提にした初期表示です。
// ピンチズームは禁止せず、見えづらい場合に拡大できるようにしています（アクセシビリティ配慮）。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
