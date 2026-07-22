// app/(admin)/admin/bookings/[id]/page.tsx
// Détail réservation + éditeur de notes privées

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SessionNotesEditor from "./SessionNotesEditor";
import BookingStatusActions from "./BookingStatusActions";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, profiles(id, full_name, email, english_level, timezone)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Session avec {(booking.profiles as any)?.full_name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date(booking.session_start).toLocaleString()} —{" "}
          {(booking.profiles as any)?.email}
        </p>
      </div>

      <BookingStatusActions
        bookingId={booking.id}
        currentStatus={booking.status}
      />

      {booking.status === "cancelled" && booking.cancellation_reason && (
        <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          Raison de l'annulation : {booking.cancellation_reason}
        </div>
      )}

      {booking.student_rating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Note : {"★".repeat(booking.student_rating)}
          </p>
          {booking.student_feedback && (
            <p className="text-sm text-amber-700 mt-1">
              {booking.student_feedback}
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Notes privées (visibles uniquement par toi)
        </h2>
        <SessionNotesEditor
          bookingId={booking.id}
          initialNotes={booking.session_notes ?? ""}
        />
      </div>
    </div>
  );
}
