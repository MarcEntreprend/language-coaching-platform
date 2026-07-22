// Liste des étudiants
// app/(admin)/admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  full_name: string;
  email: string;
  english_level: string | null;
  timezone: string;
  created_at: string;
};

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, english_level, timezone, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });
      setStudents(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Étudiants</h1>
        <input
          placeholder="Rechercher un nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-64"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {loading ? (
          <p className="text-sm text-slate-500 px-4 py-6">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 px-4 py-6">
            Aucun étudiant trouvé.
          </p>
        ) : (
          filtered.map((s) => (
            <Link
              key={s.id}
              href={`/admin/students/${s.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {s.full_name}
                </p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded-full font-medium text-slate-700">
                  {s.english_level ?? "—"}
                </span>
                <span>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
