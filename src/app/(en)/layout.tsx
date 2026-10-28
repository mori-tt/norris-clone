import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

const site = getSite("en");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell lang="en">{children}</RootShell>;
}
