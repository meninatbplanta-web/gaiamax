-- =====================================================================
-- GaiaMax LMS — Fase 1: perfis, papeis e RLS
-- Rode este script no Supabase (SQL Editor) uma unica vez.
-- =====================================================================

-- Tipo de papel do usuario
do $$ begin
  create type public.user_role as enum ('aluno', 'instrutor', 'admin');
exception when duplicate_object then null; end $$;

-- Tabela de perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'aluno',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Funcao helper: papel do usuario atual (security definer evita recursao de RLS)
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Politicas RLS
drop policy if exists "perfil_proprio_select" on public.profiles;
create policy "perfil_proprio_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil_proprio_update" on public.profiles;
create policy "perfil_proprio_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "admin_select_todos" on public.profiles;
create policy "admin_select_todos" on public.profiles
  for select using (public.current_user_role() = 'admin');

drop policy if exists "admin_update_todos" on public.profiles;
create policy "admin_update_todos" on public.profiles
  for update using (public.current_user_role() = 'admin');

-- Impede usuario comum de alterar o proprio papel (anti escalonamento)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.current_user_role() <> 'admin' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Cria profile automaticamente ao criar usuario em auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
