#!/usr/bin/env node
/**
 * content/pages/**(index.json) と content/*.json を英語・中国語に機械翻訳して
 * content/i18n/<locale>/ 配下に出力する。
 *
 * 使い方:
 *   node scripts/translate-pages.mjs            # en + zh を全ページ翻訳(再開可能)
 *   node scripts/translate-pages.mjs en         # en のみ
 *   node scripts/translate-pages.mjs en --only fee
 *   node scripts/translate-pages.mjs --force    # 既存出力も再翻訳
 *
 * 翻訳エンジン:
 *   既定 = Google 翻訳の公開エンドポイント(キー不要・低速なので並列実行)
 *   DEEPL_API_KEY=xxx で DeepL API v2 を利用(品質向上・有料枠)
 *
 * 既存の出力ファイルは元ファイルより新しければスキップする(再開可能)。
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = path.resolve(process.env.CONTENT_DIR ?? "content");
const LOCALES = process.argv.filter((a) => a === "en" || a === "zh");
const TARGETS = LOCALES.length ? LOCALES : ["en", "zh"];
const FORCE = process.argv.includes("--force");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const TL = { en: "en", zh: "zh-CN" };
const CONCURRENCY = 2;
const MAX_CHARS = 4000;
const BATCH_GAP_MS = 400;
const RATE_LIMIT_BACKOFF_MS = 20000;

const CJK = /[぀-ヿ一-鿿]/;
const SKIP_NODE = "script,style,noscript,form,iframe,code,pre";
const SKIP_KEYS = new Set([
  "url", "href", "image", "imageSp", "avatar", "src", "tel", "tel2",
  "postalCode", "slug", "date", "order", "theme", "instagramUrl", "lineUrl",
  "nameEn", "layout", "cssLinks", "styles", "mainClass", "bodyClass",
  "titleBg", "instagramUser", "form",
]);
// 属性値の翻訳対象
const TEXT_ATTRS = ["alt", "title", "placeholder"];

// ---------- 翻訳コア ----------

async function gtxTranslate(text, target) {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=ja&tl=${encodeURIComponent(target)}&dt=t` +
    `&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data[0] ?? []).map((seg) => seg[0]).join("");
}

async function deeplTranslate(text, target) {
  const body = new URLSearchParams({
    auth_key: process.env.DEEPL_API_KEY,
    text,
    source_lang: "JA",
    target_lang: target === "zh-CN" ? "ZH" : target.toUpperCase(),
  });
  const host = process.env.DEEPL_API_FREE === "1"
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
  const res = await fetch(host, { method: "POST", body, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`);
  const data = await res.json();
  return data.translations.map((t) => t.text).join("");
}

const translate1 = process.env.DEEPL_API_KEY ? deeplTranslate : gtxTranslate;

async function withRetry(fn, tries = 4) {
  let err;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      // 429 は長めに待つ
      const wait = /429/.test(String(e?.message))
        ? RATE_LIMIT_BACKOFF_MS * (i + 1)
        : 800 * (i + 1) + Math.random() * 400;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw err;
}

/**
 * 文字列配列を @@@ 区切りでまとめて翻訳する。
 * 分割数が合わない場合は1件ずつ個別翻訳にフォールバック。
 */
async function translateBatch(strings, target) {
  if (strings.length === 0) return [];
  const fallbackEach = async () => {
    const out = [];
    for (const s of strings) {
      const tr = await withRetry(() => translate1(s, target)).catch((e) => {
        console.error(`\n[warn] 翻訳失敗(原文のまま): ${s.slice(0, 30)}… ${e.message}`);
        return s;
      });
      out.push(tr);
      await new Promise((r) => setTimeout(r, 120));
    }
    return out;
  };
  const joined = strings.join("\n@@@\n");
  try {
    const out = await withRetry(() => translate1(joined, target));
    const parts = out.split(/@@@/).map((s) => s.trim());
    if (parts.length === strings.length) return parts;
  } catch (e) {
    console.error(`\n[warn] バッチ翻訳失敗→個別翻訳へ: ${e.message}`);
  }
  return fallbackEach();
}

/** 必要な文字列だけを翻訳(CJKを含むもの)。キャッシュで重複除去 */
async function translateAll(strings, target) {
  const unique = [...new Set(strings)];
  const result = new Map();
  let batch = [];
  let chars = 0;
  const flush = async () => {
    if (!batch.length) return;
    const items = batch;
    batch = [];
    chars = 0;
    const translated = await translateBatch(items, target);
    items.forEach((s, i) => result.set(s, translated[i]));
    await new Promise((r) => setTimeout(r, BATCH_GAP_MS));
    process.stderr.write(".");
  };
  const tasks = [];
  const enqueue = (s) => {
    batch.push(s);
    chars += s.length;
    if (chars > MAX_CHARS) {
      tasks.push(flush());
      if (tasks.length >= CONCURRENCY) {
        return Promise.all(tasks.splice(0, tasks.length)).catch(() => {});
      }
    }
    return null;
  };
  for (const s of unique) {
    const p = enqueue(s);
    if (p) await p;
  }
  tasks.push(flush());
  await Promise.all(tasks);
  return result;
}

const t = (map, s) => (s && map.has(s) ? map.get(s) : s);

// ---------- スクレイプページ ----------

