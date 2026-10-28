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
};

function pagesRoot() {
  return path.join(contentDir, "pages");
}

/** "/botox/" のようなURLパスで読む(先頭末尾スラッシュ有無どちらでも可) */
export function getScrapedPage(pathname: string): ScrapedPage | null {
  const rel = pathname.replace(/^\/+|\/+$/g, "");
  if (!rel) return null;
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

/** slug配列からコンテンツ上のパスへ。%エンコードされたディレクトリ名に対応 */
export function scrapedPathFromSlug(slug: string[]): string {
  const dirName = (seg: string) => {
    const enc = encodeURIComponent(seg).toLowerCase();
    return existsSync(path.join(pagesRoot(), enc)) ||
      !existsSync(path.join(pagesRoot(), seg))
      ? enc
      : seg;
  };
  return "/" + slug.map(dirName).join("/") + "/";
}
