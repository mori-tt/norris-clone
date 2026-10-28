import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMenuItem,
  getMenuItems,
  getRelatedMenuItems,
} from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Blocks } from "@/components/Blocks";
import { MenuCard } from "@/components/MenuCard";
import { ArrowRightIcon } from "@/components/icons";

export function generateStaticParams() {
  return getMenuItems().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  props: PageProps<"/menu/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = getMenuItem(slug);
  if (!item) return {};
  return { title: item.name, description: item.lead || item.catchcopy };
}

export default async function MenuDetailPage(
  props: PageProps<"/menu/[slug]">,
) {
  const { slug } = await props.params;
  const item = getMenuItem(slug);
  if (!item) notFound();

  const related = getRelatedMenuItems(item);

  return (
    <>
      <PageHero ja={item.name} en={item.nameEn} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        {item.catchcopy && (
          <p className="text-center font-serif text-lg font-semibold text-primary-dark">
            {item.catchcopy}
          </p>
        )}
        {item.lead && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed">
            {item.lead}
          </p>
        )}
        {item.image && (
          <div className="relative mx-auto mt-8 aspect-[3/2] max-w-3xl overflow-hidden rounded">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {item.features.length > 0 && (
          <ul className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
            {item.features.map((f) => (
              <li
                key={f}
                className="rounded bg-accent/30 px-3 py-2 text-center text-xs font-medium"
              >
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Blocks blocks={item.body} />
        </div>

        {item.priceNote && (
          <div className="mt-10 rounded border border-primary/40 bg-white p-5 text-center">
            <p className="text-xs tracking-widest text-primary-dark">PRICE</p>
            <p className="mt-1 font-serif text-lg font-semibold">
              {item.priceNote}
            </p>
            <Link
              href="/fee/"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary-dark underline"
            >
              料金一覧を見る
              <ArrowRightIcon />
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-center font-serif text-xl font-semibold">
              関連メニュー
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <MenuCard item={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
