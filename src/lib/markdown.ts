import matter from "gray-matter";
import { marked } from "marked";
import type { Block } from "./schemas";

marked.use({ gfm: true, breaks: true });

export type MdFile = {
  /** 拡張子なしのファイル名(frontmatter に slug が無い場合のフォールバック) */
  fileSlug: string;
  /** frontmatter の中身(未検証) */
  data: Record<string, unknown>;
  /** frontmatter 後の本文 */
  body: string;
};

export function parseMarkdown(raw: string, fileSlug: string): MdFile {
  const { data, content } = matter(raw);
  return { fileSlug, data: data as Record<string, unknown>, body: content };
}

/** markdown 本文を html ブロックに変換 */
export function markdownToBlocks(md: string): Block[] {
  const html = marked.parse(md, { async: false });
  return html.trim() ? [{ type: "html", html }] : [];
}
