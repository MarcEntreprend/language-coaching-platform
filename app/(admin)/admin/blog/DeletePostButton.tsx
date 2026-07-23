// app/(admin)/admin/blog/DeletePostButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    await fetch(`/api/admin/blog/posts/${postId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      disabled={loading}
      className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {confirming ? "Confirmer ?" : "Supprimer"}
    </button>
  );
}
