// app/blog/category/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/public";
import { deriveMetaDescription } from "@/lib/utils/blog";

export const revalidate = 3600;

async function getCategory(slug: string) {
  const { data } = await supabasePublic
    .from("blog_categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return { title: "Catégorie introuvable" };

  return {
    title: `${category.name} — Blog | Speak with Marc`,
    description: `Articles de la catégorie ${category.name} sur l'apprentissage de l'anglais parlé.`,
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const { data: posts } = await supabasePublic
    .from("blog_posts")
    .select("slug, title, excerpt, content, published_at")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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

      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/blog"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Tous les articles
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {category.name}
        </h1>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(posts ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun article dans cette catégorie.
            </p>
          ) : (
            (posts ?? []).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-900 transition-colors"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">
                  {deriveMetaDescription(post.excerpt, post.content, 160)}
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : ""}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
