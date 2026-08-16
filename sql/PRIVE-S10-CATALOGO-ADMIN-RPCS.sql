reset role;

-- PRIVÉ Sprint 10 · Catálogo administrativo
-- Ejecutar después de los RPC admin_create_perfume, admin_update_perfume y admin_set_perfume_availability ya instalados.

create or replace function public.admin_get_catalog_perfumes()
returns table (
  id uuid,
  name text,
  designer text,
  category text,
  code text,
  image_url text,
  image_storage_path text,
  active boolean,
  availability_status public.perfume_availability_status,
  profile_status public.perfume_profile_status,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  return query
  select
    p.id,
    p.name,
    p.designer,
    p.category,
    pk.code,
    p.image_url,
    p.image_storage_path,
    p.active,
    p.availability_status,
    p.profile_status,
    p.created_at,
    p.updated_at
  from public.perfumes p
  join public.perfume_keys pk on pk.perfume_id = p.id
  order by p.designer nulls last, p.name;
end;
$$;

revoke all on function public.admin_get_catalog_perfumes() from public;
grant execute on function public.admin_get_catalog_perfumes() to authenticated;

create or replace function public.admin_set_perfume_image(
  p_perfume_id uuid,
  p_image_url text,
  p_image_storage_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  if not exists (select 1 from public.perfumes p where p.id = p_perfume_id) then
    raise exception 'Perfume no encontrado';
  end if;

  update public.perfumes
  set image_url = nullif(btrim(coalesce(p_image_url,'')),''),
      image_storage_path = nullif(btrim(coalesce(p_image_storage_path,'')),''),
      updated_at = now()
  where id = p_perfume_id;
end;
$$;

revoke all on function public.admin_set_perfume_image(uuid,text,text) from public;
grant execute on function public.admin_set_perfume_image(uuid,text,text) to authenticated;

-- Storage: solo administradores activos pueden escribir/borrar en perfume-images.
-- El bucket es público únicamente para lectura de imágenes finales.
drop policy if exists "prive_admin_perfume_images_insert" on storage.objects;
create policy "prive_admin_perfume_images_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'perfume-images'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  )
);

drop policy if exists "prive_admin_perfume_images_update" on storage.objects;
create policy "prive_admin_perfume_images_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'perfume-images'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  )
)
with check (
  bucket_id = 'perfume-images'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  )
);

drop policy if exists "prive_admin_perfume_images_delete" on storage.objects;
create policy "prive_admin_perfume_images_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'perfume-images'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  )
);
