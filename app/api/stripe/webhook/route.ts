// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { supabaseServiceRole } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
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
    return NextResponse.json(
      { error: `Webhook signature invalide: ${message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId manquant dans les metadata." },
        { status: 400 },
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    // Idempotence : si ce payment_intent a déjà été enregistré, on ne double-traite pas
    const { data: existingPayment } = await supabaseServiceRole
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    const { error: bookingUpdateError } = await supabaseServiceRole
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      return NextResponse.json(
        { error: "Erreur mise à jour réservation." },
        { status: 500 },
      );
    }

    const { error: paymentInsertError } = await supabaseServiceRole
      .from("payments")
      .insert({
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toUpperCase(),
        status: "succeeded",
      });

    if (paymentInsertError) {
      return NextResponse.json(
        { error: "Erreur enregistrement paiement." },
        { status: 500 },
      );
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await supabaseServiceRole
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: "Paiement Stripe expiré / abandonné",
        })
        .eq("id", bookingId)
        .eq("status", "pending"); // ne touche pas une réservation déjà confirmée par ailleurs
    }
  }

  return NextResponse.json({ received: true });
}

// Next.js App Router lit le body en texte brut par défaut pour les Route Handlers,
// donc pas de config bodyParser à désactiver ici (contrairement au Pages Router).
