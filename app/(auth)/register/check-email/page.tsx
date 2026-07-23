// app/(auth)/register/check-email/page.tsx
import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-7 w-7 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Vérifie ta boîte mail
        </h1>
        <p className="text-sm text-slate-500">
          On vient de t'envoyer un lien de confirmation. Clique dessus pour
          activer ton compte.
        </p>
        <p className="text-xs text-slate-400">
          Rien reçu ? Vérifie tes spams, ou{" "}
          <Link
            href="/register"
            className="text-slate-900 font-medium underline"
          >
            réessaie l'inscription
          </Link>
          .
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
