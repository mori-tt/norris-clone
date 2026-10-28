import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { contentDir } from "./content";

/**
 * scripts/scrape-norris-pages.mjs で取得した下層ページ。
 * content/pages/<url path>/index.json の JSON として保存されている。
 */
export type ScrapedPage = {
  url: string;
  title: string;
  docTitle: string;
  mainClass?: string;
  bodyClass?: string;
  pageTitleHtml?: string;
  breadcrumb: { label: string; href: string | null }[];
  html: string;
  layout?: "swell";
  styles?: string[];
  /** SWELLサブサイトの外部CSS(/swell/以下のローカルパス) */
  cssLinks?: string[];
};

function pagesRoot() {
  return path.join(contentDir, "pages");
}

let _descriptions: Record<string, string> | undefined;
/**
 * 本家から取得したページ固有のmeta description(content/descriptions.json)。
 * 無いページは undefined を返す(呼び出し側でサイト共通descriptionにフォールバック)。
 */
export function getPageDescription(url: string): string | undefined {
  _descriptions ??= JSON.parse(
    readFileSync(path.join(contentDir, "descriptions.json"), "utf8"),
  ) as Record<string, string>;
  return _descriptions[url];
}

/** "/botox/" のようなURLパスで読む(先頭末尾スラッシュ有無どちらでも可) */
export function getScrapedPage(pathname: string, locale = "ja"): ScrapedPage | null {
  const rel = pathname.replace(/^\/+|\/+$/g, "");
  if (!rel) return null;
  // 翻訳版(content/i18n/<locale>/pages/...)があれば優先、無ければ日本語
  if (locale !== "ja") {
    const i18nFile = path.join(contentDir, "i18n", locale, "pages", rel, "index.json");
    if (existsSync(i18nFile)) {
      return JSON.parse(readFileSync(i18nFile, "utf8")) as ScrapedPage;
    }
  }
  const file = path.join(pagesRoot(), rel, "index.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as ScrapedPage;
}

/** content/pages 配下の全URLパス("/botox/"形式)を列挙 */
export function listScrapedPaths(): string[] {
  const base = pagesRoot();
  const out: string[] = [];
  const walk = (dir: string, segs: string[]) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(dir, e.name), [...segs, e.name]);
      else if (e.name === "index.json" && segs.length > 0) {
        out.push("/" + segs.join("/") + "/");
      }
    }
  };
  walk(base, []);
  return out;
}

/**
 * ディレクトリ名をgenerateStaticParams用のURLパラメータ形式に正規化。
 * output:export はURLエンコード済み(大文字%E3…)のセグメントを要求するため、
 * FS上の小文字エンコード名・デコード名のどちらが来ても大文字エンコード形式に揃える。
 */
export function slugUrlForm(seg: string): string {
  let dec = seg;
  if (/%[0-9a-fA-F]{2}/.test(seg)) {
    try {
      dec = decodeURIComponent(seg);
    } catch {
      dec = seg;
    }
  }
  return encodeURIComponent(dec);
}

/**
 * slug配列からコンテンツ上のパスへ。%エンコードされたディレクトリ名に対応。
 * Nextが渡すslugはURL形式(%E3%82%AF…)だが、環境・経路によっては
 * デコード済みや二重エンコードも来るため、実在するディレクトリ名と
 * 「完全デコードした形」同士を比較して解決する(形式不変・大小文字不問)。
 */
function fullyDecode(seg: string): string {
  let s = seg;
  for (let i = 0; i < 5; i++) {
    if (!/%[0-9a-fA-F]{2}/.test(s)) break;
    try {
      const d = decodeURIComponent(s);
      if (d === s) break;
      s = d;
    } catch {
      break;
    }
  }
  return s;
}

export function scrapedPathFromSlug(slug: string[]): string {
  let dir = pagesRoot();
  const parts: string[] = [];
  for (const seg of slug) {
    const want = fullyDecode(seg);
    let found: string | undefined;
    try {
      found = readdirSync(dir).find((n) => fullyDecode(n) === want);
    } catch {
      found = undefined;
    }
    const name = found ?? encodeURIComponent(want).toLowerCase();
    parts.push(name);
    dir = path.join(dir, name);
  }
  return "/" + parts.join("/") + "/";
}
