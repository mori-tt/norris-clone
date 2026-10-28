import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
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
  return { title: page.docTitle };
}

export default async function UnderPage({
  params,
}: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
  if (!page) notFound();

  return (
    <div className={`pbody ${page.bodyClass ?? ""}`}>
      <SiteHeader title={page.title} />
      <div id="contents">
        {page.pageTitleHtml && (
          <div dangerouslySetInnerHTML={{ __html: page.pageTitleHtml }} />
        )}
        <div className="bread_wrap">
          <ul className="bread">
            {page.breadcrumb.map((b, i) => (
              <li key={i}>
                {b.href ? (
                  <>
                    <Link href={b.href}>{b.label}</Link>
                    &nbsp;&gt;&nbsp;
                  </>
                ) : (
                  b.label
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="inner clearfix">
          <div
            id="main"
            className={page.mainClass}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </div>
      </div>
    </div>
  );
}
