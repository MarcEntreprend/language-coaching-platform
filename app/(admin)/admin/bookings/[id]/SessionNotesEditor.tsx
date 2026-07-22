// app/(admin)/admin/bookings/[id]/SessionNotesEditor.tsx
"use client";

import { useState } from "react";

export default function SessionNotesEditor({
  bookingId,
  initialNotes,
}: {
  bookingId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/bookings/${bookingId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    setSavedAt(new Date());
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={8}
        placeholder="Progrès de l'étudiant, points à travailler, vocabulaire abordé..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {savedAt && (
          <span className="text-xs text-slate-400">
            Sauvegardé à {savedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
