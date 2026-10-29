/**
 * スクレイプHTMLのレンダリング前サニタイズ(ビルド時・サーバー側のみで実行)。
 * dangerouslySetInnerHTML に渡す文字列を安全にする目的のため、
 * クライアント側では動作しない/不要な要素を除去・無害化する。
 */

/** 元サイトのアフィリエイト/トラッキング経由リンク(アンカーを剥がして中身だけ残す) */
const AFFILIATE_HOSTS = [
  "t.afi-b.com",
  "t.felmat.net",
  "px.a8.net",
  "daicon-link.com",
  "moteo.best",
];

/** 元サイト側でも 404/403 の死にリンク(アンカーを剥がす) */
const DEAD_PATH_SEGMENTS = ["aga", "liftup"];

/** 元サイトドメインに残った画像参照 → ローカル配備したファイルへ */
const ORIGIN_SRC_MAP: Record<string, string> = {
  "/wp-content/uploads/harg.jpg": "/images/norris/upload/harg.jpg",
  "/wp-content/uploads/rejuvenation_img002.png":
    "/images/norris/upload/rejuvenation_img002.png",
};

function pathnameOf(url: string): string | null {
  if (url.startsWith("/")) return url;
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function isAffiliate(href: string): boolean {
  try {
    return AFFILIATE_HOSTS.includes(new URL(href).hostname);
  } catch {
    return false;
  }
}

function isDeadPath(href: string): boolean {
  const p = pathnameOf(href);
  if (!p) return false;
  const segs = p.split("/").filter(Boolean);
  if (!segs.length) return false;
  const last = segs[segs.length - 1];
  // /aga/, /en/aga/ 等ロケールプレフィックス有無どちらも対象
  return (
    DEAD_PATH_SEGMENTS.includes(last) &&
    segs.every((s) => s === last || ["en", "zh"].includes(s))
  );
}

/** <a ...>...</a> のうち pred(href) が真のものを中身だけに展開 */
function unwrapAnchors(
  html: string,
  pred: (href: string, openTag: string) => boolean,
): string {
  const re = /<a\b[^>]*>[\s\S]*?<\/a\s*>/gi;
  let prev: string;
  let out = html;
  // 剥がした結果さらに条件に合うものが出る場合に備え2パスまで反復
  for (let i = 0; i < 2; i++) {
    prev = out;
    out = out.replace(re, (m) => {
      const open = m.match(/<a\b[^>]*>/i)![0];
      const href = open.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
      const closeAt = m.toLowerCase().lastIndexOf("</a");
      const inner = m.slice(open.length, closeAt);
      return pred(href, open) ? inner : m;
    });
    if (out === prev) break;
  }
  return out;
}

/** target="_blank" の <a> に rel="noopener noreferrer" を確実に付与 */
function hardenBlankTargets(html: string): string {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    if (!/target\s*=\s*["']_blank["']/i.test(tag)) return tag;
    const relM = tag.match(/\srel\s*=\s*["']([^"']*)["']/i);
    const toks = new Set(
      (relM?.[1] ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => t.toLowerCase()),
    );
    toks.add("noopener");
    toks.add("noreferrer");
    const rel = `rel="${[...toks].join(" ")}"`;
    return relM ? tag.replace(relM[0], ` ${rel}`) : tag.replace(/<a\b/i, `<a ${rel} `);
  });
}

/** src/href が元サイトドメインを指す参照をローカルに書き換え */
function rewriteOriginUrls(html: string): string {
  return html.replace(
    /(src|href)\s*=\s*(["'])https?:\/\/(?:www\.)?norris-beauty-clinic\.com([^"']*)\2/gi,
    (m, attr: string, q: string, p: string) => {
      const local = ORIGIN_SRC_MAP[p];
      return local ? `${attr}=${q}${local}${q}` : `${attr}=${q}/${q}`;
    },
  );
}

/**
 * スクレイプ時に途中切断された `url(data:image/svg+xml;` を無害化。
 * 切断により `)` が欠落し `data:image/svg+xml;"` の形で属性終端になっている。
 */
function fixTruncatedDataUris(html: string): string {
  return html.replace(
    /url\(\s*data:image\/svg\+xml;\s*(?=["')])/g,
    "url()",
  );
}

/** <script> ブロックを除去(innerHTML注入では実行されないが残存コードを残さない) */
function stripScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

/** href="javascript:..." を中立化(元サイトではJSフック用、クローンでは機能しない) */
function neutralizeJavascriptHrefs(html: string): string {
  return html.replace(
    /href\s*=\s*(["'])\s*javascript:[^"']*\1/gi,
    'href="#"',
  );
}

/** スクレイプHTML一括サニタイズ。生成物(out)の監査でゼロ件であることを前提とする。 */
export function sanitizeScrapedHtml(html: string): string {
  if (!html) return html;
  let out = html;
  out = stripScripts(out);
  out = neutralizeJavascriptHrefs(out);
  out = fixTruncatedDataUris(out);
  out = rewriteOriginUrls(out);
  out = unwrapAnchors(out, (href) => isAffiliate(href));
  out = unwrapAnchors(out, (href) => isDeadPath(href));
  out = hardenBlankTargets(out);
  return out;
}
