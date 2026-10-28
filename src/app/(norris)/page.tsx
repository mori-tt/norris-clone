import Link from "next/link";
import { getHome, getPosts, getSite } from "@/lib/content";
import { HeroSlider } from "@/components/HeroSlider";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBar } from "@/components/CtaBar";
import { HtmlLang } from "@/components/HtmlLang";
import { Blocks } from "@/components/Blocks";
import { formatDate } from "@/lib/content";
import { CHROME, localePrefix, type Locale } from "@/lib/i18n";

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
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);
  const lh = (href: string) =>
    href.startsWith("/") && !href.startsWith("//") ? prefix + href : href;
  const news = (await getPosts("news")).slice(0, 3);

  return (
    <div
      className="pbody home"
      lang={locale === "zh" ? "zh-CN" : locale}
    >
      <HtmlLang locale={locale} />
      <SiteHeader locale={locale} currentPath="/" />
      <HeroSlider slides={home.hero.slides} />

      {/* 泌尿器科バナー */}
      {home.banner && (
        <div className="bnr-block">
          <div className="topinner">
            <p>
              <Link href={lh(home.banner.href || "#")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={home.banner.image} alt={home.banner.alt} />
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* sec01: News + Schedule */}
      <section className="sec_news py-[4%]">
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
                  <div key={p.slug} className="contents">
                    <dt>
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                    </dt>
                    <dd>
                      <Link href={`${prefix}/news/${p.slug}/`}>{p.title}</Link>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="column col_2">
              <h3>
                <span className="en">Schedule</span>
                {home.scheduleTitle}
              </h3>
              {home.scheduleImage && (
                <p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={home.scheduleImage} alt={home.scheduleTitle} />
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      {home.instagram && home.instagram.images.length > 0 && (
        <section className="py-[4%]">
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
          <SectionHeading ja={home.regen.title} ghost="menu" />
          <p className="mb-[4%] text-center">{home.regen.text}</p>
          {home.regen.bannerHref && (
            <div className="bnr-block">
              <div className="topinner">
                <div className="btn">
                  <Link href={lh(home.regen.bannerHref)}>
                    {home.regen.bannerText}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <MenuCardRow cards={home.regen.cards} lh={lh} />

          <h2 className="ttl ghost-menu">{home.menuCards.title}</h2>
          <p className="mb-[4%] text-center">{home.menuCards.text}</p>
          <MenuCardRow cards={home.menuCards.cards} lh={lh} />

          <ul className="menu-link-list mt-[4%]">
            {home.menuCards.links.map((l) => (
              <li key={l.href}>
                <Link href={lh(l.href)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* sec06: 症状・お悩みから探す */}
      <section className="sec06">
        <div className="topinner">
          <h2 className="ttl ghost-treatment">{home.concerns.title}</h2>
          <p className="mb-[2%] text-center">{home.concerns.text}</p>
          <ul className="columns wrap sp_col_2">
            {home.concerns.items.map((c) => (
              <li key={c.href} className="column col_3">
                <Link href={lh(c.href)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.alt} loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* sec03: 機器から探す */}
      <section className="sec03">
        <div className="topinner">
          <h2 className="ttl ghost-machine">{home.devices.title}</h2>
          <p className="mb-[4%] text-center">{home.devices.text}</p>
          <div className="columns wrap sp_col_2">
            {home.devices.items.map((d) => (
              <div key={d.name} className="column col_3">
                <Link href={lh(d.href)} className="box-link" aria-label={d.name} />
                <figure>
                  <picture>
                    {d.imageSp && (
                      <source media="(max-width: 767px)" srcSet={d.imageSp} />
                    )}
                    { }
                    <img src={d.image} alt={d.name} loading="lazy" />
                  </picture>
                </figure>
                <h3>{d.name}</h3>
                <div className="txt-wrap">
                  <p>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sec04: 3つの特徴 */}
      <section className="sec04">
        <div className="topinner">
          <h2 className="ttl ghost-features">{home.features.title}</h2>
          <p className="mb-[4%] text-center">{home.features.text}</p>
          <div className="columns con">
            {home.features.items.map((f, i) => (
              <div
                key={f.title}
                className="column col_3"
                style={
                  f.image ? { backgroundImage: `url(${f.image})` } : undefined
                }
              >
                {f.href && (
                  <Link href={lh(f.href)} className="box-link" aria-label={f.title} />
                )}
                <div className="txt-wrap">
                  <h3>
                    <span className="num">{String(i + 1).padStart(2, "0")}</span>
                    {f.title}
                  </h3>
                  <p className="tac">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sec05: ごあいさつ */}
      {home.greeting && (
        <section className="sec05">
          <div className="topinner">
            <h2 className="ttl ghost-greeting">{home.greeting.title}</h2>
            <div className="columns aic">
              <div className="column col_2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={home.greeting.image}
                  alt={home.greeting.imageAlt}
                  loading="lazy"
                />
              </div>
              <div className="column col_2">
                {home.greeting.text.split("\n").map((p) => (
                  <p key={p.slice(0, 12)} className="mb-4">
                    {p}
                  </p>
                ))}
                <p className="name">
                  <span className="s">{home.greeting.nameTitle}</span>
                  <br />
                  {home.greeting.name}
                </p>
                <div className="btn-style outline right">
                  <Link href={lh(home.greeting.href)}>MORE</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* sec07: テキスト + クリニック情報 */}
      <section className="sec07">
        <div className="topinner">
          {home.textSection && (
            <>
              <h2 className="ttl">{home.textSection.title}</h2>
              <div className="prose-clinic">
                <Blocks blocks={home.textSection.blocks} />
              </div>
            </>
          )}
          {home.clinicTable && (
            <div className="mt-12">
              <h3 className="mb-6 text-center font-serif text-xl text-[#8e292c]">
                {home.clinicTable.title}
              </h3>
              <table className="clinic-table">
                <tbody>
                  {home.clinicTable.rows.map((r) => (
                    <tr key={r.label}>
                      <th>{r.label}</th>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <SiteFooter locale={locale} />
      <CtaBar locale={locale} />
    </div>
  );
}

/** 本家 sec02 のカード行(タイトル帯背景 + 画像 + MORE ボタン) */
function MenuCardRow({
  cards,
  lh,
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
}) {
  return (
    <div className="columns wrap mb-[4%]">
      {cards.map((c) => (
        <div key={c.href} className="column col_3 sec02-card">
          <p
            className="card-ttl"
            style={
              c.titleBg ? { backgroundImage: `url(${c.titleBg})` } : undefined
            }
          >
            {c.sub && <span className="sub">{c.sub}</span>}
            {c.title}
          </p>
          <p className="card-body">{c.text}</p>
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
      ))}
    </div>
  );
}
