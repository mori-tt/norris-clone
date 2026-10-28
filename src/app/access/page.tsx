import type { Metadata } from "next";
import { getAccess, getSchedule, getSite } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { MapPinIcon, PhoneIcon } from "@/components/icons";

export const metadata: Metadata = { title: "診療時間・アクセス" };

export default function AccessPage() {
  const site = getSite();
  const access = getAccess();
  const schedule = getSchedule();

  return (
    <>
      <PageHero ja="診療時間・アクセス" en="SCHEDULE・ACCESS" />
      <div className="mx-auto max-w-4xl space-y-16 px-4 py-12">
        {/* 医院情報 */}
        <section>
          <h2 className="mb-6 border-l-4 border-primary pl-3 font-serif text-xl font-semibold">
            医院情報
          </h2>
          <dl className="divide-y divide-accent/60 text-sm">
            {[
              ["名称", site.name],
              ["院長", site.director],
              ["住所", `〒${site.postalCode} ${site.address}`],
              ["TEL", site.tel],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 py-3">
                <dt className="font-bold text-primary-dark">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 診療時間 */}
        <section id="schedule" className="scroll-mt-24">
          <h2 className="mb-6 border-l-4 border-primary pl-3 font-serif text-xl font-semibold">
            診療時間
          </h2>
          <dl className="mb-8 divide-y divide-accent/60 text-sm">
            {schedule.hoursTable.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[6rem_1fr] gap-4 py-3"
              >
                <dt className="font-bold text-primary-dark">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <ScheduleCalendar calendar={schedule.calendar} />
        </section>

        {/* アクセス */}
        <section id="access" className="scroll-mt-24">
          <h2 className="mb-6 border-l-4 border-primary pl-3 font-serif text-xl font-semibold">
            アクセス
          </h2>
          {access.byTrain.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 font-bold">電車でお越しの方</h3>
              <dl className="space-y-2 text-sm">
                {access.byTrain.map((t) => (
                  <div key={t.line} className="grid grid-cols-[6rem_1fr] gap-4">
                    <dt className="font-bold text-primary-dark">{t.line}</dt>
                    <dd>{t.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {access.byCar && (
            <div className="mb-6">
              <h3 className="mb-3 font-bold">車でお越しの方</h3>
              <p className="text-sm">{access.byCar}</p>
            </div>
          )}
          {access.mapEmbedUrl ? (
            <iframe
              src={access.mapEmbedUrl}
              title="アクセスマップ"
              className="aspect-video w-full rounded border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded border border-dashed border-primary/50 bg-white text-sm text-text/60">
              <MapPinIcon className="h-8 w-8 text-primary" />
              <p>〒{site.postalCode} {site.address}</p>
              {access.mapNote && <p className="px-4 text-xs">{access.mapNote}</p>}
            </div>
          )}
          <div className="mt-8 text-center">
            <a
              href={`tel:${site.tel.replaceAll("-", "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
            >
              <PhoneIcon />
              {site.tel}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
