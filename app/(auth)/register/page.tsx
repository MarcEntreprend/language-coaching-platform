// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [englishLevel, setEnglishLevel] = useState("B1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      // Message plus clair pour rate limit
      if (signUpError.message.includes("rate limit")) {
        setError(
          "Trop de tentatives. Attends 1 heure ou utilise un autre email.",
        );
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        timezone,
        english_level: englishLevel,
        role: "student",
      });

      if (profileError) {
        setError("Compte créé mais erreur de profil : " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setEmailSent(true);
  }

  // Si l'email a été envoyé, afficher un message de confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h2 className="text-xl font-semibold text-slate-900">
            Vérifie ta boîte mail
          </h2>
          <p className="text-sm text-slate-500">
            Nous venons d'envoyer un lien de confirmation à <br />
            <span className="font-medium text-slate-900">{email}</span>
          </p>
          <p className="text-xs text-slate-400">
            Clique sur le lien pour activer ton compte.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 text-sm text-slate-900 font-medium hover:underline"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Créer un compte
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commence ton parcours d'anglais parlé.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Nom complet
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Mot de passe
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
            Niveau d'anglais
          </label>
          <select
            value={englishLevel}
            onChange={(e) => setEnglishLevel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p className="text-sm text-center text-slate-500">
          Déjà un compte ?{" "}
          <a href="/login" className="text-slate-900 font-medium">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
