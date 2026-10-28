import type { Post } from "./schemas";

/**
 * 外部ヘッドレスCMSから記事を取得するアダプター。
 * 環境変数が未設定なら何もせずローカルJSON/MDだけで動く。
 * 静的書き出しのため、取得はビルド時(next build)にのみ行われる。
 *
 * microCMS:
 *   MICROCMS_SERVICE_DOMAIN=xxxx  (xxxx.microcms.io)
 *   MICROCMS_API_KEY=...
 *   MICROCMS_NEWS_ENDPOINT=news        (省略時 "news")
 *   MICROCMS_COLUMN_ENDPOINT=column    (省略時 "column")
 *
 * Newt:
 *   NEWT_SPACE_UID, NEWT_APP_UID, NEWT_TOKEN
 *   NEWT_NEWS_MODEL=news / NEWT_COLUMN_MODEL=column (省略時同名)
 *
 * 想定フィールド(両者共通):
 *   title(text), slug(text,省略時はID), date(date/datetime),
 *   category(text or select), image(image), excerpt(text), body(rich text / markdown)
 */

type CmsItem = {
  id?: string;
  _id?: string;
  slug?: string;
  title?: string;
  date?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: unknown;
  image?: { url?: string } | string;
  thumbnail?: { url?: string };
  excerpt?: string;
  body?: string;
};

function pickString(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return pickString(v[0]);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return pickString(o.name ?? o.label ?? o.value ?? "");
  }
  return "";
}

function pickImage(item: CmsItem): string {
  const img = item.image ?? item.thumbnail;
  if (typeof img === "string") return img;
  return img?.url ?? "";
}

function toPost(item: CmsItem): Post | null {
  const slug = pickString(item.slug) || item.id || item._id || "";
  const title = item.title ?? "";
  if (!slug || !title) return null;
  const dateRaw = item.date ?? item.publishedAt ?? item.updatedAt ?? "";
  return {
    slug,
    title,
    date: dateRaw.slice(0, 10) || "1970-01-01",
    category: pickString(item.category) || "お知らせ",
    image: pickImage(item),
    excerpt: item.excerpt ?? "",
    body: item.body ? [{ type: "html", html: item.body }] : [],
  };
}

async function fetchJson(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json() as Promise<{ contents?: CmsItem[]; items?: CmsItem[] }>;
}

async function fetchMicroCms(endpoint: string): Promise<Post[]> {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  const key = process.env.MICROCMS_API_KEY;
  if (!domain || !key) return [];
  const url = `https://${domain}.microcms.io/api/v1/${endpoint}?limit=100`;
  const json = await fetchJson(url, { "X-MICROCMS-API-KEY": key });
  return (json.contents ?? [])
    .map(toPost)
    .filter((p): p is Post => p !== null);
}

async function fetchNewt(model: string): Promise<Post[]> {
  const space = process.env.NEWT_SPACE_UID;
  const app = process.env.NEWT_APP_UID;
  const token = process.env.NEWT_TOKEN;
  if (!space || !app || !token) return [];
  const url = `https://${space}.cdn.newt.so/v1/${app}/${model}?limit=100`;
  const json = await fetchJson(url, { Authorization: `Bearer ${token}` });
  return (json.items ?? [])
    .map(toPost)
    .filter((p): p is Post => p !== null);
}

export async function fetchExternalPosts(
  collection: "news" | "column",
): Promise<Post[]> {
  const results: Post[] = [];
  const jobs: Promise<Post[]>[] = [];

  jobs.push(
    fetchMicroCms(
      process.env[`MICROCMS_${collection.toUpperCase()}_ENDPOINT`] ??
        collection,
    ),
  );
  jobs.push(
    fetchNewt(
      process.env[`NEWT_${collection.toUpperCase()}_MODEL`] ?? collection,
    ),
  );

  const settled = await Promise.allSettled(jobs);
  for (const s of settled) {
    if (s.status === "fulfilled") results.push(...s.value);
    else console.warn(`[external-cms] ${collection} の取得に失敗:`, s.reason);
  }
  return results;
}
