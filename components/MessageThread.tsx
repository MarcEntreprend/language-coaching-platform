// components/MessageThread.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

export default function MessageThread({
  currentUserId,
  otherUserId,
  initialMessages,
  recipientLabel,
}: {
  currentUserId: string;
  otherUserId: string;
  initialMessages: MessageRow[];
  recipientLabel: string;
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Marquer comme lu à l'ouverture du fil
  useEffect(() => {
    fetch("/api/messages/mark-read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId }),
    });
  }, [otherUserId]);

  // Réception en direct des nouveaux messages de l'autre personne
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${currentUserId}-${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const incoming = payload.new as MessageRow;
          if (incoming.sender_id !== otherUserId) return; // scope au bon fil

          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );

          fetch("/api/messages/mark-read", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otherUserId }),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, recipientId: otherUserId }),
    });

    const json = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de l'envoi.");
      return;
    }

    setMessages((prev) => [...prev, json.message]);
    setDraft("");
  }

  return (
    <div className="flex h-150 flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-medium text-slate-900">{recipientLabel}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-8">
            Aucun message pour l'instant. Écris le premier !
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    isMine
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {m.body}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${isMine ? "text-slate-300" : "text-slate-400"}`}
                  >
                    {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false, // force le 24h
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="px-4 pb-2 text-xs text-red-600">{error}</div>}

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écris un message..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          maxLength={4000}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
