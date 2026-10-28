import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { PostArticle } from "@/components/PostArticle";

export function generateStaticParams() {
  return getPosts("column").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/column/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost("column", slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function ColumnDetailPage(
  props: PageProps<"/column/[slug]">,
) {
  const { slug } = await props.params;
  const post = getPost("column", slug);
  if (!post) notFound();
  return <PostArticle post={post} basePath="column" />;
}
