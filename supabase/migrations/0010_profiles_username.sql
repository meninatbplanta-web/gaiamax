-- ============ PERFIS: username (apelido) unico ============

alter table public.profiles add column if not exists username text;

-- Gera um username unico a partir de uma base (nome ou e-mail).
create or replace function public.gen_unique_username(p_base text)
returns text language plpgsql security definer set search_path = public as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(coalesce(p_base, ''), '[^a-zA-Z0-9_]+', '', 'g'));
  if length(base) < 3 then base := base || 'user'; end if;
  base := left(base, 20);
  candidate := base;
  while exists (select 1 from public.profiles where lower(username) = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;
  return candidate;
end;
$$;

-- Backfill dos perfis existentes (base = nome ou parte local do e-mail).
do $$
declare r record;
begin
  for r in
    select p.id, coalesce(nullif(p.full_name, ''), split_part(u.email, '@', 1)) as base
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.username is null
  loop
    update public.profiles set username = public.gen_unique_username(r.base) where id = r.id;
  end loop;
end $$;

-- Unicidade case-insensitive e NOT NULL.
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
alter table public.profiles alter column username set not null;

-- Novo usuario ja nasce com username unico.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  fname text;
begin
  fname := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    fname,
    public.gen_unique_username(coalesce(nullif(fname, ''), split_part(new.email, '@', 1)))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- get_forum_author_names passa a devolver tambem o username.
drop function if exists public.get_forum_author_names(uuid[]);
create or replace function public.get_forum_author_names(p_users uuid[])
returns table(user_id uuid, full_name text, role text, username text)
language sql security definer stable set search_path = public as $$
  select p.id, p.full_name, p.role::text, p.username
  from public.profiles p
  where p.id = any(p_users);
$$;
grant execute on function public.get_forum_author_names(uuid[]) to anon, authenticated;
