// 本家サイトから各ページの <meta name="description"> を取得し、
// content/descriptions.json (URLパス → description) に保存する。
// 使い方: node scripts/fetch-descriptions.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = path.join(root, "content", "pages");
const ORIGIN = "https://www.norris-beauty-clinic.com";

function* walk(dir, segs = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) yield* walk(path.join(dir, e.name), [...segs, e.name]);
    else if (e.name === "index.json" && segs.length > 0)
      yield "/" + segs.join("/") + "/";
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {};
const paths = [...walk(pagesDir)];
for (const p of paths) {
  try {
    const res = await fetch(ORIGIN + encodeURI(decodeURI(p)));
    const html = await res.text();
    const m = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
    );
    if (m?.[1]) out[p] = m[1].trim();
    console.log(`${res.status} ${p} ${m?.[1] ? "desc" : "no-desc"}`);
  } catch (e) {
    console.log(`ERR ${p} ${e.message}`);
  }
  await sleep(150);
}
writeFileSync(
  path.join(root, "content", "descriptions.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(`wrote ${Object.keys(out).length} descriptions`);
