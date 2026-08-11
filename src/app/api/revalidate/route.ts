import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import type { MicroCMSWebhookPayload } from "@/types/microcms";

/**
 * microCMSのWebhookから呼び出されるエンドポイントです。
 * 母がmicroCMSの管理画面で「公開」「更新」「削除」を行うと、
 * microCMSがこのURLにリクエストを送ってきて、サイトのキャッシュを即座に更新します。
 *
 * microCMS側の設定（各APIごとの API設定 > Webhook）で以下を登録してください:
 *   URL: https://あなたのサイト/api/revalidate?secret=環境変数REVALIDATE_SECRETと同じ値
 *   対象API: news, gallery, menu, profile, schedule の5つすべてに設定してください
 *   実行タイミング: コンテンツ公開時 / 更新時 / 削除時（すべてチェック）
 */
const KNOWN_TAGS = ["news", "gallery", "menu", "profile", "schedule"];

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "secretが正しくありません" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as MicroCMSWebhookPayload | null;
  const api = body?.api;

  if (api && KNOWN_TAGS.includes(api)) {
    revalidateTag(api);
    return NextResponse.json({ revalidated: true, api });
  }

  // どのAPIか判別できない場合は念のため全APIを再検証します
  KNOWN_TAGS.forEach((tag) => revalidateTag(tag));
  return NextResponse.json({ revalidated: true, api: "all" });
}

// ブラウザから直接アクセスした場合の簡易な疎通確認用
export async function GET() {
  return NextResponse.json({ ok: true, message: "This endpoint accepts POST from microCMS webhook." });
}
