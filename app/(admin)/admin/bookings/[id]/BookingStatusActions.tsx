// app/(admin)/admin/bookings/[id]/BookingStatusActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  {
    value: "confirmed",
    label: "Confirmer",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    value: "completed",
    label: "Marquer terminée",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    value: "no_show",
    label: "Absence (no-show)",
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    value: "cancelled",
    label: "Annuler",
    color: "bg-slate-600 hover:bg-slate-700",
  },
];

export default function BookingStatusActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(status: string) {
    setUpdating(true);
    setError(null);

    const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setUpdating(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erreur.");
      return;
    }

    router.refresh();
  }

  if (currentStatus === "cancelled" || currentStatus === "completed") {
    return (
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
        Statut final : {currentStatus}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.filter((opt) => opt.value !== currentStatus).map(
          (opt) => (
            <button
              key={opt.value}
              onClick={() => handleUpdate(opt.value)}
              disabled={updating}
              className={`text-sm text-white rounded-lg px-3 py-1.5 disabled:opacity-50 ${opt.color}`}
            >
              {opt.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
