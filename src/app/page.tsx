import Image from "next/image";
import Link from "next/link";
import {
  getHome,
  getMenuByKind,
  getPosts,
  getSchedule,
  getSite,
} from "@/lib/content";
import { HeroSlider } from "@/components/HeroSlider";
import { SectionHeading } from "@/components/SectionHeading";
import { PostList, MoreLink } from "@/components/PostList";
import { MenuCard } from "@/components/MenuCard";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import {
  ArrowRightIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";

export default async function HomePage() {
  const site = getSite();
  const home = getHome();
  const news = (await getPosts("news")).slice(0, 3);
  const treatments = getMenuByKind("treatment");
  const schedule = getSchedule();

  return (
    <>
      <HeroSlider slides={home.hero.slides} />

      {/* 特徴 */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading en="Feature" ja={home.features.title} />
          <ul className="grid gap-6 md:grid-cols-3">
            {home.features.items.map((f, i) => (
              <li
                key={f.title}
                className="rounded border border-accent/60 bg-white p-6 text-center"
              >
                <p className="font-serif text-3xl font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 font-bold">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-text/70">
                  {f.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* お知らせ */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading en="News" ja="お知らせ" />
          <PostList posts={news} basePath="news" />
          <MoreLink href="/news/" />
        </div>
      </section>

      {/* 診療カレンダー */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading en="Schedule" ja="診療日" />
          <ScheduleCalendar calendar={schedule.calendar} />
        </div>
      </section>

      {/* 診療メニュー */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading en="Menu" ja="診療メニュー" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.map((m) => (
              <li key={m.slug}>
                <MenuCard item={m} />
              </li>
            ))}
          </ul>
          <MoreLink href="/menu/" />
        </div>
      </section>

      {/* Instagram */}
      {site.instagramUrl && (
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading en="Instagram" ja={site.instagramUser} />
            {home.instagramNote && (
              <p className="mb-6 text-center text-sm text-text/70">
                {home.instagramNote}
              </p>
            )}
            <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n}>
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded"
                  >
                    <Image
                      src={`/images/insta-${n}.svg`}
                      alt={`Instagram投稿 ${n}`}
                      fill
                      sizes="(max-width:768px) 33vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-dark underline"
              >
                <InstagramIcon /> @{site.instagramUser}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* アクセス */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading en="Access" ja="アクセス" />
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2">
              <MapPinIcon className="h-4 w-4 shrink-0 text-primary-dark" />
              <span>
                〒{site.postalCode} {site.address}
              </span>
            </p>
            {site.addressNote && (
              <p className="mt-2 text-sm text-text/70">{site.addressNote}</p>
            )}
            <a
              href={`tel:${site.tel.replaceAll("-", "")}`}
              className="mt-4 inline-flex items-center gap-2 text-2xl font-bold text-primary-dark"
            >
              <PhoneIcon className="h-6 w-6" />
              {site.tel}
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {site.reserveUrl && (
                <a
                  href={site.reserveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
                >
                  WEB予約はこちら
                </a>
              )}
              <Link
                href="/access/"
                className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm text-primary-dark"
              >
                診療時間・アクセス
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
