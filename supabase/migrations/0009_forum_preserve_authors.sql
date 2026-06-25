-- ============ FORUM: preservar conteudo apos exclusao de conta (LGPD) ============
-- author_id passa a ser anulavel e a FK vira ON DELETE SET NULL.
-- Assim, ao excluir a conta, o perfil some (some o nome) mas topicos/posts
-- permanecem como de "Membro removido".

alter table public.forum_topics alter column author_id drop not null;
alter table public.forum_topics drop constraint if exists forum_topics_author_id_fkey;
alter table public.forum_topics
  add constraint forum_topics_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;

alter table public.forum_posts alter column author_id drop not null;
alter table public.forum_posts drop constraint if exists forum_posts_author_id_fkey;
alter table public.forum_posts
  add constraint forum_posts_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;
