import type { MetadataRoute } from "next";

// スマートフォンでホーム画面に追加した際の、アプリ名・アイコン・配色を設定します。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "四柱推命鑑定 かりん",
    short_name: "かりん",
    description: "四柱推命鑑定・鑑定メニュー・お知らせ・お問い合わせ。",
    start_url: "/",
    display: "standalone",
    background_color: "#fff9f8",
    theme_color: "#e2839e",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
