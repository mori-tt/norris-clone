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

export const getSite = (): Site => readJson(siteSchema, "site.json");

export const getNavigation = (): NavItem[] =>
  readJson(navigationSchema, "navigation.json").items;

export const getHome = (): Home => readJson(homeSchema, "home.json");

export const getClinic = (): Clinic => readJson(clinicSchema, "clinic.json");

export const getDoctor = (): Doctor => readJson(doctorSchema, "doctor.json");

export const getSchedule = (): Schedule =>
  readJson(scheduleSchema, "schedule.json");

export const getAccess = (): Access => readJson(accessSchema, "access.json");

export const getFee = (): Fee => readJson(feeSchema, "fee.json");

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

/**
 * ローカル(content/news|column)に外部CMS(microCMS/Newt)の記事をマージ。
 * 同slugは外部CMSが優先。環境変数未設定ならローカルのみ。
 */
export const getPosts = async (
  collection: PostCollection,
): Promise<Post[]> => {
  const merged = new Map<string, Post>();
  for (const p of getLocalPosts(collection)) merged.set(p.slug, p);
  for (const p of await fetchExternalPosts(collection)) merged.set(p.slug, p);
  return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date));
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
