// lib/supabase/service-role.ts
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d'environnement.",
  );
}

// Ce client bypass le RLS — à n'utiliser QUE côté serveur, jamais exposé au client,
// et uniquement dans des contextes vérifiés (ex: webhook Stripe avec signature validée).
export const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
