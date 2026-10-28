import Link from "next/link";
import { getSite } from "@/lib/content";
import { CHROME, localePrefix, type Locale } from "@/lib/i18n";
import { ArrowRightIcon, PhoneIcon } from "./icons";

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
            <img src="/images/norris/pagetop.png" alt={chrome.backToTop} className="pc" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/sp_pagetop.png" alt={chrome.backToTop} className="sp" />
          </a>
        </div>
        <div className="bnr bottom">
          <a href={tel} aria-label={`${chrome.ctaTel} ${site.tel}`}>
            {locale === "ja" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pc" src="/images/norris/side01.png" alt={`${chrome.ctaTel} ${site.tel}`} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src="/images/norris/sp_side01.png" alt={`${chrome.ctaTel} ${site.tel}`} />
              </>
            ) : (
              <span className="cta-figure cta-tel">
                <PhoneIcon className="cta-ic" />
                <span className="cta-txt">
                  <small>{chrome.ctaTel}</small>
                  <strong>{site.tel}</strong>
                </span>
              </span>
            )}
          </a>
          <Link href={`${prefix}/reserve/`} aria-label={chrome.ctaReserve}>
            {locale === "ja" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pc" src="/images/norris/side02.png" alt={chrome.ctaReserve} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src="/images/norris/sp_side02.png" alt={chrome.ctaReserve} />
              </>
            ) : (
              <span className="cta-figure cta-reserve">
                <span className="cta-reserve-label">{chrome.ctaReserve}</span>
                <ArrowRightIcon className="cta-ic" />
              </span>
            )}
          </Link>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="pc">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src="/images/norris/side03.png" alt="Instagram" />
          </a>
          <a href={site.lineUrl} target="_blank" rel="noopener noreferrer" className="pc">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src="/images/norris/side04.png" alt="LINE" />
          </a>
          <ul className="sp">
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src="/images/norris/sp_side03.png" alt="Instagram" />
              </a>
            </li>
            <li>
              <a href={site.lineUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp" src="/images/norris/sp_side04.png" alt="LINE" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
