reset role;

-- =========================================================
-- PRIVÉ · Sprint 11 V4 · Parche de edición de imágenes
--
-- Motivo:
-- Supabase Storage requiere SELECT + INSERT + UPDATE cuando
-- se usa upsert para reemplazar un archivo existente.
-- Ya existían INSERT / UPDATE / DELETE para administradores,
-- pero faltaba SELECT. Eso causaba:
-- "new row violates row-level security policy"
-- al editar un perfume y reemplazar/agregar su imagen.
-- =========================================================

drop policy if exists "prive_admin_perfume_images_select"
on storage.objects;

create policy "prive_admin_perfume_images_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'perfume-images'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  )
);

-- Verificación de las cuatro políticas administrativas.
select
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'prive_admin_perfume_images_%'
order by policyname;
