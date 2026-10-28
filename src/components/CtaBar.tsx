import Link from "next/link";
import { asset } from "@/lib/asset";
import { getSite } from "@/lib/content";
import { CHROME, localePrefix, type Locale } from "@/lib/i18n";

/** 本家 #aside > .inq と同じマークアップ(固定CTA: 下部バー + TOPへ戻る) */
export function CtaBar({ locale = "ja" }: { locale?: Locale }) {
  const site = getSite(locale);
  const chrome = CHROME[locale];
  const tel = `tel:${site.tel.replaceAll("-", "")}`;
  const prefix = localePrefix(locale);

  return (
    <div id="aside">
      <div className="inq">
        <div className="inq01">
          <a href="#pagetop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/images/norris/pagetop.png")} alt={chrome.backToTop} className="pc" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/images/norris/sp_pagetop.png")} alt={chrome.backToTop} className="sp" />
          </a>
        </div>
        <div className="bnr bottom">
          <a href={tel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src={asset("/images/norris/side01.png")} alt={`${chrome.ctaTel} ${site.tel}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sp" src={asset("/images/norris/sp_side01.png")} alt={`${chrome.ctaTel} ${site.tel}`} />
          </a>
          <Link href={`${prefix}/reserve/`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src={asset("/images/norris/side02.png")} alt={chrome.ctaReserve} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sp" src={asset("/images/norris/sp_side02.png")} alt={chrome.ctaReserve} />
          </Link>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="pc">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src={asset("/images/norris/side03.png")} alt="Instagram" />
          </a>
          <a href={site.lineUrl} target="_blank" rel="noopener noreferrer" className="pc">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src={asset("/images/norris/side04.png")} alt="LINE" />
          </a>
          <ul className="sp">
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src={asset("/images/norris/sp_side03.png")} alt="Instagram" />
              </a>
            </li>
            <li>
              <a href={site.lineUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src={asset("/images/norris/sp_side04.png")} alt="LINE" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
