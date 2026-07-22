// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/utils/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rangeStart = searchParams.get("start");
  const rangeEnd = searchParams.get("end");

  if (!rangeStart || !rangeEnd) {
    return NextResponse.json(
      { error: "Paramètres start et end requis." },
      { status: 400 },
    );
  }

  const rangeStartDate = new Date(rangeStart);
  const rangeEndDate = new Date(rangeEnd);

  // Limite de sécurité : max 60 jours par requête pour éviter l'abus
  const maxRangeMs = 60 * 24 * 60 * 60 * 1000;
  if (rangeEndDate.getTime() - rangeStartDate.getTime() > maxRangeMs) {
    return NextResponse.json(
      { error: "Plage de dates trop large (max 60 jours)." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: availabilityRules, error: availError } = await supabase
    .from("coach_availability")
    .select("day_of_week, start_time, end_time, timezone")
    .eq("is_active", true);

  if (availError) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des disponibilités." },
      { status: 500 },
    );
  }

  const { data: existingBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("session_start, session_end, status")
    .gte("session_start", rangeStartDate.toISOString())
    .lte("session_end", rangeEndDate.toISOString());

  if (bookingsError) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des réservations." },
      { status: 500 },
    );
  }

  const slots = computeAvailableSlots(
    availabilityRules ?? [],
    existingBookings ?? [],
    rangeStartDate,
    rangeEndDate,
  );

  return NextResponse.json({ slots });
}
