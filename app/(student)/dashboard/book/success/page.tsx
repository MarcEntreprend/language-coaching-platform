// app/(student)/dashboard/book/success/page.tsx
import Link from "next/link";

export default function BookingSuccessPage() {
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
        Ta session est réservée. Un email de confirmation te sera envoyé sous
        peu.
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
