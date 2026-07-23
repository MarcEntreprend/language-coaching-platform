// app/(admin)/admin/blog/comments/CommentModerationRow.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  authorName: string;
  authorEmail: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
  postTitle: string;
  postSlug: string;
};

export default function CommentModerationRow({
  comment,
}: {
  comment: Comment;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggleApproval() {
    setLoading(true);
    await fetch(`/api/admin/blog/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !comment.isApproved }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/blog/comments/${comment.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {comment.authorName}{" "}
            <span className="text-xs font-normal text-slate-400">
              {comment.authorEmail}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            sur <span className="font-medium">{comment.postTitle}</span> ·{" "}
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
            {comment.body}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleToggleApproval}
            disabled={loading}
            className={`text-xs px-2.5 py-1.5 rounded-full font-medium disabled:opacity-50 ${
              comment.isApproved
                ? "bg-slate-100 text-slate-600"
                : "bg-green-600 text-white"
            }`}
          >
            {comment.isApproved ? "Masquer" : "Approuver"}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
