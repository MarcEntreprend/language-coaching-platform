// app/(student)/dashboard/messages/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoachId } from "@/lib/utils/messaging";
import MessageThread from "@/components/MessageThread";

export default async function StudentMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const coachId = await getCoachId(supabase);

  if (!coachId) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <p className="text-sm text-slate-500">
          Messagerie temporairement indisponible.
        </p>
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${coachId}),and(sender_id.eq.${coachId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Messages</h1>
      <MessageThread
        currentUserId={user.id}
        otherUserId={coachId}
        initialMessages={messages ?? []}
        recipientLabel="Marc (coach)"
      />
    </div>
  );
}
