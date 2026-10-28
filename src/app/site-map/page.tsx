import type { Metadata } from "next";
import Link from "next/link";
import {
  getMenuByKind,
  getPosts,
} from "@/lib/content";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "サイトマップ" };

export default function SiteMapPage() {
  const treatments = getMenuByKind("treatment");
  const concerns = getMenuByKind("concern");
  const devices = getMenuByKind("device");
  const news = getPosts("news");
  const columns = getPosts("column");

  const sections: { title: string; links: { href: string; label: string }[] }[] =
    [
      {
        title: "ページ",
        links: [
          { href: "/", label: "HOME" },
          { href: "/clinic/", label: "クリニック紹介" },
          { href: "/doctor/", label: "院長紹介" },
          { href: "/fee/", label: "料金一覧" },
          { href: "/access/", label: "診療時間・アクセス" },
          { href: "/news/", label: "お知らせ" },
          { href: "/column/", label: "メディカルコラム" },
          { href: "/privacy/", label: "プライバシーポリシー" },
        ],
      },
      {
        title: "診療メニュー",
        links: treatments.map((m) => ({
          href: `/menu/${m.slug}/`,
          label: m.name,
        })),
      },
      {
        title: "症状・お悩み",
        links: concerns.map((m) => ({
          href: `/menu/${m.slug}/`,
          label: m.name,
        })),
      },
      {
        title: "機器",
        links: devices.map((m) => ({
          href: `/menu/${m.slug}/`,
          label: m.name,
        })),
      },
      {
        title: "お知らせ",
        links: news.map((p) => ({
          href: `/news/${p.slug}/`,
          label: p.title,
        })),
      },
      {
        title: "メディカルコラム",
        links: columns.map((p) => ({
          href: `/column/${p.slug}/`,
          label: p.title,
        })),
      },
    ];

  return (
    <>
      <PageHero ja="サイトマップ" en="SITEMAP" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="border-l-4 border-primary pl-3 font-serif text-lg font-semibold">
                {s.title}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-text/80 hover:text-primary-dark"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
