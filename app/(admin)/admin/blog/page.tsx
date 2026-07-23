// app/(admin)/admin/blog/page.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeletePostButton from "./DeletePostButton";
import TogglePublishButton from "./TogglePublishButton";

export default async function AdminBlogListPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, is_published, published_at, blog_categories(name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Articles du blog
        </h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nouvel article
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {(posts ?? []).length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            Aucun article pour l'instant.
          </p>
        ) : (
          (posts ?? []).map((post: any) => (
            <div
              key={post.id}
              className="flex items-center justify-between px-4 py-3 gap-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="text-sm font-medium text-slate-900 hover:underline truncate block"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {post.blog_categories?.name ?? "Sans catégorie"} · /blog/
                  {post.slug}
                </p>
              </div>
              <TogglePublishButton
                postId={post.id}
                isPublished={post.is_published}
              />
              <DeletePostButton postId={post.id} />
            </div>
          ))
        )}
      </div>

      <Link
        href="/admin/blog/categories"
        className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Gérer les catégories →
      </Link>
    </div>
  );
}
