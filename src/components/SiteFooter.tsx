import Link from "next/link";
import { asset } from "@/lib/asset";
import { getHome, getSite } from "@/lib/content";
import { CHROME, localePrefix, type Locale } from "@/lib/i18n";

/** 本家フッターと同じマークアップ(ロゴ・info・診療日画像・footer-nav・コラムリンク・クレジット) */
export function SiteFooter({ locale = "ja" }: { locale?: Locale }) {
  const site = getSite(locale);
  const home = getHome(locale);
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);

  return (
    <footer id="footer" className="footer">
      <div className="inner">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/images/norris/logo.png")} alt={site.name} />
        </div>
        <div className="columns">
          <div className="column col_2">
            <ul className="info">
              <li className="address">
                〒{site.postalCode}
                <br />
                {site.address}
              </li>
              <li className="tel">
                <a href={`tel:${site.tel.replaceAll("-", "")}`}>{site.tel}</a>
              </li>
              <li className="access">
                {site.addressNote.split(" / ").map((line, i, arr) => (
                  <span key={line}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </li>
            </ul>
            <div className="btn-style left web">
              <Link href={`${prefix}/contact/`}>
                <span className="icon">{chrome.contactForm}</span>
              </Link>
            </div>
          </div>
          <div className="column col_2">
            <h3>{home.scheduleTitle}</h3>
            {home.scheduleImage && (
              <p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(home.scheduleImage)} alt="" className="aligncenter" />
              </p>
            )}
          </div>
        </div>
        <div className="menu-footer-nav-container clearfix">
          <div id="menu-footer-nav" className="menu">
            <div className="menu-item-has-children">
              <ul className="sub-menu">
                <li>
                  <Link href={`${prefix}/sitemap/`}>{chrome.sitemap}</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="foot-credit">
          <Link href={`${prefix}/medi-column/`}>
            <span>{chrome.mediColumn}</span>
          </Link>
        </div>
        <div className="copyright">&copy;{site.name}</div>
      </div>
    </footer>
  );
}
