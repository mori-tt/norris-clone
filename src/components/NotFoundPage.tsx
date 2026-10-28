import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localePrefix } from "@/lib/i18n";

const TEXT: Record<Locale, { title: string; body: string; back: string }> = {
  ja: {
    title: "ページが見つかりません",
    body: "お探しのページは移動または削除された可能性があります。",
    back: "トップページへ戻る",
  },
  en: {
    title: "Page not found",
    body: "The page you are looking for may have been moved or deleted.",
    back: "Back to top",
  },
  zh: {
    title: "找不到页面",
    body: "您查找的页面可能已被移动或删除。",
    back: "返回首页",
  },
};

export function NotFoundPage({ locale = "ja" }: { locale?: Locale }) {
  const t = TEXT[locale];
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-serif text-xl font-semibold">{t.title}</h1>
      <p className="mt-3 text-sm text-text/70">{t.body}</p>
      <Link
        href={`${localePrefix(locale)}/`}
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
      >
        {t.back}
      </Link>
    </div>
  );
}
