// app/(auth)/reset-password/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Si code est présent, on l'utilise pour confirmer la session
  useEffect(() => {
    if (code) {
      supabase.auth.exchangeCodeForSession(code);
    }
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Rediriger vers login après 3 secondes
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          Nouveau mot de passe
        </h1>

        {success ? (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Mot de passe mis à jour avec succès ! Redirection...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
