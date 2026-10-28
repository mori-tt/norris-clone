import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/content";
import type { Post } from "@/lib/schemas";
import { ArrowRightIcon } from "./icons";

type Props = {
  posts: Post[];
  basePath: "news" | "column";
};

/** お知らせ/コラムの記事カード一覧 */
export function PostList({ posts, basePath }: Props) {
  if (posts.length === 0) {
    return <p className="text-center text-sm text-text/60">記事はまだありません。</p>;
  }
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/${basePath}/${p.slug}/`}
            className="group block overflow-hidden rounded border border-accent/60 bg-white transition-shadow hover:shadow-md"
          >
            {p.image && (
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs text-text/60">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <span className="ml-2 rounded-full bg-accent/40 px-2 py-0.5 text-[10px] text-primary-dark">
                  {p.category}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed group-hover:text-primary-dark">
                {p.title}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MoreLink({ href, label = "一覧へ" }: { href: string; label?: string }) {
  return (
    <div className="mt-8 text-center">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm text-primary-dark transition-colors hover:bg-primary hover:text-white"
      >
        {label}
        <ArrowRightIcon />
      </Link>
    </div>
  );
}
