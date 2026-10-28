// content/{menu,news,column}/*.json を frontmatter+markdown の .md に変換する
// 使い切りの移行スクリプト: node scripts/json-to-md.mjs
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";

const dirs = ["content/menu", "content/news", "content/column"];

function blockToMd(b) {
  switch (b.type) {
    case "p":
      return b.text + "\n";
    case "h2":
      return `## ${b.text}\n`;
    case "h3":
      return `### ${b.text}\n`;
    case "ul":
      return b.items.map((i) => `- ${i}`).join("\n") + "\n";
    case "image":
      return `![${b.alt}](${b.src})\n`;
    case "link":
      return `[${b.text}](${b.href})\n`;
    case "html":
      return b.html + "\n";
    default:
      return "";
  }
}

function yamlValue(v) {
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  const s = String(v);
  if (s === "") return '""';
  if (/[:#\[\]{}&*!|>'"%@`,?]|\s$|^\s|-\s/.test(s))
    return JSON.stringify(s);
  return s;
}

for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const json = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
    const { body, slug, ...meta } = json;
    const lines = ["---"];
    lines.push(`slug: ${yamlValue(slug)}`);
    for (const [k, v] of Object.entries(meta)) {
      if (Array.isArray(v)) {
        if (v.length === 0) {
          lines.push(`${k}: []`);
        } else {
          lines.push(`${k}:`);
          for (const item of v) lines.push(`  - ${yamlValue(item)}`);
        }
      } else {
        lines.push(`${k}: ${yamlValue(v)}`);
      }
    }
    lines.push("---", "");
    const md = (body ?? []).map(blockToMd).join("\n").trim() + "\n";
    const out = path.join(dir, file.replace(/\.json$/, ".md"));
    writeFileSync(out, lines.join("\n") + "\n" + md);
    unlinkSync(path.join(dir, file));
    console.log(`converted ${file} -> ${path.basename(out)}`);
  }
}
