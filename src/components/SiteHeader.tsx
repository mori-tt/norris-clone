import Link from "next/link";
import { getNavigation, getSite } from "@/lib/content";
import { MobileMenu } from "./MobileMenu";

type Props = {
  /** 下層ページでは h1 にページタイトルが入る。トップはキャッチコピー */
  title?: string;
};

export function SiteHeader({ title }: Props) {
  const site = getSite();
  const items = getNavigation();

  return (
    <header id="header">
      <div className="inner ">
        <div className="headerinner">
          <div className="textwidget">
            <h1 className="header_title">
              {title ?? site.tagline}
              <Link href="/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/norris/logo.png" alt={site.name} />
              </Link>
            </h1>
            <ul className="sp" id="sp_nav">
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
              <MobileMenu items={items} />
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
                      return (
                        <li
                          key={item.label}
                          className={`nav0${i + 1} menu-item${hasChildren ? " has_children" : ""}${isWide ? " wide" : ""}`}
                        >
                          <Link href={item.href || "#"}>
                            <span className="wrap">
                              {item.label}
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
                                      <a className="off">{group.label}</a>
                                    </li>
                                    {group.children.map((sub) => (
                                      <li key={sub.href + sub.label}>
                                        <Link href={sub.href}>
                                          {sub.label}
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
                                  <Link href={sub.href}>{sub.label}</Link>
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
