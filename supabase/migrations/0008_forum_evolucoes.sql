-- ============ FORUM: evolucoes (curtidas e denuncias) ============

-- Curtidas: uma por usuario por post.
create table if not exists public.forum_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists idx_forum_reactions_post on public.forum_reactions(post_id);

alter table public.forum_reactions enable row level security;
drop policy if exists forum_react_select on public.forum_reactions;
create policy forum_react_select on public.forum_reactions for select using (true);
drop policy if exists forum_react_insert on public.forum_reactions;
create policy forum_react_insert on public.forum_reactions for insert
  with check (auth.uid() = user_id);
drop policy if exists forum_react_delete on public.forum_reactions;
create policy forum_react_delete on public.forum_reactions for delete
  using (auth.uid() = user_id);

-- Denuncias: usuario denuncia um post; admin modera.
create table if not exists public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text,
  status text not null default 'aberta',
  created_at timestamptz not null default now()
);
create index if not exists idx_forum_reports_status on public.forum_reports(status);

alter table public.forum_reports enable row level security;
-- Inserir: qualquer usuario logado (denunciando como ele mesmo).
drop policy if exists forum_report_insert on public.forum_reports;
create policy forum_report_insert on public.forum_reports for insert
  with check (auth.uid() = reporter_id);
-- Ver/gerir: somente admin.
drop policy if exists forum_report_admin on public.forum_reports;
create policy forum_report_admin on public.forum_reports for all
  using (public.is_admin()) with check (public.is_admin());
