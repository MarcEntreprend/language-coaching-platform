// app/api/cron/cleanup-pending-bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase/service-role";

const PENDING_TIMEOUT_HOURS = 2;

function isAuthorized(request: NextRequest): boolean {
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const cutoff = new Date(
    Date.now() - PENDING_TIMEOUT_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { data: stale, error } = await supabaseServiceRole
    .from("bookings")
    .select("id, promo_code_id")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des réservations en attente." },
      { status: 500 },
    );
  }

  let cleaned = 0;

  for (const booking of stale ?? []) {
    const { error: updateError, data: updated } = await supabaseServiceRole
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "Paiement non complété dans le délai imparti",
      })
      .eq("id", booking.id)
      .eq("status", "pending") // évite une race condition si le paiement vient d'arriver
      .select()
      .maybeSingle();

    if (updateError || !updated) continue;

    // Libère l'usage du code promo (percentage/fixed) si un avait été appliqué
    if (booking.promo_code_id) {
      await supabaseServiceRole.rpc("decrement_promo_usage", {
        promo_id: booking.promo_code_id,
      });
    }

    cleaned += 1;
  }

  return NextResponse.json({ cleaned, total: (stale ?? []).length });
}
