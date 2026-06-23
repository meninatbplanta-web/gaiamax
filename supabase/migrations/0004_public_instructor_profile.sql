-- =====================================================================
-- GaiaMax LMS — Fase 5: leitura publica do perfil de instrutores/admin
-- Permite exibir o nome/avatar do autor na pagina publica do curso.
-- =====================================================================
drop policy if exists "perfil_instrutores_publico" on public.profiles;
create policy "perfil_instrutores_publico" on public.profiles for select
  using (role in ('instrutor','admin'));
