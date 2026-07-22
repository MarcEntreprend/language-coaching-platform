// app/api/admin/students/[id]/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await request.json();
  const note = (body.note ?? "").trim();

  if (!note) {
    return NextResponse.json(
      { error: "La note ne peut pas être vide." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("progress_logs").insert({
    student_id: studentId,
    note,
  });

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la note." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
