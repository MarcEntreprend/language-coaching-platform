// app/(admin)/admin/availability/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; //  Import de l'instance

type AvailabilityRule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
};

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export default function AdminAvailabilityPage() {

  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  async function loadRules() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("coach_availability")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRules(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (startTime >= endTime) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    const { error: insertError } = await supabase
      .from("coach_availability")
      .insert({
        day_of_week: dayOfWeek,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        timezone,
        is_active: true,
      });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await loadRules();
  }

  async function toggleActive(rule: AvailabilityRule) {
    await supabase
      .from("coach_availability")
      .update({ is_active: !rule.is_active })
      .eq("id", rule.id);
    await loadRules();
  }

  async function deleteRule(id: string) {
    await supabase.from("coach_availability").delete().eq("id", id);
    await loadRules();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Disponibilités récurrentes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Définis tes créneaux hebdomadaires. Fuseau actuel :{" "}
          <span className="font-medium">{timezone}</span>
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAddRule}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Jour</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Début</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          Ajouter ce créneau
        </button>
      </form>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune disponibilité définie.
          </p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <div>
                <span className="font-medium text-slate-900">
                  {DAYS[rule.day_of_week]}
                </span>
                <span className="text-slate-500 ml-2">
                  {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)} (
                  {rule.timezone})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(rule)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    rule.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {rule.is_active ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
