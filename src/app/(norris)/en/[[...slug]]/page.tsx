import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "../../page";
import { ColumnPageView } from "@/components/ColumnPageView";
import { UnderPageView } from "@/components/UnderPageView";
import type { Locale } from "@/lib/i18n";
import {
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
} from "@/lib/pages";

const LOCALE: Locale = "en";

/**
 * 英語版ルート(/en/...)。翻訳JSON(content/i18n/en/pages/...)があればそれを、
 * 無ければ日本語本文に英語クロームを付けて描画する。
 * /en/ はトップ、/en/column/... はSWELLサブサイト。
 */
export function generateStaticParams() {
  const params = listScrapedPaths().map((p) => ({
    slug: p
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .map((s) => decodeURIComponent(s)),
  }));
  return [{ slug: [] }, ...params];
}

type Params = Promise<{ slug?: string[] }>;

async function resolve(params: Params) {
  const { slug } = await params;
  if (!slug || slug.length === 0) return { slug: [], page: null };
  const page = getScrapedPage(scrapedPathFromSlug(slug), LOCALE);
  if (!page) notFound();
  return { slug, page };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { page } = await resolve(params);
  if (!page) return {};
  return {
    title: page.docTitle,
    alternates: {
      languages: {
        ja: page.url,
        en: `/en${page.url}`,
        zh: `/zh${page.url}`,
      },
    },
  };
}

export default async function LocalizedPage({ params }: { params: Params }) {
  const { slug, page } = await resolve(params);
  if (slug.length === 0) return <HomePage locale={LOCALE} />;
  if (!page) notFound();
  if (page.layout === "swell") {
    return <ColumnPageView page={page} locale={LOCALE} />;
  }
  return <UnderPageView page={page} locale={LOCALE} />;
}
