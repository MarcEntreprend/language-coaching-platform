// app/api/cron/session-reminders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase/service-role";
import { sendSessionReminderEmail } from "@/lib/email/booking-emails";

function isAuthorized(request: NextRequest): boolean {
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(
    now.getTime() + 23 * 60 * 60 * 1000,
  ).toISOString();
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabaseServiceRole
    .from("bookings")
    .select("id, session_start, profiles(full_name, email, timezone)")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("session_start", windowStart)
    .lte("session_start", windowEnd);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des réservations." },
      { status: 500 },
    );
  }

  const results = { sent: 0, failed: 0, total: (bookings ?? []).length };

  for (const booking of bookings ?? []) {
    const profile = booking.profiles as any;

    if (!profile?.email) {
      results.failed += 1;
      continue;
    }

    try {
      await sendSessionReminderEmail({
        to: profile.email,
        studentName: profile.full_name ?? "",
        sessionStartUtc: booking.session_start,
        timezone: profile.timezone ?? "UTC",
      });

      await supabaseServiceRole
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      results.sent += 1;
    } catch {
      results.failed += 1;
    }
  }

  return NextResponse.json(results);
}