/** html 内の翻訳対象文字列(テキストノード + 属性値)を列挙 */
function collectHtmlStrings(html, set) {
  if (!html) return;
  const $ = cheerio.load(`<div id="__r">${html}</div>`, null, false);
  $("#__r")
    .find(TEXT_ATTRS.map((a) => `[${a}]`).join(","))
    .each((_, el) => {
      for (const a of TEXT_ATTRS) {
        const v = el.attribs?.[a];
        if (v && CJK.test(v)) set.add(v);
      }
    });
  $("#__r")
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type !== "text") return;
      if ($(node.parent).closest(SKIP_NODE).length) return;
      const v = node.data.trim();
      if (v && CJK.test(v)) set.add(v);
    });
}

function collectPageStrings(page) {
  const set = new Set();
  const add = (s) => {
    if (s && CJK.test(s)) set.add(s.trim());
  };
  add(page.title);
  add(page.docTitle);
  for (const b of page.breadcrumb ?? []) add(b.label);
  collectHtmlStrings(page.pageTitleHtml, set);
  collectHtmlStrings(page.html, set);
  return set;
}

/** html を再パースして map でテキストノード/属性値を置換する */
function applyHtmlTranslation(html, map) {
  if (!html) return html;
  const $ = cheerio.load(`<div id="__r">${html}</div>`, null, false);
  $("#__r")
    .find(TEXT_ATTRS.map((a) => `[${a}]`).join(","))
    .each((_, el) => {
      for (const a of TEXT_ATTRS) {
        const v = el.attribs?.[a];
        const tr = v && map.get(v);
        if (tr) el.attribs[a] = tr;
      }
    });
  $("#__r")
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type !== "text") return;
      if ($(node.parent).closest(SKIP_NODE).length) return;
      const v = node.data.trim();
      const tr = v && map.get(v);
      if (tr) node.data = node.data.replace(v, tr);
    });
  return $("#__r").html();
}

function applyPageTranslation(page, map) {
  const out = { ...page };
  out.title = t(map, page.title) ?? page.title;
  out.docTitle = t(map, page.docTitle) ?? page.docTitle;
  out.breadcrumb = (page.breadcrumb ?? []).map((b) => ({
    ...b,
    label: t(map, b.label?.trim()) ?? b.label,
  }));
  out.pageTitleHtml = applyHtmlTranslation(page.pageTitleHtml, map);
  out.html = applyHtmlTranslation(page.html, map);
  return out;
}

// ---------- 汎用JSONコンテンツ ----------

function collectJsonStrings(obj, key = "", set = new Set()) {
  if (typeof obj === "string") {
    if (!SKIP_KEYS.has(key) && CJK.test(obj)) set.add(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((v) => collectJsonStrings(v, key, set));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) collectJsonStrings(v, k, set);
  }
  return set;
}

function applyJsonTranslation(obj, map, key = "") {
  if (typeof obj === "string") {
    return !SKIP_KEYS.has(key) && map.has(obj) ? map.get(obj) : obj;
  }
  if (Array.isArray(obj)) return obj.map((v) => applyJsonTranslation(v, map, key));
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, applyJsonTranslation(v, map, k)]),
    );
  }
  return obj;
}

// ---------- 実行 ----------

function listPageFiles() {
  const base = path.join(ROOT, "pages");
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "index.json") out.push(p);
    }
  };
  walk(base);
  return out;
}

const JSON_CONTENTS = [
  "site.json", "home.json", "access.json", "clinic.json",
  "doctor.json", "fee.json", "schedule.json",
];

async function main() {
  const files = listPageFiles().filter(
    (f) => !ONLY || f.includes(`/${ONLY}/`) || f.includes(ONLY),
  );
  console.log(`${files.length} pages, locales: ${TARGETS.join(",")}`);

  for (const loc of TARGETS) {
    console.log(`\n=== ${loc} ===`);
    for (const file of files) {
      const rel = path.relative(path.join(ROOT, "pages"), path.dirname(file));
      const outFile = path.join(ROOT, "i18n", loc, "pages", rel, "index.json");
      if (!FORCE && existsSync(outFile) && statSync(outFile).mtimeMs > statSync(file).mtimeMs) {
        continue;
      }
      const page = JSON.parse(readFileSync(file, "utf8"));
      const set = collectPageStrings(page);
      const map = await translateAll([...set], TL[loc]);
      const translated = applyPageTranslation(page, map);
      mkdirSync(path.dirname(outFile), { recursive: true });
      writeFileSync(outFile, JSON.stringify(translated, null, 2));
      process.stderr.write(` ${rel}\n`);
    }

    // 汎用コンテンツ
    for (const name of JSON_CONTENTS) {
      const src = path.join(ROOT, name);
      if (!existsSync(src)) continue;
      const outFile = path.join(ROOT, "i18n", loc, name);
      if (!FORCE && existsSync(outFile) && statSync(outFile).mtimeMs > statSync(src).mtimeMs) {
        continue;
      }
      const obj = JSON.parse(readFileSync(src, "utf8"));
      const set = collectJsonStrings(obj);
      const map = await translateAll([...set], TL[loc]);
      writeFileSync(outFile, JSON.stringify(applyJsonTranslation(obj, map), null, 2));
      console.log(`${name} done`);
    }
  }
  console.log("\ndone");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
