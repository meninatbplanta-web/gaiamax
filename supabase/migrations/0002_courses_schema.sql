-- =====================================================================
-- GaiaMax LMS — Fase 2: schema de cursos, conteudo, matriculas,
-- progresso, pagamentos, materiais, aulas ao vivo e suporte + RLS.
-- Rode no Supabase (SQL Editor). Depende da migracao 0001 (profiles).
-- =====================================================================

-- ---------- ENUMS ----------
do $$ begin create type public.course_status as enum ('rascunho','em_revisao','publicado','arquivado'); exception when duplicate_object then null; end $$;
do $$ begin create type public.course_level as enum ('iniciante','intermediario','avancado'); exception when duplicate_object then null; end $$;
do $$ begin create type public.enrollment_status as enum ('ativa','cancelada'); exception when duplicate_object then null; end $$;
do $$ begin create type public.live_platform as enum ('meet','zoom'); exception when duplicate_object then null; end $$;
do $$ begin create type public.support_status as enum ('aberta','resolvida'); exception when duplicate_object then null; end $$;
do $$ begin create type public.material_type as enum ('pdf','imagem','outro'); exception when duplicate_object then null; end $$;

-- ---------- TABELAS ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  subtitle text,
  description text,
  category text,
  cover_url text,
  level public.course_level not null default 'iniciante',
  price_cents integer not null default 0,
  is_free boolean not null default true,
  status public.course_status not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_courses_instructor on public.courses(instructor_id);
create index if not exists idx_courses_status on public.courses(status);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_modules_course on public.modules(course_id);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  vimeo_id text,
  duration_seconds integer,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_lessons_module on public.lessons(module_id);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  name text not null,
  file_path text not null,
  type public.material_type not null default 'outro',
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists idx_materials_lesson on public.materials(lesson_id);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  platform public.live_platform not null default 'meet',
  join_url text not null,
  recording_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_live_course on public.live_sessions(course_id);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'ativa',
  source text not null default 'gratuito',
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists idx_enroll_user on public.enrollments(user_id);
create index if not exists idx_enroll_course on public.enrollments(course_id);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  seconds_watched integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index if not exists idx_progress_user on public.lesson_progress(user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  provider text not null,
  external_id text,
  amount_cents integer,
  status text,
  event text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_user on public.payments(user_id);

create table if not exists public.product_mappings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null,
  external_product_id text not null,
  created_at timestamptz not null default now(),
  unique (provider, external_product_id)
);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  subject text not null,
  status public.support_status not null default 'aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_threads_user on public.support_threads(user_id);
create index if not exists idx_threads_course on public.support_threads(course_id);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_thread on public.support_messages(thread_id);

-- ---------- FUNCOES AUXILIARES (security definer p/ evitar recursao de RLS) ----------
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.owns_course(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.courses c where c.id = cid and c.instructor_id = auth.uid());
$$;

create or replace function public.is_enrolled(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.enrollments e where e.course_id = cid and e.user_id = auth.uid() and e.status = 'ativa');
$$;

create or replace function public.course_is_published(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.courses c where c.id = cid and c.status = 'publicado');
$$;

