import type { Metadata } from "next";
import { getMenuList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "鑑定メニュー｜四柱推命鑑定",
};

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menuRes = await getMenuList();

  return (
    <section className="section">
      <div className="section__heading" style={{ display: "block" }}>
        <span className="section__eyebrow">Menu</span>
        <h2 className="section__title">鑑定メニュー・料金</h2>
      </div>

      {menuRes.contents.length > 0 ? (
        <div>
          {menuRes.contents.map((item) => (
            <div key={item.id} className="menu-card">
              <div className="menu-card__row">
                <span className="menu-card__title">{item.title}</span>
                <span className="menu-card__price">{item.price}</span>
              </div>
              {item.duration && (
                <p className="menu-card__duration">所要時間目安: {item.duration}</p>
              )}
              {item.description && (
                <p className="menu-card__desc">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">現在、鑑定メニューを準備中です。</p>
      )}
    </section>
  );
}
