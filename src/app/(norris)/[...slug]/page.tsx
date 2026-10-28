import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnderPageView } from "@/components/UnderPageView";
import {
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
} from "@/lib/pages";

/** 本家サイトの下層ページ(スクレイプ済みHTMLをそのまま描画) */
export function generateStaticParams() {
  return listScrapedPaths()
    .filter((p) => !p.startsWith("/column/"))
    .map((p) => ({
      slug: p
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .map((s) => decodeURIComponent(s)),
    }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
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

export default async function UnderPage({
  params,
}: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
  if (!page) notFound();
  return <UnderPageView page={page} locale="ja" />;
}
