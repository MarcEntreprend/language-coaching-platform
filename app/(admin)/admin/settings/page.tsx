// app/(admin)/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [priceDollars, setPriceDollars] = useState("30.00");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("store_settings")
        .select("base_session_price_cents, currency")
        .eq("id", 1)
        .single();

      if (data) {
        setPriceDollars((data.base_session_price_cents / 100).toFixed(2));
        setCurrency(data.currency);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const cents = Math.round(parseFloat(priceDollars) * 100);

    if (isNaN(cents) || cents < 0) {
      setError("Montant invalide.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseSessionPriceCents: cents, currency }),
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
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tarification</h1>
        <p className="text-sm text-slate-500 mt-1">
          Prix par défaut d'une session (avant code promo).
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Prix</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="text-sm font-medium text-slate-700">
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
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
      )}
    </div>
  );
}
