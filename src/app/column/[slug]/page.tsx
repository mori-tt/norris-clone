import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { PostArticle } from "@/components/PostArticle";

export async function generateStaticParams() {
  return (await getPosts("column")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/column/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost("column", slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function ColumnDetailPage(
  props: PageProps<"/column/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getPost("column", slug);
  if (!post) notFound();
  return <PostArticle post={post} basePath="column" />;
}
