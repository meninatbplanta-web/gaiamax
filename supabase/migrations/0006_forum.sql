-- ============ FORUM (aberto, leitura publica, escrita logada) ============

create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_forum_topics_cat on public.forum_topics(category_id);
create index if not exists idx_forum_topics_author on public.forum_topics(author_id);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_forum_posts_topic on public.forum_posts(topic_id);
create index if not exists idx_forum_posts_author on public.forum_posts(author_id);

-- ---------- FUNCOES AUXILIARES ----------
-- Topico esta trancado? (default true se nao existir, para bloquear insercao orfa)
create or replace function public.forum_topic_locked(tid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_locked from public.forum_topics where id = tid), true);
$$;

-- Selos de curso de um usuario para exibir no forum (leitura publica).
-- Instrutor: cursos publicados que leciona. Aluno: cursos com matricula ativa.
create or replace function public.get_user_course_badges(p_user uuid)
returns table(role_context text, course_title text)
language sql security definer stable set search_path = public as $$
  select 'instrutor'::text as role_context, c.title as course_title
  from public.courses c
  where c.instructor_id = p_user and c.status = 'publicado'
  union
  select 'aluno'::text, c.title
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.user_id = p_user and e.status = 'ativa';
$$;
grant execute on function public.get_user_course_badges(uuid) to anon, authenticated;

-- Atualiza a ultima atividade do topico a cada nova resposta (definer p/ ignorar RLS).
create or replace function public.forum_bump_topic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.forum_topics set updated_at = now() where id = new.topic_id;
  return new;
end;
$$;
drop trigger if exists trg_forum_bump on public.forum_posts;
create trigger trg_forum_bump after insert on public.forum_posts
  for each row execute function public.forum_bump_topic();

-- ---------- RLS ----------
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;

-- Categorias: leitura publica; gestao apenas admin
drop policy if exists forum_cat_select on public.forum_categories;
create policy forum_cat_select on public.forum_categories for select using (true);
drop policy if exists forum_cat_admin on public.forum_categories;
create policy forum_cat_admin on public.forum_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- Topicos: leitura publica; criar logado (autor = si); editar/excluir proprio ou admin
drop policy if exists forum_topic_select on public.forum_topics;
create policy forum_topic_select on public.forum_topics for select using (true);
drop policy if exists forum_topic_insert on public.forum_topics;
create policy forum_topic_insert on public.forum_topics for insert
  with check (auth.uid() = author_id);
drop policy if exists forum_topic_update on public.forum_topics;
create policy forum_topic_update on public.forum_topics for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());
drop policy if exists forum_topic_delete on public.forum_topics;
create policy forum_topic_delete on public.forum_topics for delete
  using (auth.uid() = author_id or public.is_admin());

-- Posts: leitura publica; criar logado em topico nao trancado (admin sempre); editar/excluir proprio ou admin
drop policy if exists forum_post_select on public.forum_posts;
create policy forum_post_select on public.forum_posts for select using (true);
drop policy if exists forum_post_insert on public.forum_posts;
create policy forum_post_insert on public.forum_posts for insert
  with check (auth.uid() = author_id and (public.is_admin() or not public.forum_topic_locked(topic_id)));
drop policy if exists forum_post_update on public.forum_posts;
create policy forum_post_update on public.forum_posts for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());
drop policy if exists forum_post_delete on public.forum_posts;
create policy forum_post_delete on public.forum_posts for delete
  using (auth.uid() = author_id or public.is_admin());

-- ---------- SEED de categorias iniciais ----------
insert into public.forum_categories (name, slug, description, position) values
  ('Geral', 'geral', 'Conversas gerais da comunidade GaiaMax.', 1),
  ('Dúvidas', 'duvidas', 'Tire dúvidas com a comunidade.', 2),
  ('Mesa Radiônica', 'mesa-radionica', 'Discussões sobre mesa radiônica.', 3),
  ('Limpeza Energética', 'limpeza-energetica', 'Técnicas e trocas sobre limpeza energética.', 4),
  ('Defesa Psíquica', 'defesa-psiquica', 'Proteção e defesa psíquica.', 5)
on conflict (slug) do nothing;
