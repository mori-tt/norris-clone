import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { PostList } from "@/components/PostList";

export const metadata: Metadata = { title: "お知らせ" };

export default function NewsPage() {
  const posts = getPosts("news");
  return (
    <>
      <PageHero ja="お知らせ" en="NEWS" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PostList posts={posts} basePath="news" />
      </div>
    </>
  );
}
