// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { motion } from "motion/react";
import {
  List,
  X,
  ArrowUpRight,
  ChatCircleDots,
  CalendarCheck,
  Sparkle,
  Star,
  CheckCircle,
} from "@phosphor-icons/react";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const EASE = [0.32, 0.72, 0, 1] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2B211B]/10 bg-[#2B211B]/3 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A5A3B]">
      <Sparkle size={11} weight="fill" />
      {children}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MagneticButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-[#2B211B] text-[#FDFBF7] hover:bg-[#43342a]"
      : "bg-transparent text-[#2B211B] border border-[#2B211B]/15 pr-6 hover:border-[#2B211B]/40";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
      {variant === "primary" && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105">
          <ArrowUpRight size={16} weight="bold" />
        </span>
      )}
    </Link>
  );
}

const STATS = [
  { value: "500+", label: "Sessions données" },
  { value: "A1 → C2", label: "Tous niveaux accompagnés" },
  { value: "97%", label: "Recommandent le coaching" },
  { value: "24h", label: "Politique d'annulation flexible" },
];

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Choisis ton créneau",
    text: "Un calendrier en temps réel affiche mes disponibilités converties dans ton fuseau horaire.",
  },
  {
    icon: ChatCircleDots,
    title: "On parle, vraiment",
    text: "Chaque session est 100% conversationnelle, adaptée à ton niveau et à tes objectifs concrets.",
  },
  {
    icon: CheckCircle,
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

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      className={`${fraunces.variable} ${jakarta.variable} relative min-h-dvh overflow-x-hidden bg-[#FDFBF7] text-[#2B211B]`}
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-225 overflow-hidden"
      >
        <div className="absolute -left-40 -top-30 h-130 w-130 rounded-full bg-[#E8B87A]/30 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-120 w-120 rounded-full bg-[#8FAE8B]/20 blur-[130px]" />
      </div>

      {/* NAV — floating glass island */}
      <div className="sticky top-6 z-40 mx-auto w-[92%] max-w-3xl">
        <nav className="flex items-center justify-between rounded-full border border-[#2B211B]/10 bg-[#FDFBF7]/80 px-5 py-2.5 shadow-[0_8px_30px_rgba(43,33,27,0.08)] backdrop-blur-xl">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Speak with Marc
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[#2B211B]/70 md:flex">
            <a
              href="#comment-ca-marche"
              className="hover:text-[#2B211B] transition-colors"
            >
              Comment ça marche
            </a>
            <a href="#avis" className="hover:text-[#2B211B] transition-colors">
              Avis
            </a>
            <Link
              href="/blog"
              className="hover:text-[#2B211B] transition-colors"
            >
              Blog
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2B211B]/70 hover:text-[#2B211B] transition-colors"
            >
              Connexion
            </Link>
            <MagneticButton href="/register">Commencer</MagneticButton>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            aria-label="Ouvrir le menu"
          >
            <List size={20} />
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-0 z-50 flex flex-col bg-[#FDFBF7]/95 backdrop-blur-3xl md:hidden"
      >
        <div className="flex items-center justify-between px-6 py-6">
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Speak with Marc
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
          {[
            { href: "#comment-ca-marche", label: "Comment ça marche" },
            { href: "#avis", label: "Avis" },
            { href: "/blog", label: "Blog" },
            { href: "/login", label: "Connexion" },
          ].map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 48 }}
              animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
              transition={{
                duration: 0.5,
                delay: menuOpen ? 0.1 + i * 0.06 : 0,
                ease: EASE,
              }}
            >
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-medium"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {item.label}
              </a>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
            transition={{
              duration: 0.5,
              delay: menuOpen ? 0.4 : 0,
              ease: EASE,
            }}
          >
            <MagneticButton href="/register">Commencer</MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* HERO — editorial split */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 pb-24 pt-20 md:flex-row md:pb-32 md:pt-28">
        <div className="flex w-full flex-col items-start gap-6 md:w-1/2">
          <Reveal>
            <Eyebrow>Coaching d'anglais 1-on-1</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="text-[2.75rem] leading-[1.05] tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Parle anglais avec{" "}
              <span className="italic text-[#8A5A3B]">confiance</span>, pas
              seulement avec justesse.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-base leading-relaxed text-[#2B211B]/65">
              Sessions individuelles, 100% orales, conçues pour les adultes qui
              veulent progresser vite — entretiens, réunions, voyages, ou
              simplement oser parler.
            </p>
          </Reveal>
          <Reveal
            delay={0.15}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <MagneticButton href="/register">
              Réserver un appel découverte
            </MagneticButton>
            <MagneticButton href="#comment-ca-marche" variant="ghost">
              Voir comment ça marche
            </MagneticButton>
          </Reveal>
        </div>

        {/* Z-axis cascade cards */}
        <div className="relative w-full md:w-1/2">
          <div className="relative mx-auto h-95 w-full max-w-sm md:h-110">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              className="absolute left-2 top-4 w-[78%] rounded-[1.75rem] border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5 shadow-[0_20px_60px_rgba(43,33,27,0.1)] md:left-0"
            >
              <div className="rounded-[1.375rem] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A5A3B]">
                  Prochaine session
                </p>
                <p
                  className="mt-2 text-lg font-medium"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  Jeudi, 14h30
                </p>
                <p className="mt-1 text-xs text-[#2B211B]/50">
                  Business English — Niveau B2
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="absolute right-0 top-37.5 w-[70%] rounded-[1.75rem] border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5 shadow-[0_20px_60px_rgba(43,33,27,0.1)]"
            >
              <div className="flex items-center gap-3 rounded-[1.375rem] bg-[#2B211B] p-5 text-[#FDFBF7]">
                <ChatCircleDots size={20} weight="light" />
                <div>
                  <p className="text-sm font-medium">"Great progress today!"</p>
                  <p className="text-[11px] text-[#FDFBF7]/50">
                    Note post-session
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              className="absolute bottom-2 left-8 w-[62%] rounded-[1.75rem] border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5 shadow-[0_20px_60px_rgba(43,33,27,0.1)]"
            >
              <div className="flex items-center justify-between rounded-[1.375rem] bg-white p-4">
                <span className="text-xs font-medium text-[#2B211B]/60">
                  Niveau actuel
                </span>
                <span className="rounded-full bg-[#E8B87A]/30 px-2.5 py-1 text-xs font-semibold text-[#8A5A3B]">
                  B2
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS — bento row */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5"
              >
                <div className="flex h-full flex-col justify-between rounded-[1.125rem] bg-white px-5 py-6">
                  <p
                    className="text-2xl font-medium md:text-3xl"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-[#2B211B]/55">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section
        id="comment-ca-marche"
        className="mx-auto max-w-6xl px-6 py-24 md:py-32"
      >
        <Reveal className="max-w-lg">
          <Eyebrow>Le processus</Eyebrow>
          <h2
            className="mt-4 text-3xl leading-tight md:text-4xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Trois étapes, aucune friction.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="h-full rounded-[1.75rem] border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5">
                <div className="flex h-full flex-col gap-4 rounded-[1.375rem] bg-white p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8B87A]/25 text-[#8A5A3B]">
                    <step.icon size={20} weight="light" />
                  </div>
                  <h3
                    className="text-lg font-medium"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#2B211B]/60">
                    {step.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="avis" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="max-w-lg">
          <Eyebrow>Ils ont progressé</Eyebrow>
          <h2
            className="mt-4 text-3xl leading-tight md:text-4xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Des résultats qu'on entend, pas juste qu'on lit.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="h-full rounded-[1.75rem] border border-[#2B211B]/10 bg-[#2B211B]/3 p-1.5">
                <div className="flex h-full flex-col gap-4 rounded-[1.375rem] bg-white p-7">
                  <div className="flex gap-0.5 text-[#E8B87A]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={13} weight="fill" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[#2B211B]/70">
                    "{t.quote}"
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B211B] text-xs font-semibold text-[#FDFBF7]">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-[11px] text-[#2B211B]/45">{t.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2B211B] px-8 py-16 text-center text-[#FDFBF7] md:px-16 md:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-40 -top-32 h-105 w-105 rounded-full bg-[#E8B87A]/20 blur-[110px]"
            />
            <h2
              className="mx-auto max-w-xl text-3xl leading-tight md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Ta première session découverte t'attend.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-[#FDFBF7]/60">
              Réserve un créneau, dis-moi ton niveau et tes objectifs — on part
              de là.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-full bg-[#FDFBF7] py-2 pl-6 pr-2 text-sm font-semibold text-[#2B211B] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98]"
              >
                Commencer maintenant
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B211B]/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105">
                  <ArrowUpRight size={16} weight="bold" />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2B211B]/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[#2B211B]/45 md:flex-row">
          <span
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-sm text-[#2B211B]/70"
          >
            Speak with Marc
          </span>
          <div className="flex gap-6">
            <Link
              href="/blog"
              className="hover:text-[#2B211B]/70 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="hover:text-[#2B211B]/70 transition-colors"
            >
              Connexion
            </Link>
          </div>
          <span>© {new Date().getFullYear()} — Tous droits réservés</span>
        </div>
      </footer>
    </main>
  );
}
