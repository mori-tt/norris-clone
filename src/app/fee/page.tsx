import type { Metadata } from "next";
import { getFee } from "@/lib/content";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "料金一覧" };

export default function FeePage() {
  const fee = getFee();

  return (
    <>
      <PageHero ja="料金一覧" en="PRICE" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        {fee.note && (
          <p className="mb-8 text-center text-sm text-text/70">{fee.note}</p>
        )}
        <div className="space-y-12">
          {fee.categories.map((cat) => (
            <section key={cat.name}>
              <h2 className="border-l-4 border-primary pl-3 font-serif text-xl font-semibold">
                {cat.name}
              </h2>
              {cat.note && (
                <p className="mt-2 text-xs text-text/60">{cat.note}</p>
              )}
              <table className="mt-4 w-full border-collapse text-sm">
                <tbody>
                  {cat.items.map((item) => (
                    <tr
                      key={item.name}
                      className="border-b border-accent/60"
                    >
                      <th className="py-3 pr-4 text-left font-medium">
                        {item.name}
                        {item.note && (
                          <span className="ml-2 text-xs font-normal text-text/60">
                            ※{item.note}
                          </span>
                        )}
                      </th>
                      <td className="w-40 py-3 text-right font-bold text-primary-dark">
                        {item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
