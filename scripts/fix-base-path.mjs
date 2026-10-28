// GitHub Pages のプロジェクトページ(<user>.github.io/<repo>/)用に、
// エクスポート済み out/ 内のHTML/CSSに残る素の絶対パス("/images/..."等)へ
// ベースパスを付与する。Next の basePath がカバーしない素の <img>/<a>/<link>/
// srcset/url() や scraped HTML 内の参照をまとめて書き換える。
//
//   node scripts/fix-base-path.mjs out /norris-clone
//
// 【Flightペイロードの扱い】
// 静的書き出しのHTMLには self.__next_f.push([1,"..."]) で RSC/Flight ストリームが
// 埋め込まれ、各ルートの .txt にも同じストリームが格納されている。
// ストリーム内の <id>:T<hex>, 行は「続くテキストのバイト長」を宣言している。
// このテキスト(scraped HTML/CSS)内のパスを単純置換すると実長が宣言長を超えて
// ストリームが壊れ、クライアント側で React error #412(Connection closed)になる。
// そのため T 行は「元の宣言長でテキスト境界を特定→内部だけ書き換え→
// 新しいバイト長でヘッダを再計算」する必要がある。

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
// ※ Flightペイロード内は src=\"...\" のように引用符がエスケープされている
//   ため \\\\? で任意のバックスラッシュを許容する
const attrRe = new RegExp(
  `((?:href|src|action|poster|content|data-src|data-href)\\s*=\\s*\\\\?["'])\\/${notPrefixed}`,
  "gi",
);
const srcsetRe = /(srcset\s*=\s*)(\\?)(["'])([^"']*?)\2\3/gi;
const urlRe = new RegExp(`url\\(\\s*(\\\\?['"]?)\\/${notPrefixed}`, "gi");
// Flightペイロード(JSONプロパティ)内の "src":"/..." 形式。
// href/action は <Link> がクライアント側で basePath を付与するため二重付与を避けて対象外
const jsonRe = new RegExp(
  `("(?:src|srcset|srcSet|poster|data-src|data-href|content)"\\s*:\\s*")\\/${notPrefixed}`,
  "g",
);

/** 汎用パス書き換え(長さが変わっても問題ないコンテキスト用) */
function genericFix(content) {
  return content
    .replace(attrRe, `$1${base}/`)
    .replace(srcsetRe, (m, pre, esc, q, list) =>
      `${pre}${esc}${q}${list.replace(
        new RegExp(`(^|,\\s*)\\/${notPrefixed}`, "g"),
        `$1${base}/`,
      )}${esc}${q}`,
    )
    .replace(urlRe, `url($1${base}/`)
    .replace(jsonRe, `$1${base}/`);
}

/** UTF-8 バイトオフセット表を構築(offs[i] = stream[i] のバイト位置) */
function byteOffsets(s) {
  // UTF-16コードユニットではなくコードポイント単位で数える
  // (サロゲートペア=4バイトを2文字として6バイトと誤算しないように)
  const offs = new Uint32Array(s.length + 1);
  let b = 0;
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i);
    const w = cp > 0xffff ? 2 : 1;
    offs[i] = b;
    if (w === 2) offs[i + 1] = b;
    b += cp > 0xffff ? 4 : cp > 0x7ff ? 3 : cp > 0x7f ? 2 : 1;
    i += w;
  }
  offs[s.length] = b;
  return offs;
}

function charIndexOfByte(offs, bytePos) {
  // 二分探索: offs は単調増加
  let lo = 0;
  let hi = offs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offs[mid] < bytePos) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Flight の長さ宣言テキスト行: "<id>:T<hex>," に続く raw テキスト
const tRowRe = /(?:^|\n)([0-9a-f]+):T([0-9a-f]+),/g;

/**
 * Flight ストリームを構造的に書き換える。
 * T 行は元の宣言バイト長でテキスト範囲を特定し、内部だけ genericFix して
 * 新しいバイト長に差し替える。T 行が無いストリームは genericFix のみ。
 */
function fixFlight(stream) {
  const rows = [...stream.matchAll(tRowRe)];
  if (rows.length === 0) return genericFix(stream);

  const offs = byteOffsets(stream);
  const out = [];
  let prev = 0;
  for (const m of rows) {
    const headStart = m.index + (m[0].startsWith("\n") ? 1 : 0);
    const textStart = m.index + m[0].length;
    // T 行テキスト内に偶然出現した "\nNN:Txx," 形式の文字列は誤マッチなので
    // 前の T 行テキスト範囲に含まれるマッチはスキップする
    if (textStart < prev) continue;
    const byteStart = offs[textStart];
    const byteEnd = byteStart + parseInt(m[2], 16);
    const textEnd = charIndexOfByte(offs, byteEnd);
    const fixedText = genericFix(stream.slice(textStart, textEnd));
    const newLen = Buffer.byteLength(fixedText, "utf8").toString(16);

    out.push(genericFix(stream.slice(prev, headStart)));
    out.push(`${m[1]}:T${newLen},${fixedText}`);
    prev = textEnd;
  }
  out.push(genericFix(stream.slice(prev)));
  return out.join("");
}

// HTML内の埋め込み Flight チャンク: self.__next_f.push([1,"..."])
const pushRe = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;

function decodeChunk(raw) {
  return JSON.parse(`"${raw}"`);
}

function encodeChunk(decoded) {
  // JSON文字列化 + HTML内<script>安全のため <>& と区切り文字をエスケープ
  return JSON.stringify(decoded)
    .slice(1, -1)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
}

/**
 * .html: 埋め込み push チャンクをデコード→連結してストリームを復元し、
 * fixFlight で書き換えてから 1 チャンクに再エンコードする
 * (クライアントは push を順に連結するだけなので分割境界は任意でよい)。
 * その後 HTML 全体に genericFix を適用(DOM側の素のパス)。
 */
function fixHtml(html) {
  const pushes = [...html.matchAll(pushRe)];
  let body = html;
  if (pushes.length > 0) {
    const stream = pushes.map((m) => decodeChunk(m[1])).join("");
    const fixed = encodeChunk(fixFlight(stream));
    // 最初の push を書き換え済み1チャンクに置き換え、残りを削除
    let i = 0;
    body = html.replace(pushRe, () =>
      i++ === 0 ? `self.__next_f.push([1,"${fixed}"])` : "",
    );
  }
  return genericFix(body);
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
  const after = file.endsWith(".html")
    ? fixHtml(before)
    : file.endsWith(".txt")
      ? fixFlight(before)
      : genericFix(before);
  if (after !== before) {
    await writeFile(file, after);
    changed++;
  }
}
console.log(`fix-base-path: rewrote ${changed} file(s) under ${outDir} with base ${base}`);
