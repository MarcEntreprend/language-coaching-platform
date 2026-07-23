// app/(admin)/admin/messages/[id]/page.tsx

import { requireAdmin } from "@/lib/supabase/admin-guard";
import Link from "next/link";
import { redirect } from "next/navigation";

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender: { full_name: string };
  recipient: { full_name: string };
};

export default async function AdminMessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!isAdmin || !user) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500">Non autorisé.</p>
      </div>
    );
  }

  const studentId = params.id;

  // Récupère tous les messages entre l'admin et l'étudiant
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, is_read, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`sender_id.eq.${studentId},recipient_id.eq.${studentId}`)
    .order("created_at", { ascending: true });

  // Marquer comme lus les messages reçus par l'admin
  const unreadMessages = (messages ?? []).filter(
    (m) => m.recipient_id === user.id && !m.is_read,
  );
  if (unreadMessages.length > 0) {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .in(
        "id",
        unreadMessages.map((m) => m.id),
      );
  }

  // Récupérer le nom de l'étudiant
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", studentId)
    .single();

  const studentName = studentProfile?.full_name ?? "Étudiant";

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/messages"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Conversation avec {studentName}
        </h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-h-125 overflow-y-auto">
        {(messages ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Aucun message.</p>
        ) : (
          (messages ?? []).map((msg) => {
            const isFromAdmin = msg.sender_id === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isFromAdmin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-2 ${
                    isFromAdmin
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm">{msg.body}</p>
                  <p className="text-[10px] opacity-50 mt-1">
                    {new Date(msg.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire d'envoi */}
      <form
        action={async (formData: FormData) => {
          "use server";
          const body = formData.get("body")?.toString().trim();
          if (!body) return;

          const { supabase, user } = await requireAdmin();
          if (!user) return;

          await supabase.from("messages").insert({
            sender_id: user.id,
            recipient_id: studentId,
            body,
            is_read: false,
          });

          redirect(`/admin/messages/${studentId}`);
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          name="body"
          placeholder="Écris ta réponse..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          required
        />
        <button
          type="submit"
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
