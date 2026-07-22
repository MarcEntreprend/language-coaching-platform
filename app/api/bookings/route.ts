// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/utils/availability";

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

  // 1. Re-vérifier côté serveur que le créneau est bien encore disponible
  //    (protection contre une réservation concurrente / manipulation client)
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

  // 2. Valider le code promo côté serveur uniquement (jamais faire confiance au client
  //    pour le prix final — recalcul obligatoire pour éviter la triche)
  let priceCents = 0; // TODO Phase 3 : remplacer par le prix de base configurable en admin
  const BASE_PRICE_CENTS = 3000; // 30 USD par session — placeholder ajustable en admin (Phase 3)
  priceCents = BASE_PRICE_CENTS;

  let promoCodeId: string | null = null;

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
        BASE_PRICE_CENTS * (1 - promo.discount_value / 100),
      );
    } else if (promo.discount_type === "fixed") {
      priceCents = Math.max(
        0,
        BASE_PRICE_CENTS - Math.round(promo.discount_value * 100),
      );
    }

    promoCodeId = promo.id;
  }

  // 3. Créer la réservation
  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      session_start: sessionStart,
      session_end: sessionEnd,
      status: priceCents === 0 ? "confirmed" : "pending", // 'pending' en attente du paiement Stripe (Phase 3)
      promo_code_id: promoCodeId,
      price_paid_cents: priceCents,
      currency: "USD",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation." },
      { status: 500 },
    );
  }

  // 4. Incrémenter l'usage du code promo si utilisé
  if (promoCodeId) {
    await supabase.rpc("increment_promo_usage", { promo_id: promoCodeId });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
