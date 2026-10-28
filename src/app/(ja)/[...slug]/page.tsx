import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnderPageView } from "@/components/UnderPageView";
import {
  getPageDescription,
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
  slugUrlForm,
} from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";

/** 本家サイトの下層ページ(スクレイプ済みHTMLをそのまま描画) */
export function generateStaticParams() {
  return listScrapedPaths()
    .filter((p) => !p.startsWith("/column/"))
    .map((p) => ({
      slug: p
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .map(slugUrlForm),
    }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
  if (!page) return {};
  return pageMetadata({
    url: page.url,
    title: page.docTitle,
    description: getPageDescription(page.url),
    locale: "ja",
  });
}

export default async function UnderPage({
  params,
}: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
  if (!page) notFound();
  return <UnderPageView page={page} locale="ja" />;
}
