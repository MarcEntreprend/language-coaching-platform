// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function PATCH(request: NextRequest) {
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await request.json();
  const { baseSessionPriceCents, currency } = body as {
    baseSessionPriceCents: number;
    currency: string;
  };

  if (!Number.isInteger(baseSessionPriceCents) || baseSessionPriceCents < 0) {
    return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
  }

  const { error } = await supabase
    .from("store_settings")
    .update({
      base_session_price_cents: baseSessionPriceCents,
      currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
