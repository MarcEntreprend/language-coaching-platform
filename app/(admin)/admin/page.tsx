// app/(admin)/admin/page.tsx

// Note de transparence : le calcul du revenu récupère toutes les lignes price_paid_cents et additionne côté JS. Suffisant pour un volume solo-founder ; si le nombre de bookings devient très élevé, une fonction SQL sum() ou une vue matérialisée serait plus performante — documenté, pas bloquant maintenant.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    { count: totalStudents },
    { count: upcomingSessions },
    { count: pendingBookings },
    { data: revenueRows },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("session_start", now)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("price_paid_cents")
      .in("status", ["confirmed", "completed"]),
    supabase
      .from("bookings")
      .select(
        "id, session_start, status, price_paid_cents, profiles(full_name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const revenueCents = (revenueRows ?? []).reduce(
    (sum, r) => sum + (r.price_paid_cents ?? 0),
    0,
  );

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-slate-100 text-slate-500",
    no_show: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Vue d'ensemble de ton activité
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Étudiants" value={totalStudents ?? 0} />
        <StatCard label="Sessions à venir" value={upcomingSessions ?? 0} />
        <StatCard
          label="En attente de confirmation"
          value={pendingBookings ?? 0}
          highlight={(pendingBookings ?? 0) > 0}
        />
        <StatCard
          label="Revenu total"
          value={`$${(revenueCents / 100).toFixed(2)}`}
        />
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/bookings"
          className="text-sm font-medium bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-800"
        >
          Gérer les réservations
        </Link>
        <Link
          href="/admin/students"
          className="text-sm font-medium bg-white border border-slate-300 rounded-lg px-4 py-2 hover:border-slate-900"
        >
          Voir les étudiants
        </Link>
        <Link
          href="/admin/availability"
          className="text-sm font-medium bg-white border border-slate-300 rounded-lg px-4 py-2 hover:border-slate-900"
        >
          Disponibilités
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Réservations récentes
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {(recentBookings ?? []).length === 0 ? (
            <p className="text-sm text-slate-500 px-4 py-6">
              Aucune réservation pour l'instant.
            </p>
          ) : (
            (recentBookings ?? []).map((b: any) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {b.profiles?.full_name ?? "Étudiant"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(b.session_start).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {b.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${highlight ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
