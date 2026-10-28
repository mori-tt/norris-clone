import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "../../../(ja)/page";
import { ColumnPageView } from "@/components/ColumnPageView";
import { UnderPageView } from "@/components/UnderPageView";
import { getSite } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import {
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
  slugUrlForm,
} from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";

const LOCALE: Locale = "zh";

/**
 * 中国語版ルート(/zh/...)。翻訳JSON(content/i18n/zh/pages/...)があればそれを、
 * 無ければ日本語本文に中国語クロームを付けて描画する。
 */
export function generateStaticParams() {
  const params = listScrapedPaths().map((p) => ({
    slug: p
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .map(slugUrlForm),
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
  const site = getSite(LOCALE);
  if (!page) {
    return pageMetadata({
      url: "/",
      title: `${site.name} | ${site.tagline}`,
      locale: LOCALE,
    });
  }
  return pageMetadata({
    url: page.url,
    title: page.docTitle,
    locale: LOCALE,
  });
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
