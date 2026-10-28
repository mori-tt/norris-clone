import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { PostArticle } from "@/components/PostArticle";

export function generateStaticParams() {
  return getPosts("news").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/news/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost("news", slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function NewsDetailPage(
  props: PageProps<"/news/[slug]">,
) {
  const { slug } = await props.params;
  const post = getPost("news", slug);
  if (!post) notFound();
  return <PostArticle post={post} basePath="news" />;
}
