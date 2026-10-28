import type { Metadata } from "next";
import { getMenuByKind } from "@/lib/content";
import type { MenuItem } from "@/lib/schemas";
import { PageHero } from "@/components/PageHero";
import { MenuCard } from "@/components/MenuCard";

export const metadata: Metadata = { title: "診療メニュー" };

const groups: { kind: MenuItem["kind"]; title: string; en: string }[] = [
  { kind: "treatment", title: "診療メニュー", en: "TREATMENT" },
  { kind: "concern", title: "症状・お悩みから探す", en: "CONCERNS" },
  { kind: "device", title: "機器から探す", en: "DEVICES" },
  { kind: "mens", title: "メンズ", en: "MENS" },
];

export default function MenuPage() {
  return (
    <>
      <PageHero ja="診療メニュー" en="MENU" />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
        {groups.map(({ kind, title, en }) => {
          const items = getMenuByKind(kind);
          if (items.length === 0) return null;
          return (
            <section key={kind} id={kind}>
              <h2 className="mb-6 border-l-4 border-primary pl-3 font-serif text-xl font-semibold">
                {title}
                <span className="ml-3 text-xs tracking-[0.2em] text-primary-dark">
                  {en}
                </span>
              </h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((m) => (
                  <li key={m.slug}>
                    <MenuCard item={m} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
