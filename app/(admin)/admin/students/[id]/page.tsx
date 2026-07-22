// app/(admin)/admin/students/[id]/page.tsx
// Détail étudiant (historique + notes de progression)

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentProgressForm from "./StudentProgressForm";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "student")
    .single();

  if (!student) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, session_start, status, student_rating")
    .eq("student_id", id)
    .order("session_start", { ascending: false });

  const { data: progressLogs } = await supabase
    .from("progress_logs")
    .select("id, note, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: false });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-slate-100 text-slate-500",
    no_show: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {student.full_name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.email}</p>
        <div className="flex gap-2 mt-2 text-xs">
          <span className="bg-slate-100 px-2 py-1 rounded-full font-medium text-slate-700">
            Niveau : {student.english_level ?? "—"}
          </span>
          <span className="bg-slate-100 px-2 py-1 rounded-full font-medium text-slate-700">
            {student.timezone}
          </span>
        </div>
        {student.learning_goals && (
          <p className="text-sm text-slate-600 mt-3">
            <span className="font-medium">Objectifs :</span>{" "}
            {student.learning_goals}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Historique des sessions
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {(bookings ?? []).length === 0 ? (
            <p className="text-sm text-slate-500 px-4 py-6">Aucune session.</p>
          ) : (
            (bookings ?? []).map((b) => (
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
                      ★ {b.student_rating}
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

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Notes de progression
        </h2>
        <StudentProgressForm studentId={id} />
        <div className="mt-4 space-y-3">
          {(progressLogs ?? []).map((log) => (
            <div
              key={log.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <p className="text-sm text-slate-800">{log.note}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
