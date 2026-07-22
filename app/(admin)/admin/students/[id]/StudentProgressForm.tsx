// app/(admin)/admin/students/[id]/StudentProgressForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentProgressForm({
  studentId,
}: {
  studentId: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/students/${studentId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erreur.");
      return;
    }

    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        placeholder="Ajouter une note de progression..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}
