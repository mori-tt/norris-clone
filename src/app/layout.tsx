import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { getSite } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBar } from "@/components/CtaBar";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-shippori-mincho",
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const t = site.theme;
  return (
    <html
      lang="ja"
      className={`${notoSans.variable} ${shipporiMincho.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background font-sans text-text">
        {/* site.json の theme を CSS 変数として注入(サイト複製時に色を変えられる) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--primary:${t.primary};--primary-dark:${t.primaryDark};--accent:${t.accent};--background:${t.background};--text:${t.text}}`,
          }}
        />
        <SiteHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <SiteFooter />
        <CtaBar />
      </body>
    </html>
  );
}
