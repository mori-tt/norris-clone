import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { getSite } from "@/lib/content";
import { ImageRetry } from "@/components/ImageRetry";
import "@/app/globals.css";
import "@/app/norris.css";

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

/** 各ロケール用ルートレイアウトが共有する<html>/<body>シェル */
export function RootShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const t = getSite().theme;
  return (
    <html
      lang={lang}
      className={`${notoSans.variable} ${shipporiMincho.variable} antialiased`}
    >
      <body
        id="pagetop"
        className="font-sans text-text"
        style={{ background: "var(--background)" }}
      >
        {/* site.json の theme を CSS 変数として注入(サイト複製時に色を変えられる) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--primary:${t.primary};--primary-dark:${t.primaryDark};--accent:${t.accent};--background:${t.background};--text:${t.text}}`,
          }}
        />
        {children}
        <ImageRetry />
      </body>
    </html>
  );
}
