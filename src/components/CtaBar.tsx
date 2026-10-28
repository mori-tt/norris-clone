import Link from "next/link";
import { getSite } from "@/lib/content";

/** 本家 #aside > .inq と同じマークアップ(固定CTA: 下部バー + TOPへ戻る) */
export function CtaBar() {
  const site = getSite();
  const tel = `tel:${site.tel.replaceAll("-", "")}`;

  return (
    <div id="aside">
      <div className="inq">
        <div className="inq01">
          <a href="#pagetop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/pagetop.png" alt="一番上に戻る" className="pc" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/norris/sp_pagetop.png" alt="一番上に戻る" className="sp" />
          </a>
        </div>
        <div className="bnr bottom">
          <a href={tel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src="/images/norris/side01.png" alt={`お電話でのお問い合わせ ${site.tel}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sp" src="/images/norris/sp_side01.png" alt={`お電話でのお問い合わせ ${site.tel}`} />
          </a>
          <Link href="/reserve/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc" src="/images/norris/side02.png" alt="WEB予約" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sp" src="/images/norris/sp_side02.png" alt="WEB予約" />
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
