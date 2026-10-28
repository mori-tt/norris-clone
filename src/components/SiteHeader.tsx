import Link from "next/link";
import { getMenuItems, getNavigation, getSite } from "@/lib/content";
import type { NavItem } from "@/lib/schemas";
import { MobileMenu } from "./MobileMenu";

const kindLabels: Record<string, string> = {
  treatment: "診療メニュー",
  concern: "症状・お悩みから探す",
  device: "機器から探す",
  mens: "メンズ",
};

/** navigation.json の dynamicMenu フラグを menu/*.md から生成した子メニューに展開する */
function expandDynamic(items: NavItem[]): NavItem[] {
  const menu = getMenuItems();
  const groups = (["treatment", "concern", "device", "mens"] as const)
    .map((kind) => ({
      label: kindLabels[kind],
      en: "",
      href: "",
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

  return (
    <header id="header">
      <div className="inner">
        <div className="headerinner">
          {/* ロゴ(キャッチコピー + ロゴ画像) */}
          <h1 className="header-title">
            {site.tagline}
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/norris/logo.png" alt={site.name} />
            </Link>
          </h1>

          {/* SPナビ(画像アイコン5個) */}
          <ul id="spnav">
            <li>
              <Link href="/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/norris/sp_nav01.png" alt="HOME" />
              </Link>
            </li>
            <li>
              <Link href="/clinic/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/norris/sp_nav02.png" alt="クリニック紹介" />
              </Link>
            </li>
            <li>
              <a href={`tel:${site.tel.replaceAll("-", "")}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/norris/sp_nav03.png" alt="電話" />
              </a>
            </li>
            <li>
              <Link href="/access/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/norris/sp_nav04.png" alt="アクセス・診療時間" />
              </Link>
            </li>
            <MobileMenu items={items} tel={site.tel} />
          </ul>

          {/* PCナビ */}
          <nav id="gnav" aria-label="グローバルナビゲーション">
            <ul>
              {items.map((item) => {
                const hasChildren = item.children.length > 0;
                const isMega =
                  item.children.some((c) => c.children.length > 0);
                return (
                  <li
                    key={item.label}
                    className={`${hasChildren ? "has-children " : ""}${
                      isMega ? "mega" : ""
                    }`}
                  >
                    {item.href ? (
                      <Link href={item.href}>
                        <span className="wrap">
                          {item.label}
                          {item.en && (
                            <span className="nav-en">{item.en}</span>
                          )}
                        </span>
                      </Link>
                    ) : (
                      <span className="navlink">
                        <span className="wrap">
                          {item.label}
                          {item.en && (
                            <span className="nav-en">{item.en}</span>
                          )}
                        </span>
                      </span>
                    )}

                    {/* ワイドメガメニュー */}
                    {isMega && (
                      <div className="megamenu">
                        <div className="submenu-inner">
                          {item.children.map((group) => (
                            <ul key={group.label} className="sub-menu">
                              <li className="menutitle">{group.label}</li>
                              {group.children.map((sub) => (
                                <li key={sub.href}>
                                  <Link href={sub.href}>{sub.label}</Link>
                                </li>
                              ))}
                            </ul>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 通常ドロップダウン */}
                    {!isMega && hasChildren && (
                      <ul className="sub-menu">
                        {item.children.map((sub) => (
                          <li key={sub.href}>
                            <Link href={sub.href}>{sub.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
