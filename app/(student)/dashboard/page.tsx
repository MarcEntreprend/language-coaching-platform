// app/(student)/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, english_level")
    .eq("id", user.id)
    .single();

  const nowIso = new Date().toISOString();

  const { data: upcoming } = await supabase
    .from("bookings")
    .select("id, session_start, status")
    .eq("student_id", user.id)
    .gte("session_start", nowIso)
    .in("status", ["pending", "confirmed"])
    .order("session_start", { ascending: true })
    .limit(5);

  const { data: past } = await supabase
    .from("bookings")
    .select("id, session_start, status, student_rating")
    .eq("student_id", user.id)
    .lt("session_start", nowIso)
    .order("session_start", { ascending: false })
    .limit(5);

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Niveau actuel :{" "}
          <span className="font-medium text-slate-700">
            {profile?.english_level ?? "—"}
          </span>
        </p>
      </div>

      <Link
        href="/dashboard/book"
        className="inline-block rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
      >
        Réserver une session
      </Link>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Prochaines sessions
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {(upcoming ?? []).length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              Aucune session à venir.{" "}
              <Link
                href="/dashboard/book"
                className="text-slate-900 font-medium underline"
              >
                Réserve ton prochain créneau
              </Link>
              .
            </div>
          ) : (
            (upcoming ?? []).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <p className="text-sm text-slate-900">
                  {new Date(b.session_start).toLocaleString()}
                </p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] ?? "bg-slate-100"}`}
                >
                  {b.status === "pending"
                    ? "En attente de paiement"
                    : "Confirmée"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Historique
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {(past ?? []).length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              Pas encore de session passée.
            </p>
          ) : (
            (past ?? []).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <p className="text-sm text-slate-900">
                  {new Date(b.session_start).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  {b.student_rating && (
                    <span className="text-xs text-amber-600 font-medium">
                      {"★".repeat(b.student_rating)}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] ?? "bg-slate-100"}`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
