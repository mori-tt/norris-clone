import Link from "next/link";

type Props = {
  ja: string;
  en?: string;
};

/** 下層ページ共通の見出し帯(パンくず付き) */
export function PageHero({ ja, en }: Props) {
  return (
    <div className="border-b border-accent/60 bg-accent/20 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">
          {ja}
          {en && (
            <span className="ml-3 text-sm tracking-[0.2em] text-primary-dark">
              {en}
            </span>
          )}
        </h1>
        <p className="mt-3 text-xs text-text/60">
          <Link href="/" className="hover:text-primary-dark">
            HOME
          </Link>
          <span className="mx-1">&gt;</span>
          {ja}
        </p>
      </div>
    </div>
  );
}
