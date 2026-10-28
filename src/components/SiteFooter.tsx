import Link from "next/link";
import { getNavigation, getPosts, getSite } from "@/lib/content";
import { InstagramIcon, LineIcon, MapPinIcon, PhoneIcon } from "./icons";

export async function SiteFooter() {
  const site = getSite();
  const nav = getNavigation();
  const columns = (await getPosts("column")).slice(0, 3);

  return (
    <footer className="border-t border-accent/60 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold">{site.name}</p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-primary-dark">
            {site.nameEn}
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              〒{site.postalCode}
              <br />
              {site.address}
              {site.addressNote && (
                <>
                  <br />
                  <span className="text-xs text-text/70">{site.addressNote}</span>
                </>
              )}
            </span>
          </p>
          <a
            href={`tel:${site.tel.replaceAll("-", "")}`}
            className="mt-3 flex items-center gap-2 text-lg font-bold text-primary-dark"
          >
            <PhoneIcon />
            {site.tel}
          </a>
          <div className="mt-3 flex gap-3">
            {site.instagramUrl && (
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-accent p-2 text-primary-dark"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {site.lineUrl && (
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LINE"
                className="rounded-full border border-accent p-2 text-primary-dark"
              >
                <LineIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="フッターナビゲーション">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary-dark">
            SITE MAP
          </p>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {nav
              .filter((i) => i.href)
              .map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-primary-dark">
                    {i.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link href="/news/" className="hover:text-primary-dark">
                お知らせ一覧
              </Link>
            </li>
            <li>
              <Link href="/privacy/" className="hover:text-primary-dark">
                プライバシーポリシー
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-primary-dark">
            COLUMN
          </p>
          <ul className="space-y-2 text-sm">
            {columns.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/column/${c.slug}/`}
                  className="hover:text-primary-dark"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
          {site.contactUrl && (
            <a
              href={site.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full border border-primary px-5 py-2 text-sm text-primary-dark"
            >
              お問い合わせフォーム
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-accent/40 py-4 text-center text-xs text-text/60">
        © {site.name}
      </div>
    </footer>
  );
}
