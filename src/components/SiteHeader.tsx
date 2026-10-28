import Link from "next/link";
import { asset } from "@/lib/asset";
import { getNavigation, getSite } from "@/lib/content";
import {
  CHROME,
  LOCALES,
  localizePath,
  localePrefix,
  navLabel,
  type Locale,
} from "@/lib/i18n";
import { MobileMenu } from "./MobileMenu";

type Props = {
  /** 下層ページでは h1 にページタイトルが入る。トップはキャッチコピー */
  title?: string;
  locale?: Locale;
  /** 言語切替用の現在パス(ロケールプレフィックスなし、"/botox/" 等) */
  currentPath?: string;
};

function localHref(href: string, locale: Locale): string {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return localePrefix(locale) + href;
  }
  return href;
}

export function SiteHeader({ title, locale = "ja", currentPath = "/" }: Props) {
  const site = getSite(locale);
  const items = getNavigation(locale);
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);

  return (
    <header id="header">
      <div className="inner ">
        <nav className="langswitch" aria-label="Language">
          {LOCALES.map((l, i) => (
            <span key={l}>
              {i > 0 && " | "}
              <Link
                href={localizePath(currentPath, l)}
                aria-current={l === locale ? "true" : undefined}
                className={l === locale ? "current" : undefined}
              >
                {CHROME[l].langName}
              </Link>
            </span>
          ))}
        </nav>
        <div className="headerinner">
          <div className="textwidget">
            <h1 className="header_title">
              {title ?? site.tagline}
              <Link href={prefix || "/"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset("/images/norris/logo.png")} alt={site.name} />
              </Link>
            </h1>
            <ul className="sp" id="sp_nav">
              <li>
                <Link href={prefix || "/"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("/images/norris/sp_nav01.png")}
                    alt={chrome.spNav.home}
                  />
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/clinic/`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("/images/norris/sp_nav02.png")}
                    alt={chrome.spNav.clinic}
                  />
                </Link>
              </li>
              <li>
                <a href={`tel:${site.tel.replaceAll("-", "")}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("/images/norris/sp_nav03.png")}
                    alt={chrome.spNav.tel}
                  />
                </a>
              </li>
              <li>
                <Link href={`${prefix}/access/`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("/images/norris/sp_nav04.png")}
                    alt={chrome.spNav.access}
                  />
                </Link>
              </li>
              <MobileMenu locale={locale} />
            </ul>
            <div id="nav">
              <div className="inner">
                <div className="menu-header-nav-container">
                  <ul className="menu" id="menu-header-nav">
                    {items.map((item, i) => {
                      const hasChildren = item.children.length > 0;
                      const isWide = item.children.some(
                        (c) => c.children.length > 0,
                      );
                      const label = navLabel(item.label, locale);
                      return (
                        <li
                          key={item.label}
                          className={`nav0${i + 1} menu-item${hasChildren ? " has_children" : ""}${isWide ? " wide" : ""}`}
                        >
                          <Link href={item.href ? localHref(item.href, locale) : "#"}>
                            <span className="wrap">
                              {label}
                              {item.en && (
                                <span className="nav_span">{item.en}</span>
                              )}
                            </span>
                          </Link>

                          {isWide && (
                            <div className="submenu-wrap submenu-sp">
                              <div className="submenu-inner">
                                {item.children.map((group) => (
                                  <ul key={group.label} className="sub-menu">
                                    <li className="menutitle">
                                      <a className="off">
                                        {navLabel(group.label, locale)}
                                      </a>
                                    </li>
                                    {group.children.map((sub) => (
                                      <li key={sub.href + sub.label}>
                                        <Link href={localHref(sub.href, locale)}>
                                          {navLabel(sub.label, locale)}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ))}
                              </div>
                            </div>
                          )}

                          {!isWide && hasChildren && (
                            <ul className="sub-menu submenu-sp">
                              {item.children.map((sub) => (
                                <li key={sub.href + sub.label}>
                                  <Link href={localHref(sub.href, locale)}>
                                    {navLabel(sub.label, locale)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
