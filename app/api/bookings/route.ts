// app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { computeAvailableSlots } from "@/lib/utils/availability";
import { sendBookingConfirmationEmail } from "@/lib/email/booking-emails";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const { sessionStart, sessionEnd, promoCode } = body as {
    sessionStart: string;
    sessionEnd: string;
    promoCode: string | null;
  };

  if (!sessionStart || !sessionEnd) {
    return NextResponse.json({ error: "Créneau requis." }, { status: 400 });
  }

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, timezone")
    .eq("id", user.id)
    .single();

  // 1. Re-vérifier côté serveur que le créneau est bien encore disponible
  const { data: availabilityRules } = await supabase
    .from("coach_availability")
    .select("day_of_week, start_time, end_time, timezone")
    .eq("is_active", true);

  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("session_start, session_end, status")
    .gte(
      "session_start",
      new Date(
        new Date(sessionStart).getTime() - 24 * 60 * 60 * 1000,
      ).toISOString(),
    )
    .lte(
      "session_end",
      new Date(
        new Date(sessionEnd).getTime() + 24 * 60 * 60 * 1000,
      ).toISOString(),
    );

  const validSlots = computeAvailableSlots(
    availabilityRules ?? [],
    existingBookings ?? [],
    new Date(sessionStart),
    new Date(sessionEnd),
  );

  const slotIsValid = validSlots.some(
    (s) => s.startUtc === sessionStart && s.endUtc === sessionEnd,
  );

  if (!slotIsValid) {
    return NextResponse.json(
      {
        error: "Ce créneau n'est plus disponible. Merci d'en choisir un autre.",
      },
      { status: 409 },
    );
  }

  // 2. Charger le prix de base depuis store_settings (jamais en dur)
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select("base_session_price_cents, currency")
    .eq("id", 1)
    .single();

  if (settingsError || !settings) {
    return NextResponse.json(
      { error: "Configuration de prix introuvable." },
      { status: 500 },
    );
  }

  const basePriceCents = settings.base_session_price_cents;
  const currency = settings.currency.toLowerCase();
  let priceCents = basePriceCents;
  let promoCodeId: string | null = null;

  // 3. Valider le code promo côté serveur uniquement
  if (promoCode) {
    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (promoError || !promo) {
      return NextResponse.json(
        { error: "Code promo invalide." },
        { status: 400 },
      );
    }

    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json(
        { error: "Ce code promo a expiré." },
        { status: 400 },
      );
    }
    if (promo.max_uses !== null && promo.times_used >= promo.max_uses) {
      return NextResponse.json(
        { error: "Ce code promo a atteint sa limite d'utilisation." },
        { status: 400 },
      );
    }

    if (promo.discount_type === "free") {
      priceCents = 0;
    } else if (promo.discount_type === "percentage") {
      priceCents = Math.round(
        basePriceCents * (1 - promo.discount_value / 100),
      );
    } else if (promo.discount_type === "fixed") {
      priceCents = Math.max(
        0,
        basePriceCents - Math.round(promo.discount_value * 100),
      );
    }

    promoCodeId = promo.id;
  }

  // 4. Créer la réservation — 'confirmed' si gratuite, 'pending' en attente de paiement Stripe
  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      session_start: sessionStart,
      session_end: sessionEnd,
      status: priceCents === 0 ? "confirmed" : "pending",
      promo_code_id: promoCodeId,
      price_paid_cents: priceCents,
      currency: settings.currency,
    })
    .select()
    .single();

  if (insertError || !booking) {
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation." },
      { status: 500 },
    );
  }

  // 5. Incrémenter l'usage du code promo si utilisé
  if (promoCodeId) {
    await supabase.rpc("increment_promo_usage", { promo_id: promoCodeId });
  }

  // 6. Session gratuite : pas de Stripe, confirmée immédiatement + email direct
  if (priceCents === 0) {
    if (user.email) {
      try {
        await sendBookingConfirmationEmail({
          to: user.email,
          studentName: studentProfile?.full_name ?? "",
          sessionStartUtc: sessionStart,
          timezone: studentProfile?.timezone ?? "UTC",
        });
      } catch {
        // Un échec d'envoi ne doit pas faire échouer la réservation elle-même.
      }
    }

    return NextResponse.json({ booking, checkoutUrl: null }, { status: 201 });
  }

  // 7. Session payante : créer une Stripe Checkout Session
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: priceCents,
            product_data: {
              name: "Session de coaching anglais (60 min)",
              description: new Date(sessionStart).toLocaleString(),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
      },
      success_url: `${siteUrl}/dashboard/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/book?cancelled=1`,
    });

    return NextResponse.json(
      { booking, checkoutUrl: checkoutSession.url },
      { status: 201 },
    );
  } catch (stripeError) {
    return NextResponse.json(
      {
        error:
          "Erreur lors de la création du paiement. Réessaie ou contacte le support.",
      },
      { status: 500 },
    );
  }
}
