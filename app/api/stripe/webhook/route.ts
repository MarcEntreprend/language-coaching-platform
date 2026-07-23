// app/api/stripe/webhook/route.ts
// TODO: correction auto-confirmation du paiement (pending → confirmed)

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { supabaseServiceRole } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: Signature manquante");
    return NextResponse.json(
      { error: "Signature manquante." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide.";
    console.error("Webhook: Signature invalide", message);
    return NextResponse.json(
      { error: `Webhook signature invalide: ${message}` },
      { status: 400 },
    );
  }

  console.log(`Webhook: Événement reçu: ${event.type}`);

  // ============================================================
  // CHECKOUT SESSION COMPLETED
  // ============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error(
        "Webhook: bookingId manquant dans les metadata",
        session.id,
      );
      return NextResponse.json(
        { error: "bookingId manquant dans les metadata." },
        { status: 400 },
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    console.log(
      `Webhook: Session ${session.id} pour booking ${bookingId}, payment_intent: ${paymentIntentId}`,
    );

    // Vérifier si le paiement a déjà été traité (idempotence)
    const { data: existingPayment } = await supabaseServiceRole
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (existingPayment) {
      console.log(
        `Webhook: Paiement déjà traité pour ${paymentIntentId}, ignoré.`,
      );
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // Vérifier que le booking existe et est encore en statut pending
    const { data: booking, error: fetchError } = await supabaseServiceRole
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error(`Webhook: Booking ${bookingId} introuvable.`, fetchError);
      return NextResponse.json(
        { error: "Réservation introuvable." },
        { status: 404 },
      );
    }

    if (booking.status !== "pending") {
      console.log(
        `Webhook: Booking ${bookingId} déjà ${booking.status}, pas de mise à jour.`,
      );
      return NextResponse.json({ received: true, status: booking.status });
    }

    // ✅ Mettre à jour le statut en 'confirmed'
    const { error: bookingUpdateError } = await supabaseServiceRole
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_session_id: session.id, // traçabilité
      })
      .eq("id", bookingId)
      .eq("status", "pending"); // sécurité : ne pas écraser un statut non-pending

    if (bookingUpdateError) {
      console.error(
        `Webhook: Erreur mise à jour booking ${bookingId}`,
        bookingUpdateError,
      );
      return NextResponse.json(
        { error: "Erreur mise à jour réservation." },
        { status: 500 },
      );
    }

    console.log(`Webhook: Booking ${bookingId} passé à confirmed ✅`);

    // Enregistrer le paiement
    const { error: paymentInsertError } = await supabaseServiceRole
      .from("payments")
      .insert({
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "USD").toUpperCase(),
        status: "succeeded",
      });

    if (paymentInsertError) {
      console.error(
        `Webhook: Erreur enregistrement paiement`,
        paymentInsertError,
      );
      // On ne retourne pas 500 car le booking est déjà confirmé
      // On log uniquement
    } else {
      console.log(`Webhook: Paiement enregistré pour booking ${bookingId}`);
    }

    return NextResponse.json({
      received: true,
      bookingId,
      status: "confirmed",
    });
  }

  // ============================================================
  // CHECKOUT SESSION EXPIRED
  // ============================================================
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const { error: updateError } = await supabaseServiceRole
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: "Paiement Stripe expiré / abandonné",
        })
        .eq("id", bookingId)
        .eq("status", "pending");

      if (updateError) {
        console.error(
          `Webhook: Erreur annulation booking ${bookingId}`,
          updateError,
        );
      } else {
        console.log(`Webhook: Booking ${bookingId} annulé (session expirée)`);
      }
    } else {
      console.warn("Webhook: session.expired sans bookingId", session.id);
    }

    return NextResponse.json({ received: true });
  }

  // ============================================================
  // AUTRES ÉVÉNEMENTS (ignorés)
  // ============================================================
  console.log(`Webhook: Événement non traité: ${event.type}`);
  return NextResponse.json({ received: true });
}
