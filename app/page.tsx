// app/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import JsonLd from "@/components/JsonLd";

const STATS = [
  { value: "500+", label: "Sessions données" },
  { value: "A1 → C2", label: "Tous niveaux accompagnés" },
  { value: "97%", label: "Recommandent le coaching" },
  { value: "24h", label: "Politique d'annulation flexible" },
];

const STEPS = [
  {
    title: "Choisis ton créneau",
    text: "Un calendrier en temps réel affiche mes disponibilités converties dans ton fuseau horaire.",
  },
  {
    title: "On parle, vraiment",
    text: "Chaque session est 100% conversationnelle, adaptée à ton niveau et à tes objectifs concrets.",
  },
  {
    title: "Tu suis tes progrès",
    text: "Notes de session, historique et recommandations personnalisées après chaque appel.",
  },
];

const TESTIMONIALS = [
  {
    initials: "ML",
    name: "Marie-Laure",
    level: "B2 → C1",
    quote:
      "Après huit sessions, je participe enfin aux réunions en anglais sans stresser sur chaque phrase.",
  },
  {
    initials: "RK",
    name: "Rayan",
    level: "A2 → B1",
    quote:
      "Le format 1-on-1 change tout. On corrige mes erreurs en temps réel, pas trois semaines après.",
  },
  {
    initials: "SD",
    name: "Sofia",
    level: "B1 → B2",
    quote:
      "La flexibilité des horaires m'a permis de tenir le rythme malgré un emploi du temps chargé.",
  },
];

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Coaching d'anglais parlé individuel",
  description:
    "Sessions individuelles de coaching conversationnel en anglais, pour tous niveaux (A1 à C2).",
  provider: {
    "@type": "Organization",
    name: "Speak with Marc",
    sameAs: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    }
    checkAuth();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={courseJsonLd} />

      {/* NAV */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Speak with Marc
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#comment-ca-marche" className="hover:text-slate-900">
              Comment ça marche
            </a>
            <a href="#avis" className="hover:text-slate-900">
              Avis
            </a>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Parle anglais avec confiance, pas seulement avec justesse.
        </h1>
        <p className="mt-4 text-base text-slate-500 md:text-lg">
          Sessions individuelles, 100% orales, conçues pour les adultes qui
          veulent progresser vite — entretiens, réunions, voyages, ou simplement
          oser parler.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Réserver un appel découverte
          </Link>
          <a
            href="#comment-ca-marche"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-900 transition-colors"
          >
            Voir comment ça marche
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center"
            >
              <p className="text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold text-slate-900">
            Trois étapes, aucune friction.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="avis" className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold text-slate-900">
            Des résultats qu'on entend, pas juste qu'on lit.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <p className="text-sm leading-relaxed text-slate-600">
                "{t.quote}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.level}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl bg-slate-900 px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Ta première session découverte t'attend.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
            Réserve un créneau, dis-moi ton niveau et tes objectifs — on part de
            là.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-slate-500 md:flex-row">
          <span className="text-sm font-medium text-slate-700">
            Speak with Marc
          </span>
          <div className="flex gap-5">
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Connexion
            </Link>
          </div>
          <span>© {new Date().getFullYear()} — Tous droits réservés</span>
        </div>
      </footer>
    </main>
  );
}
