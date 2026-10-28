import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-serif text-xl font-semibold">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-sm text-text/70">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
