import type { Metadata } from "next";
import Image from "next/image";
import { getDoctor } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Blocks } from "@/components/Blocks";

export const metadata: Metadata = { title: "院長紹介" };

export default function DoctorPage() {
  const doctor = getDoctor();

  return (
    <>
      <PageHero ja="院長紹介" en="DOCTOR" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <div>
            {doctor.image && (
              <div className="relative aspect-[4/5] overflow-hidden rounded">
                <Image
                  src={doctor.image}
                  alt={`${doctor.title} ${doctor.name}`}
                  fill
                  sizes="(max-width:768px) 100vw, 280px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-primary-dark">
              {doctor.romanName}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              {doctor.title} {doctor.name}
            </h2>
            <div className="mt-6 text-sm">
              <Blocks blocks={doctor.message} />
            </div>
          </div>
        </div>

        {doctor.career.length > 0 && (
          <section className="mt-12">
            <h3 className="border-l-4 border-primary pl-3 font-serif text-lg font-semibold">
              経歴
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {doctor.career.map((c) => (
                <li key={c} className="border-b border-accent/50 pb-2">
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        {doctor.qualifications.length > 0 && (
          <section className="mt-12">
            <h3 className="border-l-4 border-primary pl-3 font-serif text-lg font-semibold">
              資格・所属学会
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {doctor.qualifications.map((q) => (
                <li key={q} className="border-b border-accent/50 pb-2">
                  {q}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
