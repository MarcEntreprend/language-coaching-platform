// lib/supabase/public.ts
import { createClient } from "@supabase/supabase-js";

// Client public read-only, sans dépendance aux cookies — utilisable dans
// sitemap.ts, robots.ts, et tout contexte hors requête HTTP classique.
// Le RLS s'applique normalement (clé anon), donc seul le contenu publié est visible.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
