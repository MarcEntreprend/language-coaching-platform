-- supabase/migrations/0006_messaging.sql

-- Permet à n'importe quel utilisateur authentifié (ou anonyme) de voir le profil
-- de l'admin (nom + id) — nécessaire pour qu'un student sache à qui écrire.
-- Info non sensible : le coach est une figure publique de son propre business.
create policy "profiles_public_admin_lookup" on public.profiles
  for select using (role = 'admin');

-- Active Supabase Realtime sur la table messages pour la messagerie en direct.
do $$
begin
  execute 'alter publication supabase_realtime add table public.messages';
exception when duplicate_object then
  null;
end $$;