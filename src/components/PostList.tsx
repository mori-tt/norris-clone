import Link from "next/link";
import { formatDate } from "@/lib/content";
import type { Post } from "@/lib/schemas";

type Props = {
  posts: Post[];
  basePath: "news" | "column";
};

/** お知らせ/コラムの日付+タイトル一覧(本家 dl 形式) */
export function PostList({ posts, basePath }: Props) {
  if (posts.length === 0) {
    return <p className="py-8 text-center text-sm">記事はまだありません。</p>;
  }
  return (
    <dl className="post-list">
      {posts.map((p) => (
        <div key={p.slug} className="contents">
          <dt>
            <time dateTime={p.date}>{formatDate(p.date)}</time>
          </dt>
          <dd>
            <Link href={`/${basePath}/${p.slug}/`}>
              {p.title}
              <span className="cat">{p.category}</span>
            </Link>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MoreLink({ href, label = "一覧へ" }: { href: string; label?: string }) {
  return (
    <div className="btn-style mt-8">
      <Link href={href}>{label}</Link>
    </div>
  );
}