create or replace function public.can_view_course(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.course_is_published(cid) or public.owns_course(cid) or public.is_admin() or public.is_enrolled(cid);
$$;

create or replace function public.course_of_module(mid uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select course_id from public.modules where id = mid;
$$;

create or replace function public.course_of_lesson(lid uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select m.course_id from public.lessons l join public.modules m on m.id = l.module_id where l.id = lid;
$$;

create or replace function public.can_access_thread(tid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.support_threads t
    where t.id = tid and (t.user_id = auth.uid() or public.owns_course(t.course_id) or public.is_admin())
  );
$$;

-- ---------- RLS ----------
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.live_sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments enable row level security;
alter table public.product_mappings enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

-- courses
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select
  using (status = 'publicado' or instructor_id = auth.uid() or public.is_admin());
drop policy if exists courses_insert on public.courses;
create policy courses_insert on public.courses for insert
  with check ((instructor_id = auth.uid() and public.current_user_role() in ('instrutor','admin')) or public.is_admin());
drop policy if exists courses_update on public.courses;
create policy courses_update on public.courses for update
  using (instructor_id = auth.uid() or public.is_admin())
  with check (instructor_id = auth.uid() or public.is_admin());
drop policy if exists courses_delete on public.courses;
create policy courses_delete on public.courses for delete
  using (instructor_id = auth.uid() or public.is_admin());

-- modules
drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules for select using (public.can_view_course(course_id));
drop policy if exists modules_write on public.modules;
create policy modules_write on public.modules for all
  using (public.owns_course(course_id) or public.is_admin())
  with check (public.owns_course(course_id) or public.is_admin());

-- lessons
drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select using (public.can_view_course(public.course_of_module(module_id)));
drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons for all
  using (public.owns_course(public.course_of_module(module_id)) or public.is_admin())
  with check (public.owns_course(public.course_of_module(module_id)) or public.is_admin());

-- materials (so matriculados/dono/admin)
drop policy if exists materials_select on public.materials;
create policy materials_select on public.materials for select
  using (public.is_enrolled(public.course_of_lesson(lesson_id)) or public.owns_course(public.course_of_lesson(lesson_id)) or public.is_admin());
drop policy if exists materials_write on public.materials;
create policy materials_write on public.materials for all
  using (public.owns_course(public.course_of_lesson(lesson_id)) or public.is_admin())
  with check (public.owns_course(public.course_of_lesson(lesson_id)) or public.is_admin());

-- live_sessions (link so p/ matriculados/dono/admin)
drop policy if exists live_select on public.live_sessions;
create policy live_select on public.live_sessions for select
  using (public.is_enrolled(course_id) or public.owns_course(course_id) or public.is_admin());
drop policy if exists live_write on public.live_sessions;
create policy live_write on public.live_sessions for all
  using (public.owns_course(course_id) or public.is_admin())
  with check (public.owns_course(course_id) or public.is_admin());

-- enrollments
drop policy if exists enroll_select on public.enrollments;
create policy enroll_select on public.enrollments for select
  using (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin());
drop policy if exists enroll_insert on public.enrollments;
create policy enroll_insert on public.enrollments for insert
  with check (
    public.is_admin()
    or (user_id = auth.uid() and exists (select 1 from public.courses c where c.id = course_id and c.is_free and c.status = 'publicado'))
  );
drop policy if exists enroll_update on public.enrollments;
create policy enroll_update on public.enrollments for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists enroll_delete on public.enrollments;
create policy enroll_delete on public.enrollments for delete
  using (user_id = auth.uid() or public.is_admin());

-- lesson_progress
drop policy if exists progress_select on public.lesson_progress;
create policy progress_select on public.lesson_progress for select
  using (user_id = auth.uid() or public.owns_course(public.course_of_lesson(lesson_id)) or public.is_admin());
drop policy if exists progress_upsert on public.lesson_progress;
create policy progress_upsert on public.lesson_progress for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- payments (leitura propria/admin; escrita via service role/webhook que ignora RLS)
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists payments_admin_write on public.payments;
create policy payments_admin_write on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- product_mappings (admin)
drop policy if exists mappings_admin on public.product_mappings;
create policy mappings_admin on public.product_mappings for all
  using (public.is_admin() or public.owns_course(course_id))
  with check (public.is_admin() or public.owns_course(course_id));

-- support_threads
drop policy if exists threads_select on public.support_threads;
create policy threads_select on public.support_threads for select
  using (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin());
drop policy if exists threads_insert on public.support_threads;
create policy threads_insert on public.support_threads for insert
  with check (user_id = auth.uid());
drop policy if exists threads_update on public.support_threads;
create policy threads_update on public.support_threads for update
  using (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin())
  with check (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin());

-- support_messages
drop policy if exists messages_select on public.support_messages;
create policy messages_select on public.support_messages for select
  using (public.can_access_thread(thread_id));
drop policy if exists messages_insert on public.support_messages;
create policy messages_insert on public.support_messages for insert
  with check (sender_id = auth.uid() and public.can_access_thread(thread_id));

-- ---------- TRIGGERS updated_at (reaproveita set_updated_at de 0001) ----------
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
drop trigger if exists threads_set_updated_at on public.support_threads;
create trigger threads_set_updated_at before update on public.support_threads
  for each row execute function public.set_updated_at();
