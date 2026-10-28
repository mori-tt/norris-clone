import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormEnhance } from "@/components/FormEnhance";
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

/**
 * スクレイプしたCF7フォームを静的ホスティング上の contact.php に接続する。
 * action を差し替え、フォーム種別・返却先・ハニーポットを hidden 項目として注入する。
 */
function wireForm(html: string, form: "contact" | "reserve"): string {
  const returnPath = `/${form}/`;
  const hidden =
    `<input type="hidden" name="form" value="${form}">` +
    `<input type="hidden" name="return_path" value="${returnPath}">` +
    `<input type="hidden" name="started_at" value="">` +
    `<div class="contact-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>`;
  return html
    .replace(
      /<form action="[^"]*" method="post" class="wpcf7-form[^"]*"/,
      `<form action="/contact.php" method="post" class="wpcf7-form init"`,
    )
    .replace(
      /(<form action="\/contact\.php"[^>]*>)/,
      `$1${hidden}`,
    );
}

export default async function UnderPage({
  params,
}: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const page = getScrapedPage(scrapedPathFromSlug(slug));
  if (!page) notFound();

  // 本家と同じく、ブロックエディタ由来の記事(medi-column等)では
  // WP block-library + /ed/ 配下のSWELLフロントCSSを読み込む
  const needsBlockCss = /wp-block/.test(page.html);
  const needsSwellCss = /swl-|corg|swell-block|cap_box|mark_|u-fz-|min_width|is-style-/.test(page.html);
  const needsCf7 = page.url === "/contact/" || /wpcf7/.test(page.html);
  const needsAuthorCss = /wpae|wp-author/.test(page.html);
  const formKind =
    page.url === "/contact/"
      ? "contact"
      : page.url === "/reserve/"
        ? "reserve"
        : null;
  const bodyHtml = formKind ? wireForm(page.html, formKind) : page.html;

  return (
    <div className={`pbody ${page.bodyClass ?? ""}`}>
      {needsSwellCss ? (
        <>
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-includes/css/dashicons.min.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-includes/css/dist/block-library/style.min.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/themes/swell/build/css/swell-icons.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/themes/swell/build/css/main.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/themes/swell/build/css/blocks.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/plugins/flexible-table-block/build/style-index.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/themes/swell_child/style.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/wp-content/plugins/useful-blocks/dist/css/front.css" />
          {/* 本家がJSで注入するカスタムCSS(:root変数・cap_box等) */}
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/ed/custom-styles.css" />
        </>
      ) : (
        needsBlockCss && (
          /* eslint-disable-next-line @next/next/no-css-tags */
          <link rel="stylesheet" href="/css/wp-block-library.css" />
        )
      )}
      {needsCf7 && (
        /* eslint-disable-next-line @next/next/no-css-tags */
        <link rel="stylesheet" href="/css/cf7.css" />
      )}
      {needsAuthorCss && (
        <>
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/css/wp-author.css" />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/css/wp-author-contributor.css" />
        </>
      )}
      {(page.styles ?? []).map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
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
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
          {formKind && <FormEnhance />}
        </div>
      </div>
    </div>
  );
}
