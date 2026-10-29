import { asset } from "@/lib/asset";
import { localePrefix, type Locale } from "@/lib/i18n";
import type { ScrapedPage } from "@/lib/pages";
import { ColumnEnhance } from "@/components/ColumnEnhance";

/**
 * /column/ サブサイト(SWELLテーマ)のページ描画。
 * スクレイプしたbody全体(独自ヘッダー/フッター込み)をそのまま描画する。
 * 本文内リンクはスクレイプ時に /column/... 形式へ書き換え済み。
 * en/zh では <a href="/column/..."> を /<locale>/column/... に書き換えて
 * ロケール内ナビゲーションを維持する。
 */
function prefixColumnLinks(html: string, locale: Locale): string {
  if (locale === "ja") return html;
  const prefix = localePrefix(locale);
  // 内部リンク全般にロケールプレフィックスを付与。
  // 画像・CSS・PHP等の直接参照は除外。
  const skip = /^\/(images|assets|css|ed|swell|_next|admin|contact\.php)/;
  return html.replace(/href="(\/[^"#]*)"/g, (m, p: string) =>
    skip.test(p) ? m : `href="${prefix}${p}"`,
  );
}

export function ColumnPageView({
  page,
  locale,
}: {
  page: ScrapedPage;
  locale: Locale;
}) {
  return (
    <div
      className={page.bodyClass ?? ""}
      lang={locale === "zh" ? "zh-CN" : locale}
    >
      {/* SWELL テーマのCSS(スクレイプ時に本家の link[rel=stylesheet] を取得) */}
      {(page.cssLinks ?? []).map((href) => (
        <link key={href} rel="stylesheet" href={asset(href)} />
      ))}
      {(page.styles ?? []).map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <div
        dangerouslySetInnerHTML={{
          __html: prefixColumnLinks(page.html, locale),
        }}
      />
      <ColumnEnhance />
    </div>
  );
}
