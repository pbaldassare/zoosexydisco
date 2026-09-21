-- =====================================================================
-- Storage: bucket e policy
-- Nomi file sempre <uuid>.<ext>. Limiti coerenti con la pipeline media.
-- I bucket privati non hanno policy di lettura: i file si servono solo
-- con URL firmati generati dalle Edge Functions (service role).
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 10485760, array['image/webp', 'image/jpeg', 'image/png']),
  -- unica eccezione ai video privati: il video decorativo della hero dei temi
  ('theme-assets', 'theme-assets', true, 52428800, array['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml', 'video/mp4']),
  ('private-video', 'private-video', false, 52428800, array['video/mp4', 'video/quicktime']),
  ('members-media', 'members-media', false, 52428800, array['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']),
  ('applications', 'applications', false, 8388608, array['image/webp', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- scrittura solo admin su tutti i bucket gestiti dal pannello
create policy storage_admin_select on storage.objects
for select to authenticated
using (bucket_id in ('public-media', 'theme-assets', 'private-video', 'members-media', 'applications') and (select public.is_admin()));

create policy storage_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id in ('public-media', 'theme-assets', 'private-video', 'members-media') and (select public.is_admin()));

create policy storage_admin_update on storage.objects
for update to authenticated
using (bucket_id in ('public-media', 'theme-assets', 'private-video', 'members-media') and (select public.is_admin()))
with check (bucket_id in ('public-media', 'theme-assets', 'private-video', 'members-media') and (select public.is_admin()));

create policy storage_admin_delete on storage.objects
for delete to authenticated
using (bucket_id in ('public-media', 'theme-assets', 'private-video', 'members-media', 'applications') and (select public.is_admin()));

-- Il bucket applications riceve file solo da application-submit (service role):
-- nessuna policy di insert per i client.
