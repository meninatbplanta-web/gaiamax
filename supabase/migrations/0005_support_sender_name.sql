-- =====================================================================
-- GaiaMax LMS — Fase 8: nome do autor desnormalizado nas mensagens de suporte
-- (evita leitura cruzada de perfis entre aluno e instrutor).
-- =====================================================================
alter table public.support_messages add column if not exists sender_name text;
