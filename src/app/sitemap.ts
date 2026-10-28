import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";
import { listScrapedPaths } from "@/lib/pages";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/$/, "");

  return [
    { url: `${base}/` },
    ...listScrapedPaths().map((p) => ({ url: `${base}${p}` })),
  ];
}
