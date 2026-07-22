// app/api/admin/bookings/[id]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await request.json();
  const notes = (body.notes ?? "").toString();

  if (notes.length > 20000) {
    return NextResponse.json(
      { error: "Notes trop longues (max 20000 caractères)." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("bookings")
    .update({ session_notes: notes })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
