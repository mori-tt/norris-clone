import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getScrapedPage,
  listScrapedPaths,
  scrapedPathFromSlug,
} from "@/lib/pages";

/**
 * /column/ サブサイト(SWELLテーマ)のページ。
 * 本家と同じく別テーマのサイトとして、body全体のスクレイプHTMLをそのまま描画する。
 * SWELL の CSS は public/swell/ にコピー済み。
 */
export function generateStaticParams() {
  return listScrapedPaths()
    .filter((p) => p.startsWith("/column/"))
    .map((p) => ({
      slug: p
        .replace(/^\/column\/?|\/+$/g, "")
        .split("/")
        .filter(Boolean)
        .map((s) => decodeURIComponent(s)),
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
  return { title: page.docTitle };
}

export default async function ColumnPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const page = await loadPage(params);

  return (
    <div className={page.bodyClass ?? ""}>
      {/* SWELL テーマのCSS(スクレイプ時に本家の link[rel=stylesheet] を取得) */}
      {(page.cssLinks ?? []).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {(page.styles ?? []).map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
