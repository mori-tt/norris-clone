import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

const site = getSite("zh");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function ZhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell lang="zh-CN">{children}</RootShell>;
}
