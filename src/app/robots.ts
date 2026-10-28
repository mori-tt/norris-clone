import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const site = getSite();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
