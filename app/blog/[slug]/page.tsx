// app/blog/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { supabasePublic } from "@/lib/supabase/public";
import { deriveMetaDescription } from "@/lib/utils/blog";
import JsonLd from "@/components/JsonLd";
import CommentForm from "@/components/CommentForm";

export const revalidate = 3600;

async function getPost(slug: string) {
  const { data } = await supabasePublic
    .from("blog_posts")
    .select("*, blog_categories(name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}

async function getApprovedComments(postId: string) {
  const { data } = await supabasePublic
    .from("blog_comments")
    .select("id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function generateStaticParams() {
  const { data: posts } = await supabasePublic
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  return (posts ?? []).map((post) => ({ slug: post.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Article introuvable" };

  const description =
    post.meta_description || deriveMetaDescription(post.excerpt, post.content);
  const title = post.meta_title || post.title;
  const image = post.og_image_url || post.cover_image_url || undefined;

  return {
    title: `${title} | Speak with Marc`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();
  const comments = await getApprovedComments(post.id);

  const contentHtml = marked.parse(post.content, { async: false }) as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.meta_description ||
      deriveMetaDescription(post.excerpt, post.content),
    image: post.og_image_url || post.cover_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { "@type": "Person", name: "Marc" },
    publisher: { "@type": "Organization", name: "Speak with Marc" },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={articleJsonLd} />

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Speak with Marc
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Commencer
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/blog"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Tous les articles
        </Link>

        {post.blog_categories?.name && (
          <Link
            href={`/blog/category/${post.blog_categories.slug}`}
            className="mt-4 inline-block text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-900"
          >
            {post.blog_categories.name}
          </Link>
        )}

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {post.title}
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString()
            : ""}
        </p>

        <div
          className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-a:text-slate-900"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {comments.length > 0
              ? `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`
              : "Commentaires"}
          </h2>

          <div className="mt-6 space-y-5">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400">
                Sois le premier à commenter.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      {c.author_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                    {c.body}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Laisser un commentaire
            </h3>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </article>
    </main>
  );
}
