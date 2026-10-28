import Link from "next/link";
import { getMenuItems, getNavigation, getSite } from "@/lib/content";
import type { NavItem } from "@/lib/schemas";
import { ChevronDownIcon, PhoneIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";

const kindLabels: Record<string, string> = {
  treatment: "診療メニュー",
  concern: "症状・お悩みから探す",
  device: "機器から探す",
  mens: "メンズ",
};

/** navigation.json の dynamicMenu フラグを menu/*.json から生成した子メニューに展開する */
function expandDynamic(items: NavItem[]): NavItem[] {
  const menu = getMenuItems();
  const groups = (["treatment", "concern", "device", "mens"] as const)
    .map((kind) => ({
      label: kindLabels[kind],
      en: "",
      href: kind === "treatment" ? "/menu/" : "",
      dynamicMenu: false,
      children: menu
        .filter((m) => m.kind === kind)
        .map((m) => ({
          label: m.name,
          en: "",
          href: `/menu/${m.slug}/`,
          dynamicMenu: false,
          children: [],
        })),
    }))
    .filter((g) => g.children.length > 0);

  return items.map((item) =>
    item.dynamicMenu ? { ...item, children: groups } : item,
  );
}

export function SiteHeader() {
  const site = getSite();
  const items = expandDynamic(getNavigation());
  const telHref = `tel:${site.tel.replaceAll("-", "")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-accent/60 bg-background/95 backdrop-blur">
      {/* 上段: ロゴ + 電話/予約 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="leading-tight">
          <span className="block font-serif text-lg font-semibold tracking-wide md:text-xl">
            {site.name}
          </span>
          <span className="block text-[10px] tracking-[0.2em] text-primary-dark">
            {site.nameEn}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={telHref}
            className="hidden items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary-dark md:flex"
          >
            <PhoneIcon />
            {site.tel}
          </a>
          {site.reserveUrl && (
            <a
              href={site.reserveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-primary px-5 py-2 text-sm font-bold text-white md:block"
            >
              WEB予約
            </a>
          )}
          <MobileMenu items={items} tel={site.tel} reserveUrl={site.reserveUrl} />
        </div>
      </div>

      {/* 下段: PCナビ(ドロップダウン) */}
      <nav className="hidden border-t border-accent/40 md:block">
        <ul className="mx-auto flex max-w-6xl justify-center">
          {items.map((item) => (
            <li key={item.label} className="group relative">
              <Link
                href={item.href || "#"}
                className="flex items-center gap-1 px-5 py-3 text-sm font-medium transition-colors hover:text-primary-dark"
              >
                <span>{item.label}</span>
                {item.en && (
                  <span className="text-[9px] tracking-widest text-primary-dark/70">
                    {item.en}
                  </span>
                )}
                {item.children.length > 0 && <ChevronDownIcon />}
              </Link>
              {item.children.length > 0 && (
                <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-0 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-b border border-accent/60 bg-white py-2">
                    {item.children.map((child, i) => (
                      <div key={`${child.label}-${i}`}>
                        {child.href ? (
                          <Link
                            href={child.href}
                            className="block px-4 py-2 text-sm hover:bg-accent/30"
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <p className="px-4 pb-1 pt-3 text-[11px] font-bold tracking-wider text-primary-dark">
                            {child.label}
                          </p>
                        )}
                        {child.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-6 py-1.5 text-[13px] text-text/80 hover:bg-accent/30 hover:text-text"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
