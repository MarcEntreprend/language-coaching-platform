-- supabase/seeds/0001_dev_promo_codes.sql
-- À exécuter uniquement en environnement de dev/sandbox, jamais en prod.

insert into public.promo_codes (code, discount_type, discount_value, max_uses, is_active)
values
  ('WELCOME100', 'free', 0, 50, true),
  ('SAVE20', 'percentage', 20, null, true),
  ('FIRST10', 'fixed', 10, 100, true)
on conflict (code) do nothing;