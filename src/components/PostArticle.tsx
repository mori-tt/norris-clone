import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/content";
import type { Post } from "@/lib/schemas";
import { Blocks } from "./Blocks";

/** news/column 詳細ページ共通レイアウト */
export function PostArticle({
  post,
  basePath,
}: {
  post: Post;
  basePath: "news" | "column";
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-text/60">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="ml-3 rounded-full bg-accent/40 px-3 py-1 text-xs text-primary-dark">
          {post.category}
        </span>
      </p>
      <h1 className="mt-3 font-serif text-2xl font-semibold leading-relaxed">
        {post.title}
      </h1>
      {post.image && (
        <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width:768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="mt-8">
        <Blocks blocks={post.body} />
      </div>
      <div className="mt-12 text-center">
        <Link
          href={`/${basePath}/`}
          className="inline-block rounded-full border border-primary px-6 py-2.5 text-sm text-primary-dark"
        >
          一覧へ戻る
        </Link>
      </div>
    </article>
  );
}
