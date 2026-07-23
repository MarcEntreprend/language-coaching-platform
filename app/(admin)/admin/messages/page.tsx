// app/(admin)/admin/messages/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin-guard";

type ConversationMeta = {
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

export default async function AdminMessagesListPage() {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!isAdmin || !user) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500">Non autorisé.</p>
      </div>
    );
  }

  // Récupère les messages récents impliquant l'admin
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, is_read, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(500);

  // syntaxe correcte du Map
  const conversationsMap = new Map<string, ConversationMeta>();

  for (const m of recentMessages ?? []) {
    const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const existing = conversationsMap.get(otherId);

    if (!existing) {
      conversationsMap.set(otherId, {
        lastMessage: m.body,
        lastAt: m.created_at,
        unreadCount: m.recipient_id === user.id && !m.is_read ? 1 : 0,
      });
    } else if (m.recipient_id === user.id && !m.is_read) {
      existing.unreadCount += 1;
    }
  }

  const otherIds = Array.from(conversationsMap.keys());

  const { data: profiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", otherIds)
    : { data: [] as any[] };

  const conversations = otherIds
    .map((id) => {
      const profile = (profiles ?? []).find((p) => p.id === id);
      const meta = conversationsMap.get(id)!;
      return { id, profile, ...meta };
    })
    .sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {conversations.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            Aucune conversation pour l'instant.
          </p>
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              href={`/admin/messages/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {c.profile?.full_name ?? "Étudiant"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {c.lastMessage}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.unreadCount > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {c.unreadCount}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {new Date(c.lastAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
