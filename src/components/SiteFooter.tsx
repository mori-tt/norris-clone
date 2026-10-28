import Link from "next/link";
import { getHome, getSite } from "@/lib/content";

/** 本家フッター:ロゴ + 住所/TEL/アクセス(アイコン付き) + 診療日画像 + サイトマップ */
export function SiteFooter() {
  const site = getSite();
  const home = getHome();

  return (
    <footer id="footer">
      <div className="inner">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/norris/logo.png" alt={site.name} />
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
                <span>
                  {site.addressNote.split(" / ").map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
            {site.contactUrl && (
              <div className="btn-style web">
                <a href={site.contactUrl} target="_blank" rel="noopener noreferrer">
                  <span className="icon">お問い合わせフォーム</span>
                </a>
              </div>
            )}
          </div>
          <div className="column col_2">
            <h3>{home.scheduleTitle}</h3>
            {home.scheduleImage && (
              <p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={home.scheduleImage} alt={home.scheduleTitle} />
              </p>
            )}
          </div>
        </div>
        <div className="footer-nav">
          <ul>
            <li>
              <Link href="/site-map/">サイトマップ</Link>
            </li>
            <li>
              <Link href="/column/">メディカルコラム</Link>
            </li>
            <li>
              <Link href="/privacy/">プライバシーポリシー</Link>
            </li>
          </ul>
        </div>
        <div className="copyright">&copy;{site.name}</div>
      </div>
    </footer>
  );
}
