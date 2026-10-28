import type { Metadata } from "next";
import { getSite } from "./content";
import type { Locale } from "./i18n";
import { localePrefix } from "./i18n";
import { slugUrlForm } from "./pages";

/**
 * サイトの公開URL。新ドメイン運用時は SITE_URL 環境変数を設定するだけで
 * canonical/hreflang/sitemap/robots すべてがそのドメインに正規化される。
 * 未設定時は GitHub Pages のプロジェクトページURLを使う。
 */
export function siteUrl(): string {
  const u = process.env.SITE_URL ?? "https://mori-tt.github.io/norris-clone";
  return u.replace(/\/+$/, "");
}

const OG_LOCALE: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  zh: "zh_CN",
};

/**
 * ページごとのメタデータを一括生成。
 * canonical・hreflang(ja/en/zh/x-default)・Open Graph・Twitter Card を
 * 本家サイトと同構成で出力する。url にはロケール接頭辞を含めない
 * コンテンツ上のパス("/doctor/")を渡す。
 */
export function pageMetadata({
  url,
  title,
  description,
  locale,
}: {
  url: string;
  title: string;
  description?: string;
  locale: Locale;
}): Metadata {
  const base = siteUrl();
  const prefix = localePrefix(locale);
  // 日本語スラッグ等を含むパスをブラウザが使うURL形式(大文字エンコード)に揃える
  const normUrl = url
    .split("/")
    .map((seg) => (seg === "" ? seg : slugUrlForm(seg)))
    .join("/");
  const canonical = `${base}${prefix}${normUrl}`;
  const site = getSite(locale);
  const desc = description ?? site.description;
  return {
    // docTitle は既にページ名+サイト名を含む完全形なのでテンプレを効かせない
    title: { absolute: title },
    description: desc,
    alternates: {
      canonical,
      languages: {
        ja: `${base}${normUrl}`,
        en: `${base}/en${normUrl}`,
        zh: `${base}/zh${normUrl}`,
        "x-default": `${base}${normUrl}`,
      },
    },
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      siteName: site.name,
      title,
      description: desc,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}
