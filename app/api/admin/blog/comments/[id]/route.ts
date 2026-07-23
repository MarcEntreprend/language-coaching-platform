// app/api/admin/blog/comments/[id]/route.ts
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

  const { error } = await supabase
    .from("blog_comments")
    .update({ is_approved: !!body.is_approved })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { error } = await supabase.from("blog_comments").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
