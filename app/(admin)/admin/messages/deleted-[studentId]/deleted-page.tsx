// app/(admin)/admin/messages/[studentId]/page.tsx
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import MessageThread from "@/components/MessageThread";

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!isAdmin || !user) notFound();

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${studentId}),and(sender_id.eq.${studentId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        {student.full_name}
      </h1>
      <MessageThread
        currentUserId={user.id}
        otherUserId={studentId}
        initialMessages={messages ?? []}
        recipientLabel={student.full_name}
      />
    </div>
  );
}
