import Link from "next/link";
import { asset } from "@/lib/asset";
import { FormEnhance } from "@/components/FormEnhance";
import { ColumnEnhance } from "@/components/ColumnEnhance";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBar } from "@/components/CtaBar";
import { CHROME, localizeFormHtml, localePrefix, type Locale } from "@/lib/i18n";
import type { ScrapedPage } from "@/lib/pages";

/**
 * スクレイプしたCF7フォームを静的ホスティング上の contact.php に接続する。
 * action を差し替え、フォーム種別・返却先・ハニーポットを hidden 項目として注入する。
 */
function wireForm(
  html: string,
  form: "contact" | "reserve",
  locale: Locale,
): string {
  const prefix = localePrefix(locale);
  const hidden =
    `<input type="hidden" name="form" value="${form}">` +
    `<input type="hidden" name="return_path" value="${prefix}/${form}/">` +
    `<input type="hidden" name="locale" value="${locale}">` +
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

/** en/zh ページ内の内部リンクをロケールプレフィックス付きに書き換える */
function prefixInternalLinks(html: string, locale: Locale): string {
  if (locale === "ja") return html;
  const prefix = localePrefix(locale);
  const skip = /^\/(images|assets|css|ed|swell|_next|admin|contact\.php)/;
  return html.replace(/href="(\/[^"#]*)"/g, (m, p: string) =>
    skip.test(p) ? m : `href="${prefix}${p}"`,
  );
}

/** 下層ページ(/botox/ /fee/ /news/... 等)の共通描画。ja/en/zh 全ルートから使う */
export function UnderPageView({
  page,
  locale,
}: {
  page: ScrapedPage;
  locale: Locale;
}) {
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);

  // 本家と同じく、ブロックエディタ由来の記事(medi-column等)では
  // WP block-library + /ed/ 配下のSWELLフロントCSSを読み込む
  const needsBlockCss = /wp-block/.test(page.html);
  const needsSwellCss = /swl-|corg|swell-block|cap_box|mark_|u-fz-|min_width|is-style-/.test(page.html);
  const needsCf7 = page.url.endsWith("/contact/") || /wpcf7/.test(page.html);
  const needsAuthorCss = /wpae|wp-author/.test(page.html);
  const formKind = page.url.endsWith("/contact/")
    ? "contact"
    : page.url.endsWith("/reserve/")
      ? "reserve"
      : null;
  const bodyHtml = prefixInternalLinks(
    formKind
      ? wireForm(localizeFormHtml(page.html, locale), formKind, locale)
      : page.html,
    locale,
  );
  const titleBand = page.pageTitleHtml
    ? prefixInternalLinks(page.pageTitleHtml, locale)
    : null;

  return (
    <div
      className={`pbody ${page.bodyClass ?? ""}`}
      lang={locale === "zh" ? "zh-CN" : locale}
    >
      {needsSwellCss ? (
        <>
          <link rel="stylesheet" href={asset("/ed/wp-includes/css/dashicons.min.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-includes/css/dist/block-library/style.min.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/themes/swell/build/css/swell-icons.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/themes/swell/build/css/main.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/themes/swell/build/css/blocks.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/plugins/flexible-table-block/build/style-index.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/themes/swell_child/style.css")} />
          <link rel="stylesheet" href={asset("/ed/wp-content/plugins/useful-blocks/dist/css/front.css")} />
          {/* 本家がJSで注入するカスタムCSS(:root変数・cap_box等) */}
          <link rel="stylesheet" href={asset("/ed/custom-styles.css")} />
        </>
      ) : (
        needsBlockCss && (
          <link rel="stylesheet" href={asset("/css/wp-block-library.css")} />
        )
      )}
      {needsCf7 && (
        <link rel="stylesheet" href={asset("/css/cf7.css")} />
      )}
      {needsAuthorCss && (
        <>
          <link rel="stylesheet" href={asset("/css/wp-author.css")} />
          <link rel="stylesheet" href={asset("/css/wp-author-contributor.css")} />
        </>
      )}
      {(page.styles ?? []).map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <SiteHeader title={page.title} locale={locale} currentPath={page.url} />
      <div id="contents">
        {titleBand && (
          <div dangerouslySetInnerHTML={{ __html: titleBand }} />
        )}
        <div className="bread_wrap">
          <ul className="bread">
            {page.breadcrumb.map((b, i) => {
              const label =
                i === 0 && /^home$/i.test(b.label)
                  ? chrome.breadcrumbHome
                  : b.label;
              const href =
                b.href && b.href.startsWith("/")
                  ? prefix + b.href
                  : b.href;
              return (
                <li key={i}>
                  {href ? (
                    <>
                      <Link href={href}>{label}</Link>
                      &nbsp;&gt;&nbsp;
                    </>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
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
      <SiteFooter locale={locale} />
      <CtaBar locale={locale} />
      <ColumnEnhance />
    </div>
  );
}
