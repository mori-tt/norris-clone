import Link from "next/link";
import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";

export const metadata: Metadata = {
  title: "404 - ページが見つかりません",
  robots: { index: false },
};

/** どのルートにもマッチしないURL用のグローバル404(レイアウトを通らないので<html>まで含める) */
export default function GlobalNotFound() {
  return (
    <RootShell lang="ja">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <p className="font-serif text-6xl font-semibold text-accent">404</p>
        <h1 className="mt-4 font-serif text-xl font-semibold">
          ページが見つかりません
        </h1>
        <p className="mt-3 text-sm text-text/70">
          お探しのページは移動または削除された可能性があります。
          <br />
          The page you are looking for may have been moved or deleted.
          <br />
          您查找的页面可能已被移动或删除。
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            トップへ戻る
          </Link>
          <Link
            href="/en/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Home (EN)
          </Link>
          <Link
            href="/zh/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            首页 (中文)
          </Link>
        </div>
      </div>
    </RootShell>
  );
}
