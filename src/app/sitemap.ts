import type { MetadataRoute } from "next";
import { listScrapedPaths, slugUrlForm } from "@/lib/pages";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const norm = (p: string) =>
    p
      .split("/")
      .map((s) => (s === "" ? s : slugUrlForm(s)))
      .join("/");
  const langs = (p: string) => ({
    ja: `${base}${p}`,
    en: `${base}/en${p}`,
    zh: `${base}/zh${p}`,
    "x-default": `${base}${p}`,
  });

  return [
    { url: `${base}/`, alternates: { languages: langs("/") } },
    ...listScrapedPaths().map((p) => ({
      url: `${base}${norm(p)}`,
      alternates: { languages: langs(norm(p)) },
    })),
  ];
}
