import type { MetadataRoute } from "next";
import { getMenuItems, getPosts, getSite } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = site.url.replace(/\/$/, "");

  const staticPages = [
    "",
    "/clinic/",
    "/doctor/",
    "/menu/",
    "/fee/",
    "/access/",
    "/news/",
    "/column/",
    "/privacy/",
    "/site-map/",
  ].map((p) => ({ url: `${base}${p}` }));

  const menuPages = getMenuItems().map((m) => ({
    url: `${base}/menu/${m.slug}/`,
  }));
  const newsPages = getPosts("news").map((p) => ({
    url: `${base}/news/${p.slug}/`,
    lastModified: p.date,
  }));
  const columnPages = getPosts("column").map((p) => ({
    url: `${base}/column/${p.slug}/`,
    lastModified: p.date,
  }));

  return [...staticPages, ...menuPages, ...newsPages, ...columnPages];
}
