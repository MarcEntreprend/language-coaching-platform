// app/(admin)/admin/blog/comments/page.tsx
import { requireAdmin } from "@/lib/supabase/admin-guard";
import CommentModerationRow from "./CommentModerationRow";

export default async function AdminCommentsPage() {
  const { supabase } = await requireAdmin();

  const { data: comments } = await supabase
    .from("blog_comments")
    .select(
      "id, author_name, author_email, body, is_approved, created_at, blog_posts(title, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const pending = (comments ?? []).filter((c) => !c.is_approved);
  const approved = (comments ?? []).filter((c) => c.is_approved);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Commentaires</h1>
        <p className="text-sm text-slate-500 mt-1">
          {pending.length} en attente de modération
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          En attente
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {pending.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">Rien à modérer.</p>
          ) : (
            pending.map((c: any) => (
              <CommentModerationRow
                key={c.id}
                comment={{
                  id: c.id,
                  authorName: c.author_name,
                  authorEmail: c.author_email,
                  body: c.body,
                  isApproved: c.is_approved,
                  createdAt: c.created_at,
                  postTitle: c.blog_posts?.title ?? "Article supprimé",
                  postSlug: c.blog_posts?.slug ?? "",
                }}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Approuvés</h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {approved.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              Aucun commentaire approuvé.
            </p>
          ) : (
            approved.map((c: any) => (
              <CommentModerationRow
                key={c.id}
                comment={{
                  id: c.id,
                  authorName: c.author_name,
                  authorEmail: c.author_email,
                  body: c.body,
                  isApproved: c.is_approved,
                  createdAt: c.created_at,
                  postTitle: c.blog_posts?.title ?? "Article supprimé",
                  postSlug: c.blog_posts?.slug ?? "",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
