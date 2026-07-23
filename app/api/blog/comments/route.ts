// app/api/blog/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const postId = body.postId as string;
  const authorName = (body.authorName ?? "").trim();
  const authorEmail = (body.authorEmail ?? "").trim();
  const text = (body.body ?? "").trim();
  const honeypot = (body.website ?? "").trim(); // champ piège anti-bot

  // Anti-spam basique : un bot remplit généralement tous les champs, y compris
  // les champs cachés destinés uniquement aux bots.
  if (honeypot) {
    return NextResponse.json({ success: true }); // on répond OK sans rien insérer
  }

  if (!postId || !authorName || !authorEmail || !text) {
    return NextResponse.json(
      { error: "Tous les champs sont requis." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(authorEmail)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  if (authorName.length > 100 || text.length > 2000) {
    return NextResponse.json({ error: "Champ trop long." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("id", postId)
    .eq("is_published", true)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: "Article introuvable." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("blog_comments").insert({
    post_id: postId,
    author_name: authorName,
    author_email: authorEmail,
    body: text,
    is_approved: false,
  });

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du commentaire." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Commentaire envoyé, il sera visible après modération.",
    },
    { status: 201 },
  );
}
