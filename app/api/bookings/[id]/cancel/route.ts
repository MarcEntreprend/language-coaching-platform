// app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWithinCancellationWindow } from "@/lib/utils/availability";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, student_id, session_start, status")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { error: "Réservation introuvable." },
      { status: 404 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = booking.student_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    return NextResponse.json(
      { error: "Cette réservation ne peut plus être annulée." },
      { status: 409 },
    );
  }

  // Règle des 24h — l'admin peut forcer, le student non
  if (!isAdmin && !isWithinCancellationWindow(booking.session_start)) {
    return NextResponse.json(
      {
        error: "Annulation impossible : la session commence dans moins de 24h.",
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: body.reason ?? null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Erreur lors de l'annulation." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
