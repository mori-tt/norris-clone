#!/usr/bin/env node
/**
 * ノリスクリニック本番サイトの全下層ページをスクレイプし、
 * content/pages/<path>/index.json に保存する。
 *
 * - h1.header_title テキスト(ヘッダー表示用)
 * - ul.bread のパンくず
 * - #main の class と innerHTML
 * - 本文内画像は public/images/norris/uploads/ にDLし URL をローカルに書き換え
 * - テーマ画像 URL は /images/norris/<basename> に書き換え
 * - サイト内リンクは相対パスに書き換え
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const BASE = "https://www.norris-beauty-clinic.com";
const THEME_IMG = "/wp-content/themes/originalstyle-1column_05/img/";
const OUT_DIR = path.resolve("content/pages");
const IMG_DIR = path.resolve("public/images/norris/uploads");
const IMG_PREFIX = "/images/norris/uploads";

const IMG_RE = /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i;

/** 収集対象URL(sitemap + ページネーション) */
async function collectUrls() {
  const sitemaps = [
    "post-sitemap.xml",
    "page-sitemap.xml",
    "medi_column-sitemap.xml",
    "post-archive-sitemap.xml",
    "category-sitemap.xml",
    "medi-column-category-sitemap.xml",
  ];
  const urls = new Set();
  for (const s of sitemaps) {
    const xml = await fetchText(`${BASE}/${s}`);
    for (const m of xml.matchAll(/<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/g)) {
      const u = new URL(m[1]);
      const p = u.pathname;
      if (p === "/") continue;
      urls.add(p);
    }
  }
  // /column/ サブサイト(SWELLテーマ)
  const columnPaths = [
    "/column/",
    "/column/gender-reassignment-insurance/",
    "/column/skin-regeneration/",
    "/column/mtf-hormone/",
    "/column/std-test-insurance/",
    "/column/gender-change-affected-area/",
    "/column/stem-cells-rejuvenation/",
    "/column/what-mtf/",
    "/column/orchidectomy-cost/",
    "/column/what-regenerative-medicine/",
    "/column/acne-scars-therapy/",
    "/column/category/orchidectomy/",
    "/column/category/stem-cell/",
    "/column/category/sexually-transmitted-disease-test/",
  ];
  for (const p of columnPaths) urls.add(p);
  return [...urls];
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

const downloaded = new Map(); // url -> local path
async function downloadImage(url) {
  if (downloaded.has(url)) return downloaded.get(url);
  const u = new URL(url);
  let name = path.basename(decodeURIComponent(u.pathname));
  // 同名衝突回避
  let local = `${IMG_PREFIX}/${name}`;
  let file = path.join(IMG_DIR, name);
  let i = 1;
  while (downloaded.size && [...downloaded.values()].includes(local)) {
    const ext = path.extname(name);
    const stem = name.slice(0, -ext.length);
    name = `${stem}-${i}${ext}`;
    local = `${IMG_PREFIX}/${name}`;
    file = path.join(IMG_DIR, name);
    i++;
  }
  if (!existsSync(file)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`IMG NG ${res.status} ${url}`);
      downloaded.set(url, url);
      return url;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) {
      console.error(`IMG SMALL ${url}`);
      downloaded.set(url, url);
      return url;
    }
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buf);
  }
  downloaded.set(url, local);
  return local;
}

/** srcset 属性値をローカル化 */
async function rewriteSrcset(value) {
  const parts = value.split(",").map((s) => s.trim());
  const out = [];
  for (const part of parts) {
    if (!part) continue;
    const [u, ...rest] = part.split(/\s+/);
    out.push([await rewriteUrl(u, true), ...rest].join(" "));
  }
  return out.join(", ");
}

async function rewriteUrl(url, isImage) {
  if (!url || url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("tel:")) {
    return url;
  }
  let abs;
  try {
    abs = new URL(url, BASE);
  } catch {
    return url;
  }
  if (abs.origin !== new URL(BASE).origin) return url;
  const p = decodeURIComponent(abs.pathname);
  // テーマ画像 → 既存ローカルアセット
  if (p.startsWith(THEME_IMG)) {
    return `/images/norris/${path.basename(p)}`;
  }
  // uploads 画像 → ダウンロード
  if (isImage && IMG_RE.test(p)) {
    return downloadImage(abs.href);
  }
  if (p.startsWith("/wp-content/uploads/") && IMG_RE.test(p)) {
    return downloadImage(abs.href);
  }
  if (p.startsWith("/column/wp-content/") && IMG_RE.test(p)) {
    return downloadImage(abs.href);
  }
  // 内部リンク → 相対パス
  return p + (abs.hash || "");
}

