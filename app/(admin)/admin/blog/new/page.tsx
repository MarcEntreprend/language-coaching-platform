// app/(admin)/admin/blog/new/page.tsx
import { createClient } from "@/lib/supabase/server";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Nouvel article
      </h1>
      <BlogPostForm mode="create" categories={categories ?? []} />
    </div>
  );
}
