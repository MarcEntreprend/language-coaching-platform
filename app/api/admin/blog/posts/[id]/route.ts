// app/api/admin/blog/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { slugify } from "@/lib/utils/slugify";

async function ensureUniqueSlug(
  supabase: any,
  baseSlug: string,
  excludeId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, slug")
    .like("slug", `${baseSlug}%`);

  const takenSlugs = new Set(
    (existing ?? [])
      .filter((row: any) => row.id !== excludeId)
      .map((row: any) => row.slug),
  );
  if (!takenSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  while (takenSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

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

  const { data: current } = await supabase
    .from("blog_posts")
    .select("slug, is_published")
    .eq("id", id)
    .single();

  if (!current) {
    return NextResponse.json(
      { error: "Article introuvable." },
      { status: 404 },
    );
  }

  const updatePayload: Record<string, any> = {};

  // Toggle publish rapide (depuis la liste) — payload minimal
  if (Object.keys(body).length === 1 && "is_published" in body) {
    updatePayload.is_published = !!body.is_published;
    if (body.is_published && !current.is_published) {
      updatePayload.published_at = new Date().toISOString();
    }
  } else {
    // Édition complète depuis le formulaire
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Titre et contenu requis." },
        { status: 400 },
      );
    }

    let slug = current.slug;
    const requestedSlug = slugify(body.slug || body.title);
    if (requestedSlug !== current.slug) {
      slug = await ensureUniqueSlug(supabase, requestedSlug, id);
    }

    updatePayload.title = body.title.trim();
    updatePayload.slug = slug;
    updatePayload.excerpt = body.excerpt || null;
    updatePayload.content = body.content.trim();
    updatePayload.category_id = body.category_id || null;
    updatePayload.meta_title = body.meta_title || null;
    updatePayload.meta_description = body.meta_description || null;
    updatePayload.og_image_url = body.og_image_url || null;
    updatePayload.cover_image_url = body.cover_image_url || null;
    updatePayload.is_published = !!body.is_published;
    if (body.is_published && !current.is_published) {
      updatePayload.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(updatePayload)
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

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
