import { z } from "zod";

/** 記事・ページ本文で使うコンテンツブロック */
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
    alt: z.string().default(""),
  }),
  z.object({
    type: z.literal("link"),
    href: z.string(),
    text: z.string(),
    external: z.boolean().default(false),
  }),
]);
export type Block = z.infer<typeof blockSchema>;

/** content/site.json — サイト全体の設定。別クリニック化する時は主にここを書き換える */
export const siteSchema = z.object({
  name: z.string(),
  nameEn: z.string().default(""),
  tagline: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default("https://example.com"),
  tel: z.string(),
  postalCode: z.string().default(""),
  address: z.string().default(""),
  addressNote: z.string().default(""),
  director: z.string().default(""),
  reserveUrl: z.string().default(""),
  contactUrl: z.string().default(""),
  lineUrl: z.string().default(""),
  instagramUrl: z.string().default(""),
  instagramUser: z.string().default(""),
  theme: z
    .object({
      primary: z.string().default("#b8896f"),
      primaryDark: z.string().default("#96684f"),
      accent: z.string().default("#d9b8a3"),
      background: z.string().default("#faf7f4"),
      text: z.string().default("#3f3a36"),
    })
    .default({
      primary: "#b8896f",
      primaryDark: "#96684f",
      accent: "#d9b8a3",
      background: "#faf7f4",
      text: "#3f3a36",
    }),
});
export type Site = z.infer<typeof siteSchema>;

/** content/navigation.json — ヘッダーナビ。dynamicMenu: true で menu/*.json から子メニュー自動生成 */
export const navItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    en: z.string().default(""),
    href: z.string().default(""),
    dynamicMenu: z.boolean().default(false),
    children: z.array(navItemSchema).default([]),
  }),
);
export interface NavItem {
  label: string;
  en: string;
  href: string;
  dynamicMenu: boolean;
  children: NavItem[];
}
export const navigationSchema = z.object({ items: z.array(navItemSchema) });

/** content/menu/*.json — 施術・お悩み・機器ページ */
export const menuItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  nameEn: z.string().default(""),
  // treatment=診療メニュー / concern=お悩みから探す / device=機器から探す / mens=メンズ
  kind: z.enum(["treatment", "concern", "device", "mens"]).default("treatment"),
  catchcopy: z.string().default(""),
  lead: z.string().default(""),
  image: z.string().default(""),
  body: z.array(blockSchema).default([]),
  features: z.array(z.string()).default([]),
  priceNote: z.string().default(""),
  related: z.array(z.string()).default([]),
  order: z.number().default(0),
});
export type MenuItem = z.infer<typeof menuItemSchema>;

/** content/news/*.json, content/column/*.json — 記事 */
export const postSchema = z.object({
  slug: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  category: z.string().default("お知らせ"),
  image: z.string().default(""),
  excerpt: z.string().default(""),
  body: z.array(blockSchema).default([]),
});
export type Post = z.infer<typeof postSchema>;

/** content/fee.json — 料金一覧 */
export const feeSchema = z.object({
  note: z.string().default(""),
  categories: z.array(
    z.object({
      name: z.string(),
      note: z.string().default(""),
      items: z.array(
        z.object({
          name: z.string(),
          price: z.string(),
          note: z.string().default(""),
        }),
      ),
    }),
  ),
});
export type Fee = z.infer<typeof feeSchema>;

/** content/schedule.json — 診療時間・休診日 */
export const scheduleSchema = z.object({
  hoursTable: z.array(
    z.object({ label: z.string(), value: z.string() }),
  ),
  // 当月カレンダー(静的書き出しのためビルド時の内容が固定される)
  calendar: z.object({
    year: z.number(),
    month: z.number().min(1).max(12),
    closedDays: z.array(z.number()).default([]),
    note: z.string().default(""),
  }),
});
export type Schedule = z.infer<typeof scheduleSchema>;

/** content/access.json */
export const accessSchema = z.object({
  byTrain: z
    .array(z.object({ line: z.string(), detail: z.string() }))
    .default([]),
  byCar: z.string().default(""),
  mapEmbedUrl: z.string().default(""),
  mapNote: z.string().default(""),
});
export type Access = z.infer<typeof accessSchema>;

/** content/clinic.json — クリニック紹介・設備 */
export const clinicSchema = z.object({
  about: z.object({
    title: z.string(),
    body: z.array(blockSchema).default([]),
    image: z.string().default(""),
  }),
  facilities: z.array(
    z.object({
      name: z.string(),
      body: z.string(),
      image: z.string().default(""),
    }),
  ),
});
export type Clinic = z.infer<typeof clinicSchema>;

/** content/doctor.json — 院長紹介 */
export const doctorSchema = z.object({
  name: z.string(),
  romanName: z.string().default(""),
  title: z.string().default("院長"),
  image: z.string().default(""),
  message: z.array(blockSchema).default([]),
  career: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
});
export type Doctor = z.infer<typeof doctorSchema>;

/** content/home.json — トップページ固有セクション */
export const homeSchema = z.object({
  hero: z.object({
    slides: z.array(
      z.object({
        image: z.string(),
        title: z.string(),
        subtitle: z.string().default(""),
      }),
    ),
  }),
  features: z.object({
    title: z.string().default("当院の特徴"),
    items: z.array(
      z.object({
        title: z.string(),
        text: z.string(),
      }),
    ),
  }),
  instagramNote: z.string().default(""),
});
export type Home = z.infer<typeof homeSchema>;
