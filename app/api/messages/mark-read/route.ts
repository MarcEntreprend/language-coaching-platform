// app/api/messages/mark-read/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const otherUserId = body.otherUserId as string;

  if (!otherUserId) {
    return NextResponse.json({ error: "otherUserId requis." }, { status: 400 });
  }

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherUserId)
    .eq("is_read", false);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
