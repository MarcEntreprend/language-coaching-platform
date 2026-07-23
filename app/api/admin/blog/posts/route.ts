// app/api/admin/blog/posts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { slugify } from "@/lib/utils/slugify";

async function ensureUniqueSlug(
  supabase: any,
  baseSlug: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  const takenSlugs = new Set((existing ?? []).map((row: any) => row.slug));
  if (!takenSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  while (takenSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

export async function POST(request: NextRequest) {
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await request.json();
  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Titre et contenu requis." },
      { status: 400 },
    );
  }

  const baseSlug = slugify(body.slug || title);
  const slug = await ensureUniqueSlug(supabase, baseSlug);

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug,
      excerpt: body.excerpt || null,
      content,
      category_id: body.category_id || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      og_image_url: body.og_image_url || null,
      cover_image_url: body.cover_image_url || null,
      is_published: !!body.is_published,
      published_at: body.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'article." },
      { status: 500 },
    );
  }

  return NextResponse.json({ post }, { status: 201 });
}
