// app/(admin)/admin/blog/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase
      .from("blog_categories")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Modifier l'article
      </h1>
      <BlogPostForm
        mode="edit"
        categories={categories ?? []}
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          category_id: post.category_id ?? "",
          meta_title: post.meta_title ?? "",
          meta_description: post.meta_description ?? "",
          og_image_url: post.og_image_url ?? "",
          cover_image_url: post.cover_image_url ?? "",
          is_published: post.is_published,
        }}
      />
    </div>
  );
}
