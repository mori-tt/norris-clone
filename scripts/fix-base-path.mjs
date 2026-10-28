// GitHub Pages のプロジェクトページ(<user>.github.io/<repo>/)用に、
// エクスポート済み out/ 内のHTML/CSSに残る素の絶対パス("/images/..."等)へ
// ベースパスを付与する。Next の basePath がカバーしない素の <img>/<a>/<link>/
// srcset/url() や scraped HTML 内の参照をまとめて書き換える。
//
//   node scripts/fix-base-path.mjs out /norris-clone

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [outDir = "out", baseArg = ""] = process.argv.slice(2);
const base = baseArg.replace(/\/+$/, "");
if (!base.startsWith("/")) {
  console.error("usage: node scripts/fix-base-path.mjs <outDir> </basePath>");
  process.exit(1);
}

// "/" を消費した直後の位置で判定するので、除外対象は先頭 "/" なしの "norris-clone"
const name = base.replace(/^\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const notPrefixed = `(?!\\/|${name}(?=[/"'?)#\\s]|$))`;
// "//"(プロトコル相対) と "ベースパス付与済み" は除外
// ※ 大文字小文字を区別しない(React は srcSet 等のキャメルケース属性を出力する)
const attrRe = new RegExp(
  `((?:href|src|action|poster|content|data-src|data-href)\\s*=\\s*["'])\\/${notPrefixed}`,
  "gi",
);
const srcsetRe = /(srcset\s*=\s*)(["'])([^"']*)\2/gi;
const urlRe = new RegExp(`url\\(\\s*(['"]?)\\/${notPrefixed}`, "gi");

function fix(content) {
  return content
    .replace(attrRe, `$1${base}/`)
    .replace(srcsetRe, (m, pre, q, list) =>
      `${pre}${q}${list.replace(
        new RegExp(`(^|,\\s*)\\/${notPrefixed}`, "g"),
        `$1${base}/`,
      )}${q}`,
    )
    .replace(urlRe, `url($1${base}/`);
}

async function walk(dir) {
  const files = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...(await walk(p)));
    // .txt は Next の Flight ペイロード(クライアント遷移用の埋め込みHTMLを含む)
    else if (/\.(html|css|txt)$/i.test(ent.name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of await walk(outDir)) {
  const before = await readFile(file, "utf8");
  const after = fix(before);
  if (after !== before) {
    await writeFile(file, after);
    changed++;
  }
}
console.log(`fix-base-path: rewrote ${changed} file(s) under ${outDir} with base ${base}`);
