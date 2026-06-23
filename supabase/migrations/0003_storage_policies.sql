-- =====================================================================
-- GaiaMax LMS — Fase 3: politicas de Storage (objetos)
-- course-covers: leitura publica; escrita por instrutor/admin.
-- lesson-materials: privado (download via URL assinada no servidor);
--                   escrita por instrutor/admin.
-- =====================================================================

drop policy if exists "gx_storage_read_covers" on storage.objects;
create policy "gx_storage_read_covers" on storage.objects for select
  using (bucket_id = 'course-covers');

drop policy if exists "gx_storage_insert" on storage.objects;
create policy "gx_storage_insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('course-covers','lesson-materials') and public.current_user_role() in ('instrutor','admin'));

drop policy if exists "gx_storage_update" on storage.objects;
create policy "gx_storage_update" on storage.objects for update to authenticated
  using (bucket_id in ('course-covers','lesson-materials') and public.current_user_role() in ('instrutor','admin'));

drop policy if exists "gx_storage_delete" on storage.objects;
create policy "gx_storage_delete" on storage.objects for delete to authenticated
  using (bucket_id in ('course-covers','lesson-materials') and public.current_user_role() in ('instrutor','admin'));
