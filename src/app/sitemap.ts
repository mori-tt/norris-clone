import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";
import { listScrapedPaths } from "@/lib/pages";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/$/, "");
  const langs = (p: string) => ({
    ja: `${base}${p}`,
    en: `${base}/en${p}`,
    "zh-CN": `${base}/zh${p}`,
  });

  return [
    { url: `${base}/`, alternates: { languages: langs("/") } },
    ...listScrapedPaths().map((p) => ({
      url: `${base}${p}`,
      alternates: { languages: langs(p) },
    })),
  ];
}
