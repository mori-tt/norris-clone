import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";
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
export const contentDir = path.resolve(
  process.env.CONTENT_DIR ?? "content",
);

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

function readDir<S extends z.ZodType>(
  schema: S,
  ...segments: string[]
): z.infer<S>[] {
  const dir = path.join(contentDir, ...segments);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson(schema, ...segments, f));
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

export const getMenuItems = (): MenuItem[] =>
  readDir(menuItemSchema, "menu").sort((a, b) => a.order - b.order);

export const getMenuItem = (slug: string): MenuItem | undefined =>
  getMenuItems().find((m) => m.slug === slug);

export const getMenuByKind = (kind: MenuItem["kind"]): MenuItem[] =>
  getMenuItems().filter((m) => m.kind === kind);

export type PostCollection = "news" | "column";

export const getPosts = (collection: PostCollection): Post[] =>
  readDir(postSchema, collection).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

export const getPost = (
  collection: PostCollection,
  slug: string,
): Post | undefined => getPosts(collection).find((p) => p.slug === slug);

export const getRelatedMenuItems = (item: MenuItem): MenuItem[] =>
  item.related
    .map((slug) => getMenuItem(slug))
    .filter((m): m is MenuItem => Boolean(m));

export const formatDate = (iso: string): string => iso.replaceAll("-", ".");
