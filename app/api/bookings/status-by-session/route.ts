// app/api/bookings/status-by-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id requis." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json(
      { error: "Session de paiement introuvable." },
      { status: 404 },
    );
  }

  const bookingId = checkoutSession.metadata?.bookingId;

  if (!bookingId) {
    return NextResponse.json(
      { error: "Réservation introuvable pour cette session." },
      { status: 404 },
    );
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, status, session_start, student_id")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: "Réservation introuvable." },
      { status: 404 },
    );
  }

  if (booking.student_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  return NextResponse.json({
    status: booking.status,
    sessionStart: booking.session_start,
    paymentStatus: checkoutSession.payment_status,
  });
}
