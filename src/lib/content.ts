import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { fetchExternalPosts } from "./external-cms";
import { markdownToBlocks, parseMarkdown } from "./markdown";
import {
  accessSchema,
  clinicSchema,
  doctorSchema,
  feeSchema,
  homeSchema,
  menuItemSchema,
  navigationSchema,
  postSchema,
  scheduleSchema,
  siteSchema,
  type Access,
  type Clinic,
  type Doctor,
  type Fee,
  type Home,
  type MenuItem,
  type NavItem,
  type Post,
  type Schedule,
  type Site,
} from "./schemas";

/**
 * コンテンツの読み込み元。
 * デフォルトはリポジトリ内の ./content。
 * CONTENT_DIR を指定すると別ディレクトリ(=別クリニック)のコンテンツでビルドできる。
 *   CONTENT_DIR=../sites/clinic-b npm run build
 */
export const contentDir = path.resolve(process.env.CONTENT_DIR ?? "content");

function readJson<S extends z.ZodType>(
  schema: S,
  ...segments: string[]
): z.infer<S> {
  const file = path.join(contentDir, ...segments);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new Error(`コンテンツが読み込めません: ${file}`);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `コンテンツの形式が正しくありません: ${file}\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

function readDirJson<S extends z.ZodType>(
  schema: S,
  ...segments: string[]
): z.infer<S>[] {
  const dir = path.join(contentDir, ...segments);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson(schema, ...segments, f));
}

/** frontmatter の date を "YYYY-MM-DD" に正規化(YAMLはDateオブジェクトになる) */
function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? "").slice(0, 10);
}

function readDirMd(...segments: string[]): { fileSlug: string; data: Record<string, unknown>; body: string }[] {
  const dir = path.join(contentDir, ...segments);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) =>
      parseMarkdown(
        readFileSync(path.join(dir, f), "utf8"),
        f.replace(/\.md$/, ""),
      ),
    );
}

/**
 * content/i18n/<locale>/<name>.json が存在すればそれを使い、
 * 無ければ日本語ファイルにフォールバックする。
 */
function readJsonLocale<S extends z.ZodType>(
  schema: S,
  locale: string,
  name: string,
): z.infer<S> {
  if (locale !== "ja") {
    const i18nFile = path.join(contentDir, "i18n", locale, name);
    if (existsSync(i18nFile)) return readJson(schema, "i18n", locale, name);
  }
  return readJson(schema, name);
}

export const getSite = (locale = "ja"): Site =>
  readJsonLocale(siteSchema, locale, "site.json");

export const getNavigation = (locale = "ja"): NavItem[] =>
  readJsonLocale(navigationSchema, locale, "navigation.json").items;

export const getHome = (locale = "ja"): Home =>
  readJsonLocale(homeSchema, locale, "home.json");

export const getClinic = (locale = "ja"): Clinic =>
  readJsonLocale(clinicSchema, locale, "clinic.json");

export const getDoctor = (locale = "ja"): Doctor =>
  readJsonLocale(doctorSchema, locale, "doctor.json");

export const getSchedule = (locale = "ja"): Schedule =>
  readJsonLocale(scheduleSchema, locale, "schedule.json");

export const getAccess = (locale = "ja"): Access =>
  readJsonLocale(accessSchema, locale, "access.json");

export const getFee = (locale = "ja"): Fee =>
  readJsonLocale(feeSchema, locale, "fee.json");

/** menu/*.json と menu/*.md(frontmatter)の両対応 */
export const getMenuItems = (): MenuItem[] => {
  const fromJson = readDirJson(menuItemSchema, "menu");
  const fromMd = readDirMd("menu").map((f) => {
    const parsed = menuItemSchema
      .omit({ slug: true, body: true })
      .extend({ slug: z.string().optional() })
      .safeParse({ ...f.data, slug: f.data.slug ?? f.fileSlug });
    if (!parsed.success) {
      throw new Error(
        `コンテンツの形式が正しくありません: ${path.join(contentDir, "menu", f.fileSlug)}.md\n${parsed.error.message}`,
      );
    }
    const { ...rest } = parsed.data;
    return menuItemSchema.parse({ ...rest, body: markdownToBlocks(f.body) });
  });
  return [...fromJson, ...fromMd].sort((a, b) => a.order - b.order);
};

export const getMenuItem = (slug: string): MenuItem | undefined =>
  getMenuItems().find((m) => m.slug === slug);

export const getMenuByKind = (kind: MenuItem["kind"]): MenuItem[] =>
  getMenuItems().filter((m) => m.kind === kind);

export type PostCollection = "news" | "column";

function getLocalPosts(collection: PostCollection): Post[] {
  const fromJson = readDirJson(postSchema, collection);
  const fromMd = readDirMd(collection).map((f) => {
    const parsed = postSchema.safeParse({
      ...f.data,
      slug: f.data.slug ?? f.fileSlug,
      date: normalizeDate(f.data.date),
      body: markdownToBlocks(f.body),
    });
    if (!parsed.success) {
      throw new Error(
        `コンテンツの形式が正しくありません: ${path.join(contentDir, collection, f.fileSlug)}.md\n${parsed.error.message}`,
      );
    }
    return parsed.data;
  });
  return [...fromJson, ...fromMd].sort((a, b) => b.date.localeCompare(a.date));
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#039": "'",
};
const decodeEntities = (s: string): string =>
  s.replace(/&(#\d+|#x[0-9a-fA-F]+|\w+);/g, (m, e) =>
    e[0] === "#"
      ? String.fromCodePoint(parseInt(e.slice(1), e[1] === "x" ? 16 : 10))
      : (ENTITIES[e] ?? m),
  );

/**
 * content/i18n/<locale>/pages/<collection>/<slug>/index.json から
 * 翻訳済みタイトル(<h3>)と日付(.dateBlock)を取り出す。
 * 翻訳ページが無い記事は日本語のまま返す。
 */
function getLocalizedPostOverrides(
  collection: PostCollection,
  locale: string,
): Map<string, { title?: string; date?: string }> {
  const dir = path.join(contentDir, "i18n", locale, "pages", collection);
  const map = new Map<string, { title?: string; date?: string }>();
  if (!existsSync(dir)) return map;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const file = path.join(dir, ent.name, "index.json");
    if (!existsSync(file)) continue;
    try {
      const { html } = JSON.parse(readFileSync(file, "utf8")) as {
        html?: string;
      };
      if (!html) continue;
      const h3 = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1];
      const date = html.match(/dateBlock[^>]*>([^<]+)/)?.[1];
      map.set(ent.name, {
        title: h3
          ? decodeEntities(
              h3
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim(),
            )
          : undefined,
        date: date?.trim().replaceAll(".", "-"),
      });
    } catch {
      // 壊れた翻訳JSONはスキップ(日本語にフォールバック)
    }
  }
  return map;
}

/**
 * ローカル(content/news|column)に外部CMS(microCMS/Newt)の記事をマージ。
 * 同slugは外部CMSが優先。環境変数未設定ならローカルのみ。
 * locale を渡すと i18n 翻訳ページのタイトル/日付で上書きする(並び順は日本語基準)。
 */
export const getPosts = async (
  collection: PostCollection,
  locale = "ja",
): Promise<Post[]> => {
  const merged = new Map<string, Post>();
  for (const p of getLocalPosts(collection)) merged.set(p.slug, p);
  for (const p of await fetchExternalPosts(collection)) merged.set(p.slug, p);
  const posts = [...merged.values()].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  if (locale === "ja") return posts;
  const overrides = getLocalizedPostOverrides(collection, locale);
  return posts.map((p) => {
    const o = overrides.get(p.slug);
    if (!o) return p;
    return { ...p, title: o.title ?? p.title, date: o.date ?? p.date };
  });
};

export const getPost = async (
  collection: PostCollection,
  slug: string,
): Promise<Post | undefined> =>
  (await getPosts(collection)).find((p) => p.slug === slug);

export const getRelatedMenuItems = (item: MenuItem): MenuItem[] =>
  item.related
    .map((slug) => getMenuItem(slug))
    .filter((m): m is MenuItem => Boolean(m));

export const formatDate = (iso: string): string => iso.replaceAll("-", ".");
