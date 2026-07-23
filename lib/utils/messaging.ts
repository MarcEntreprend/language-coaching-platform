// lib/utils/messaging.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCoachId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();
  return data?.id ?? null;
}