async function scrapePage(pagePath) {
  const url = `${BASE}${pagePath}`;
  const html = await fetchText(url);
  const $ = cheerio.load(html);

  const headerTitle = $(".header_title").first().clone().find("a").remove().end().text().trim().replace(/\s+/g, " ");
  const docTitle = $("title").first().text().trim();
  const isColumn = pagePath.startsWith("/column/");

  if (isColumn) {
    // SWELLテーマのサブサイト: body 全体を抽出
    const bodyHtml0 = $("body").html() || "";
    const styles = [];
    $("style").each((_, el) => {
      const t = $(el).html();
      if (t && t.trim()) styles.push(t);
    });
    const bodyClass = ($("body").attr("class") || "").trim();
    const root0 = cheerio.load("<div id=__r></div>", null, false);
    root0("#__r").html(bodyHtml0);
    root0("script, noscript, iframe").remove();
    const jobs0 = [];
    root0("[src]").each((_, el) => {
      const $el = root0(el);
      jobs0.push(
        (async () => {
          const v = $el.attr("src");
          if (v) $el.attr("src", await rewriteUrl(v, true));
        })()
      );
    });
    root0("[srcset]").each((_, el) => {
      const $el = root0(el);
      jobs0.push(
        (async () => {
          const v = $el.attr("srcset");
          if (v) $el.attr("srcset", await rewriteSrcset(v));
        })()
      );
    });
    root0("a[href]").each((_, el) => {
      const $el = root0(el);
      jobs0.push(
        (async () => {
          const v = $el.attr("href");
          if (!v || v.startsWith("#")) return;
          $el.attr("href", await rewriteUrl(v, false));
        })()
      );
    });
    root0("[onclick]").removeAttr("onclick");
    root0("link[href]").each((_, el) => {
      root0(el).remove();
    });
    await Promise.all(jobs0);
    const bodyHtml = root0("#__r").html() || "";
    const outDir = path.join(OUT_DIR, pagePath);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      path.join(outDir, "index.json"),
      JSON.stringify(
        {
          url: pagePath,
          title: docTitle,
          docTitle,
          layout: "swell",
          bodyClass,
          styles,
          breadcrumb: [],
          html: bodyHtml,
        },
        null,
        1
      )
    );
    console.log(`OK ${pagePath} (swell)`);
    return;
  }

  const main = $("#main").first();
  if (!main.length) {
    console.error(`NO MAIN: ${pagePath}`);
    return null;
  }
  const mainClass = (main.attr("class") || "").trim();
  const bodyClass = ($("body").attr("class") || "").trim().replace(/\s+/g, " ");
  const pageTitleEl = $(".page-title").first();
  const pageTitleHtml = pageTitleEl.length ? $.html(pageTitleEl) : "";

  const breadcrumb = [];
  $("ul.bread li").each((_, li) => {
    const $li = $(li);
    const a = $li.find("a").first();
    const label = $li.text().replace(/\s|>| /g, " ").trim();
    breadcrumb.push({
      label: label || a.text().trim(),
      href: a.length ? new URL(a.attr("href"), BASE).pathname : null,
    });
  });

  // メインHTML内のURL書き換え
  const root = cheerio.load("<div id=__r></div>", null, false);
  root("#__r").html(main.html());
  const jobs = [];
  root("[src]").each((_, el) => {
    const $el = root(el);
    jobs.push(
      (async () => {
        const v = $el.attr("src");
        if (v) $el.attr("src", await rewriteUrl(v, true));
      })()
    );
  });
  root("[srcset]").each((_, el) => {
    const $el = root(el);
    jobs.push(
      (async () => {
        const v = $el.attr("srcset");
        if (v) $el.attr("srcset", await rewriteSrcset(v));
      })()
    );
  });
  root("[data-src]").each((_, el) => {
    const $el = root(el);
    jobs.push(
      (async () => {
        const v = $el.attr("data-src");
        if (v) $el.attr("data-src", await rewriteUrl(v, true));
      })()
    );
  });
  root("a[href]").each((_, el) => {
    const $el = root(el);
    jobs.push(
      (async () => {
        const v = $el.attr("href");
        if (!v || v.startsWith("#")) return;
        $el.attr("href", await rewriteUrl(v, false));
      })()
    );
  });
  root("img").removeAttr("loading"); // 静的書き出しではlazy不要
  root("[onclick]").removeAttr("onclick");
  await Promise.all(jobs);

  const bodyHtml = root("#__r").html() || "";

  const outDir = path.join(OUT_DIR, pagePath);
  await mkdir(outDir, { recursive: true });
  const data = {
    url: pagePath,
    title: headerTitle || docTitle,
    docTitle,
    mainClass,
    bodyClass,
    pageTitleHtml,
    breadcrumb,
    html: bodyHtml,
  };
  await writeFile(path.join(outDir, "index.json"), JSON.stringify(data, null, 1));
  console.log(`OK ${pagePath} (title=${data.title.slice(0, 30)})`);
}

const urls = await collectUrls();
console.log(`${urls.length} pages to scrape`);
const CONCURRENCY = 4;
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  await Promise.all(urls.slice(i, i + CONCURRENCY).map((p) => scrapePage(p).catch((e) => console.error(`FAIL ${p}: ${e.message}`))));
}
console.log(`done. images downloaded: ${downloaded.size}`);
