-- ============ FORUM: nomes e selos de autores (em lote, leitura publica) ============
-- A RLS de profiles so expoe instrutor/admin. Estas funcoes security-definer
-- devolvem nome/papel e selos de curso de QUALQUER autor do forum, em lote,
-- sem expor a tabela inteira nem causar N+1.

-- Nome e papel de varios usuarios de uma vez.
create or replace function public.get_forum_author_names(p_users uuid[])
returns table(user_id uuid, full_name text, role text)
language sql security definer stable set search_path = public as $$
  select p.id, p.full_name, p.role::text
  from public.profiles p
  where p.id = any(p_users);
$$;
grant execute on function public.get_forum_author_names(uuid[]) to anon, authenticated;

-- Selos de curso (aluno/instrutor) de varios usuarios de uma vez.
create or replace function public.get_users_course_badges(p_users uuid[])
returns table(user_id uuid, role_context text, course_title text)
language sql security definer stable set search_path = public as $$
  select c.instructor_id, 'instrutor'::text, c.title
  from public.courses c
  where c.instructor_id = any(p_users) and c.status = 'publicado'
  union
  select e.user_id, 'aluno'::text, c.title
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.user_id = any(p_users) and e.status = 'ativa';
$$;
grant execute on function public.get_users_course_badges(uuid[]) to anon, authenticated;
