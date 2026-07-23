// app/(admin)/admin/blog/TogglePublishButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TogglePublishButton({
  postId,
  isPublished,
}: {
  postId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/blog/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !isPublished }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`shrink-0 text-xs px-2.5 py-1.5 rounded-full font-medium disabled:opacity-50 ${
        isPublished
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {isPublished ? "Publié" : "Brouillon"}
    </button>
  );
}
