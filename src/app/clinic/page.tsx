import type { Metadata } from "next";
import Image from "next/image";
import { getClinic } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Blocks } from "@/components/Blocks";

export const metadata: Metadata = { title: "クリニック紹介" };

export default function ClinicPage() {
  const clinic = getClinic();

  return (
    <>
      <PageHero ja="クリニック紹介" en="CLINIC" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* クリニックについて */}
        <section id="about" className="scroll-mt-24">
          <div className="grid items-center gap-8 md:grid-cols-2">
            {clinic.about.image && (
              <div className="relative aspect-[3/2] overflow-hidden rounded">
                <Image
                  src={clinic.about.image}
                  alt={clinic.about.title}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="font-serif text-xl font-semibold leading-relaxed">
                {clinic.about.title}
              </h2>
              <div className="mt-4 text-sm">
                <Blocks blocks={clinic.about.body} />
              </div>
            </div>
          </div>
        </section>

        {/* 設備紹介 */}
        <section id="facilities" className="mt-16 scroll-mt-24">
          <h2 className="mb-8 text-center font-serif text-2xl font-semibold">
            設備紹介
            <span className="ml-3 text-sm tracking-[0.2em] text-primary-dark">
              FACILITIES
            </span>
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {clinic.facilities.map((f) => (
              <li
                key={f.name}
                className="overflow-hidden rounded border border-accent/60 bg-white"
              >
                {f.image && (
                  <div className="relative aspect-[3/2]">
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-bold">{f.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text/70">
                    {f.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
