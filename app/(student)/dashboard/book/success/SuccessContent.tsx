// app/(student)/dashboard/book/success/SuccessContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PollStatus = "checking" | "confirmed" | "pending" | "error";

const MAX_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 2000;

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<PollStatus>("checking");
  const [sessionStart, setSessionStart] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    async function poll(attempt: number) {
      try {
        const res = await fetch(
          `/api/bookings/status-by-session?session_id=${sessionId}`,
        );
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }

        setSessionStart(json.sessionStart);

        if (json.status === "confirmed" || json.status === "completed") {
          setStatus("confirmed");
          return;
        }

        if (json.status === "cancelled") {
          setStatus("error");
          return;
        }

        // Toujours 'pending' — le webhook n'est pas encore passé
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
        } else {
          setStatus("pending");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    poll(1);

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (status === "checking") {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="mt-6 text-sm text-slate-500">
          Vérification du paiement...
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <svg
            className="h-7 w-7 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Traitement en cours...
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ton paiement est en cours de confirmation. Ça prend parfois quelques
          minutes de plus — tu recevras un email dès que ta session sera
          confirmée.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-7 w-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Un problème est survenu
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Impossible de confirmer ta réservation automatiquement. Contacte le
          support si le montant a bien été débité.
        </p>
        <Link
          href="/dashboard/book"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Retour à la réservation
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-7 w-7 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-slate-900">
        Paiement confirmé
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {sessionStart
          ? `Ta session du ${new Date(sessionStart).toLocaleString()} est réservée.`
          : "Ta session est réservée."}{" "}
        Un email de confirmation te sera envoyé sous peu.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
