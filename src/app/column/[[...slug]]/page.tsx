import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColumnPageView } from "@/components/ColumnPageView";
import {
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
  slugUrlForm,
} from "@/lib/pages";

/**
 * /column/ サブサイト(SWELLテーマ)のページ。
 * 本家と同じく別テーマのサイトとして、body全体のスクレイプHTMLをそのまま描画する。
 * SWELL の CSS は public/swell/ にコピー済み。
 * 英語/中国語は /en|zh/column/... (norris 側のロケールルート)で描画する。
 */
export function generateStaticParams() {
  return listScrapedPaths()
    .filter((p) => p.startsWith("/column/"))
    .map((p) => ({
      slug: p
        .replace(/^\/column\/?|\/+$/g, "")
        .split("/")
        .filter(Boolean)
        .map(slugUrlForm),
    }));
}

async function loadPage(params: Promise<{ slug?: string[] }>) {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(["column", ...(slug ?? [])]));
  if (!page) notFound();
  return page;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const page = await loadPage(params);
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

export default async function ColumnPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const page = await loadPage(params);
  return <ColumnPageView page={page} locale="ja" />;
}
