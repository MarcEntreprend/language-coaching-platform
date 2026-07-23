// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCoachId } from "@/lib/utils/messaging";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const text = (body.body ?? "").trim();
  const bookingId = body.bookingId || null;

  if (!text) {
    return NextResponse.json(
      { error: "Le message ne peut pas être vide." },
      { status: 400 },
    );
  }

  if (text.length > 4000) {
    return NextResponse.json(
      { error: "Message trop long (max 4000 caractères)." },
      { status: 400 },
    );
  }

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let recipientId: string | null;

  if (senderProfile?.role === "admin") {
    // L'admin doit préciser explicitement à quel étudiant il répond
    recipientId = body.recipientId || null;
    if (!recipientId) {
      return NextResponse.json(
        { error: "Destinataire requis." },
        { status: 400 },
      );
    }
  } else {
    // Un student ne peut écrire qu'au coach — on ignore toute valeur envoyée par
    // le client pour recipientId et on force la vraie valeur côté serveur.
    recipientId = await getCoachId(supabase);
    if (!recipientId) {
      return NextResponse.json(
        { error: "Coach introuvable." },
        { status: 500 },
      );
    }
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      booking_id: bookingId,
      body: text,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
