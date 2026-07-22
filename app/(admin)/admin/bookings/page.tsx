// app/(admin)/admin/bookings/page.tsx
// Gestion des réservations (liste + filtres + actions)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type BookingRow = {
  id: string;
  session_start: string;
  status: string;
  price_paid_cents: number;
  profiles: { full_name: string; email: string } | null;
};

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
};

export default function AdminBookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select(
        "id, session_start, status, price_paid_cents, profiles(full_name, email)",
      )
      .order("session_start", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setBookings((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setActionError(null);
    const res = await fetch(`/api/admin/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const json = await res.json();
      setActionError(json.error ?? "Erreur.");
      return;
    }

    await loadBookings();
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Réservations</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Tous les statuts" : s}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {loading ? (
          <p className="text-sm text-slate-500 px-4 py-6">Chargement...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-slate-500 px-4 py-6">
            Aucune réservation.
          </p>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-4 py-3 gap-4"
            >
              <Link href={`/admin/bookings/${b.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {b.profiles?.full_name ?? "Étudiant supprimé"}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(b.session_start).toLocaleString()} · $
                  {(b.price_paid_cents / 100).toFixed(2)}
                </p>
              </Link>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColors[b.status] ?? "bg-slate-100"}`}
              >
                {b.status}
              </span>

              <div className="flex gap-1 shrink-0">
                {b.status === "pending" && (
                  <button
                    onClick={() => updateStatus(b.id, "confirmed")}
                    className="text-xs bg-blue-600 text-white rounded-md px-2.5 py-1.5 hover:bg-blue-700"
                  >
                    Confirmer
                  </button>
                )}
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button
                    onClick={() => updateStatus(b.id, "completed")}
                    className="text-xs bg-green-600 text-white rounded-md px-2.5 py-1.5 hover:bg-green-700"
                  >
                    Terminée
                  </button>
                )}
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button
                    onClick={() => updateStatus(b.id, "cancelled")}
                    className="text-xs bg-white border border-slate-300 text-slate-700 rounded-md px-2.5 py-1.5 hover:border-red-400 hover:text-red-600"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
