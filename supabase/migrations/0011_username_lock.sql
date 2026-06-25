-- ============ username fixo: marca se o usuario ja definiu o proprio @ ============
-- Falso = ainda pode escolher uma vez (vale para os @ auto-gerados existentes).
-- Vira true quando o usuario altera o proprio username em /conta.
alter table public.profiles
  add column if not exists username_set boolean not null default false;
