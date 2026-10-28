import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { PostList } from "@/components/PostList";

export const metadata: Metadata = { title: "メディカルコラム" };

export default function ColumnPage() {
  const posts = getPosts("column");
  return (
    <>
      <PageHero ja="メディカルコラム" en="COLUMN" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PostList posts={posts} basePath="column" />
      </div>
    </>
  );
}
