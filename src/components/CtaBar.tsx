import { getSite } from "@/lib/content";

/** 画面右サイド(PC)と下部(SP)の固定CTA — 本家の side01-04 画像ボタン */
export function CtaBar() {
  const site = getSite();
  const tel = `tel:${site.tel.replaceAll("-", "")}`;

  return (
    <div id="aside-cta">
      <div className="pagetop">
        <a href="#top" aria-label="一番上に戻る">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/norris/pagetop.png"
            alt="一番上に戻る"
            className="pc-only"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/norris/sp_pagetop.png"
            alt="一番上に戻る"
            className="sp-only"
          />
        </a>
      </div>

      {/* PC: 右サイド縦積み */}
      <div className="bnr-right">
        <a href={tel} className="pc-only">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/norris/side01.png"
            alt={`お電話でのお問い合わせ ${site.tel}`}
          />
        </a>
        {site.reserveUrl && (
          <a
            href={site.reserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pc-only"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/side02.png" alt="WEB予約" />
          </a>
        )}
        {site.instagramUrl && (
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pc-only"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/side03.png" alt="Instagram" />
          </a>
        )}
        {site.lineUrl && (
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pc-only"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/side04.png" alt="LINE" />
          </a>
        )}
      </div>

      {/* SP: 下部バー */}
      <div className="bnr-bottom">
        <a href={tel} className="sp-side">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/norris/sp_side01.png"
            alt={`お電話でのお問い合わせ ${site.tel}`}
          />
        </a>
        {site.reserveUrl && (
          <a
            href={site.reserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sp-side"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/sp_side02.png" alt="WEB予約" />
          </a>
        )}
        {site.instagramUrl && (
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sp-side"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/sp_side03.png" alt="Instagram" />
          </a>
        )}
        {site.lineUrl && (
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sp-side"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/sp_side04.png" alt="LINE" />
          </a>
        )}
      </div>
    </div>
  );
}
