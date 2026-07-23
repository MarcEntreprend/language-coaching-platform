// app/blog/page.tsx

import Link from "next/link";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/public";
import { deriveMetaDescription } from "@/lib/utils/blog";

export const metadata: Metadata = {
  title: "Blog — Conseils pour progresser en anglais | Speak with Marc",
  description:
    "Astuces, méthodes et ressources pour parler anglais avec plus d'aisance, publiées régulièrement.",
  openGraph: {
    title: "Blog — Speak with Marc",
    description: "Astuces et méthodes pour progresser en anglais parlé.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const { data: posts } = await supabasePublic
    .from("blog_posts")
    .select(
      "slug, title, excerpt, content, published_at, blog_categories(name, slug)",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const { data: categories } = await supabasePublic
    .from("blog_categories")
    .select("name, slug")
    .order("name", { ascending: true });

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
        <h1 className="text-3xl font-semibold text-slate-900">Blog</h1>
        <p className="mt-2 text-sm text-slate-500">
          Conseils, méthodes et ressources pour progresser en anglais parlé.
        </p>

        {(categories ?? []).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-900 hover:text-slate-900"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(posts ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun article publié pour l'instant.
            </p>
          ) : (
            (posts ?? []).map((post: any) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-900 transition-colors"
              >
                {post.blog_categories?.name && (
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {post.blog_categories.name}
                  </span>
                )}
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
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
