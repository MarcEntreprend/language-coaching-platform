// components/CommentForm.tsx
"use client";

import { useState } from "react";

export default function CommentForm({ postId }: { postId: string }) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, doit rester vide
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/blog/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName,
        authorEmail,
        body: text,
        website,
      }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de l'envoi.");
      setStatus("error");
      return;
    }

    setStatus("success");
    setAuthorName("");
    setAuthorEmail("");
    setText("");
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        Merci ! Ton commentaire a bien été envoyé et sera visible après
        modération.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Honeypot — invisible pour un humain, souvent rempli par les bots */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px]"
        aria-hidden="true"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Ton nom"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          placeholder="Ton email (non publié)"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        required
        rows={3}
        placeholder="Ton commentaire..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? "Envoi..." : "Publier le commentaire"}
      </button>
    </form>
  );
}
