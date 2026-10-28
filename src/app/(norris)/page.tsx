import Link from "next/link";
import { Fragment } from "react";
import { getAccess, getHome, getPosts, getSite } from "@/lib/content";
import { HeroSlider } from "@/components/HeroSlider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBar } from "@/components/CtaBar";
import { HtmlLang } from "@/components/HtmlLang";
import { Blocks } from "@/components/Blocks";
import { formatDate } from "@/lib/content";
import {
  CHROME,
  HERO_COPY,
  UROLOGY_BANNER,
  localePrefix,
  type Locale,
} from "@/lib/i18n";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

const NEWS_HEADING: Record<Locale, string> = {
  ja: "お知らせ",
  en: "News",
  zh: "通知公告",
};

export default async function HomePage({
  locale = "ja",
}: {
  locale?: Locale;
}) {
  const site = getSite(locale);
  const home = getHome(locale);
  const access = getAccess(locale);
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);
  const lh = (href: string) =>
    href.startsWith("/") && !href.startsWith("//") ? prefix + href : href;
  const news = (await getPosts("news", locale)).slice(0, 3);

  return (
    <div
      className="pbody home"
      lang={locale === "zh" ? "zh-CN" : locale}
    >
      <HtmlLang locale={locale} />
      <SiteHeader locale={locale} currentPath="/" />
      <HeroSlider
        slides={home.hero.slides}
        copy={locale === "ja" ? undefined : HERO_COPY[locale]}
      />

      {/* 泌尿器科バナー */}
      {home.banner && (
        <div className="bnr_block">
          <div className="topinner">
            <p>
              <Link href={lh(home.banner.href || "#")}>
                {locale === "ja" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={home.banner.image} alt={home.banner.alt} />
                ) : (
                  <span className="hinyou-i18n">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={home.banner.image} alt={home.banner.alt} />
                    <span className="hinyou-copy" aria-hidden="true">
                      <span className="hinyou-tag">
                        UROLOGY
                        {UROLOGY_BANNER[locale].tag &&
                          ` / ${UROLOGY_BANNER[locale].tag}`}
                      </span>
                      <span className="hinyou-title">
                        {UROLOGY_BANNER[locale].title}
                      </span>
                      <span className="hinyou-sub">
                        {UROLOGY_BANNER[locale].sub}
                      </span>
                      <span className="hinyou-btn">
                        {UROLOGY_BANNER[locale].cta}
                      </span>
                    </span>
                  </span>
                )}
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* sec01: News + Schedule */}
      <section className="sec01 sec_news">
        <div className="topinner">
          <div className="columns">
            <div className="column col_2 news">
              <div className="heading">
                <h3>
                  <span className="en">News</span>
                  {NEWS_HEADING[locale]}
                </h3>
                <div className="btn-style">
                  <Link href={`${prefix}/news/`}>{chrome.newsList}</Link>
                </div>
              </div>
              <dl>
                {news.map((p) => (
                  <Fragment key={p.slug}>
                    <dt>
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                    </dt>
                    <dd>
                      <Link href={`${prefix}/news/${p.slug}/`}>{p.title}</Link>
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </div>
            <div className="column col_2">
              <h3>
                <span className="en">Schedule</span>
                {home.scheduleTitle}
              </h3>
              {locale === "ja" ? (
                home.scheduleImage && (
                  <p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={home.scheduleImage} alt={home.scheduleTitle} />
                  </p>
                )
              ) : (
                <ScheduleCalendar locale={locale} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram(本家 sec01 2個目) */}
      {home.instagram && home.instagram.images.length > 0 && (
        <section className="sec01">
          <div className="topinner">
            <h2 className="ttl">{home.instagram.title}</h2>
            <div className="insta-header">
              {home.instagram.avatar && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={home.instagram.avatar}
                    alt=""
                    className="avatar"
                  />
                </>
              )}
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-id"
              >
                {home.instagram.bio || `@${site.instagramUser}`}
              </a>
            </div>
            <div className="insta-grid">
              {home.instagram.images.map((src, i) => (
                <a
                  key={src}
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Instagram ${i + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* sec02: 再生医療メニュー + 診療メニュー */}
      <section className="sec02">
        <div className="topinner">
          <h2 className="ttl">{home.regen.title}</h2>
          <p
            className="pc_tac mb0"
            dangerouslySetInnerHTML={{ __html: home.regen.text }}
          />
          {home.regen.bannerHref && (
            <div className="bnr_block">
              <div className="topinner">
                <div className="btn">
                  <Link href={lh(home.regen.bannerHref)}>
                    {home.regen.bannerText}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <MenuCardRow
            cards={home.regen.cards}
            lh={lh}
            firstTtl={1}
            textCls="sameheight"
            subAfter
          />

          <h2 className="ttl ttl2">{home.menuCards.title}</h2>
          <p
            className="pc_tac mbchange pc-text-center"
            dangerouslySetInnerHTML={{ __html: home.menuCards.text }}
          />
          <MenuCardRow
            cards={home.menuCards.cards}
            lh={lh}
            firstTtl={4}
            textCls="sameheight2"
            wrapCls="mbchange2"
          />

          <ul className="columns wrap sp_col_2 sp_wrap con02">
            {home.menuCards.links.map((l) => (
              <li key={l.href} className="column col_4">
                <Link href={lh(l.href)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* sec06: 症状・お悩みから探す */}
      <section className="sec06">
        <div className="topinner">
          <h2 className="ttl">{home.concerns.title}</h2>
          <p
            className="pc_tac"
            dangerouslySetInnerHTML={{ __html: home.concerns.text }}
          />
          <ul className="columns wrap sp_col_2 sp_wrap">
            {home.concerns.items.map((c) => (
              <li key={c.href} className="column col_3">
                <Link href={lh(c.href)} className="concern-link">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.alt} loading="lazy" />
                  {locale !== "ja" && (
                    <span className="concern-label" aria-hidden="true">
                      {c.alt}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* sec03: 機器から探す */}
      <section className="sec03">
        <div className="topinner">
          <h2 className="ttl">{home.devices.title}</h2>
          <p
            className="pc_tac"
            dangerouslySetInnerHTML={{ __html: home.devices.text }}
          />
          <div className="columns wrap sp_col_2 sp_wrap">
            {home.devices.items.map((d) => (
              <div key={d.name} className="column col_3">
                <div className="box_link">
                  <Link href={lh(d.href)} aria-label={d.name} />
                </div>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt={d.name} loading="lazy" className="pc" />
                  {d.imageSp && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={d.imageSp}
                      alt={d.name}
                      loading="lazy"
                      className="sp"
                    />
                  )}
                </figure>
                <h3>{d.name}</h3>
                <div className="txt_wrap">
                  <p>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sec04: 3つの特徴 */}
      <section className="sec04">
        <div className="con_ttl">
          <div className="topinner">
            <h2
              className="ttl"
              dangerouslySetInnerHTML={{ __html: home.features.title }}
            />
            <p
              className="pc_tac"
              dangerouslySetInnerHTML={{ __html: home.features.text }}
            />
          </div>
        </div>
        <div className="columns con">
          {home.features.items.map((f, i) => (
            <div
              key={f.title}
              className={`column col_3 con0${i + 1}`}
              style={
                f.image ? { backgroundImage: `url(${f.image})` } : undefined
              }
            >
              {f.href && (
                <div className="box_link">
                  <Link href={lh(f.href)}>詳細はこちら</Link>
                </div>
              )}
              <div className="txt_wrap">
                <h3>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span dangerouslySetInnerHTML={{ __html: f.title }} />
                </h3>
                <p className="tac">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* sec05: ごあいさつ */}
      {home.greeting && (
        <section className="sec05">
          <div className="topinner">
            <h2 className="ttl">{home.greeting.title}</h2>
            <div className="columns aic">
              <div className="column col_2 col_img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={home.greeting.image}
                  alt={home.greeting.imageAlt}
                  loading="lazy"
                />
              </div>
              <div className="column col_2 col_txt">
                <p
                  dangerouslySetInnerHTML={{
                    __html: home.greeting.text.replace(/\n/g, "<br />"),
                  }}
                />
                <p className="name">
                  <span className="s">{home.greeting.nameTitle}</span>
                  <br />
                  {home.greeting.name}
                </p>
                <div className="btn-style right">
                  <Link href={lh(home.greeting.href)}>MORE</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Googleマップ */}
      {access.mapEmbedUrl && (
        <div className="map_block">
          <div className="googlemap">
            <iframe
              width="600"
              height="450"
              style={{ border: 0 }}
              src={access.mapEmbedUrl}
              allowFullScreen
              loading="lazy"
              title="Google Maps"
            />
          </div>
        </div>
      )}

      {/* sec07: テキスト + クリニック情報 */}
      <section className="sec07">
        <div className="topinner">
          {home.textSection && (
            <>
              <h2 className="ttl">{home.textSection.title}</h2>
              <Blocks blocks={home.textSection.blocks} bare />
            </>
          )}
        </div>
        {home.seoBox && (
          <div className="topinner seo-box">
            <h3>{home.seoBox.title}</h3>
            {home.seoBox.paragraphs.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
            {home.seoBox.btnText && (
              <div className="c-btn btn-style">
                <Link className="c-btn-anchor" href={lh(home.seoBox.btnHref)}>
                  {home.seoBox.btnText}
                </Link>
              </div>
            )}
            <div className="u-mt50 c-nap">
              <h3 className="c-nap-title">{home.seoBox.napTitle}</h3>
              <table className="c-table">
                <tbody>
                  {home.seoBox.rows.map((r) => (
                    <tr key={r.label}>
                      <th>{r.label}</th>
                      <td>
                        {r.href ? (
                          r.href.startsWith("tel:") ? (
                            <a href={r.href}>{r.value}</a>
                          ) : (
                            <Link href={lh(r.href)}>{r.value}</Link>
                          )
                        ) : (
                          r.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      <SiteFooter locale={locale} />
      <CtaBar locale={locale} />
    </div>
  );
}

/** 本家 sec02 のカード行(PC=bggrayカード / SP=con01背景カード の二重構造) */
function MenuCardRow({
  cards,
  lh,
  firstTtl,
  textCls,
  wrapCls = "",
  subAfter = false,
}: {
  cards: {
    title: string;
    sub: string;
    text: string;
    image: string;
    titleBg: string;
    href: string;
  }[];
  lh: (href: string) => string;
  /** sec_02_ttlNN / con01_N の開始番号 */
  firstTtl: number;
  /** sameheight / sameheight2 */
  textCls: string;
  wrapCls?: string;
  /** PCタイトルで sub をタイトルの後に置く(再生医療グループ) */
  subAfter?: boolean;
}) {
  return (
    <>
      <div className={`columns wrap pc${wrapCls ? ` ${wrapCls}` : ""}`}>
        {cards.map((c, i) => (
          <div key={c.href} className="column col_3">
            <div className="bggray">
              <p
                className={`sec02_ttl sec_02_ttl0${firstTtl + i}`}
                style={
                  c.titleBg
                    ? { backgroundImage: `url(${c.titleBg})` }
                    : undefined
                }
              >
                {!subAfter && c.sub && <span className="sub">{c.sub}</span>}
                {c.title}
                {subAfter && c.sub && <span className="sub">{c.sub}</span>}
              </p>
              <p className={textCls}>{c.text}</p>
              <div className="overbtn">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.title} loading="lazy" />
                </figure>
                <div className="btn-style">
                  <Link href={lh(c.href)}>MORE</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="columns wrap con01 sp">
        {cards.map((c, i) => (
          <div key={c.href} className={`column col_2 con01_${firstTtl + i}`}>
            <div className="txt_wrap">
              <h3>
                {subAfter ? (
                  i === 1 ? (
                    c.title
                  ) : (
                    <span className="sub">
                      {c.title}
                      {c.sub && <span className="sub">{c.sub}</span>}
                    </span>
                  )
                ) : (
                  <>
                    {c.sub && <span className="sub">{c.sub}</span>}
                    {c.title}
                  </>
                )}
              </h3>
              <p>{c.text}</p>
              <div className="btn-style">
                <Link href={lh(c.href)}>MORE</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
