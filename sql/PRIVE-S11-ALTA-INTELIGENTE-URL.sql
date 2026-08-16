reset role;

-- =========================================================
-- PRIVÉ · Sprint 11 · Alta inteligente por URL
-- - Guarda URL fuente para enriquecimiento futuro.
-- - Registra origen de imagen.
-- - Mantiene compatibilidad con RPC anteriores.
-- =========================================================

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'perfume_image_source'
  ) then
    create type public.perfume_image_source as enum (
      'legacy',
      'fragrantica',
      'manual'
    );
  end if;
end
$$;

alter table public.perfumes
  add column if not exists source_url text,
  add column if not exists source_provider text,
  add column if not exists image_source public.perfume_image_source;

-- Registros anteriores: imágenes de Storage fueron subidas manualmente;
-- imágenes históricas del repositorio quedan marcadas como legacy.
update public.perfumes
set image_source = case
  when image_storage_path is not null then 'manual'::public.perfume_image_source
  when image_url is not null then 'legacy'::public.perfume_image_source
  else null
end
where image_source is null;

create index if not exists perfumes_source_url_idx
  on public.perfumes (source_url)
  where source_url is not null;

create index if not exists perfumes_basic_without_source_idx
  on public.perfumes (profile_status, created_at)
  where profile_status = 'basic' and source_url is null;

-- ---------------------------------------------------------
-- Listado admin: se amplía con URL y origen de imagen.
-- ---------------------------------------------------------
drop function if exists public.admin_get_catalog_perfumes();

create function public.admin_get_catalog_perfumes()
returns table (
  id uuid,
  name text,
  designer text,
  category text,
  code text,
  image_url text,
  image_storage_path text,
  image_source public.perfume_image_source,
  source_url text,
  source_provider text,
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
    p.image_source,
    p.source_url,
    p.source_provider,
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

-- ---------------------------------------------------------
-- Helpers de validación interna.
-- ---------------------------------------------------------
create or replace function public.prive_normalize_source_url(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v text := btrim(coalesce(p_value, ''));
begin
  if v = '' then
    return null;
  end if;

  if v !~* '^https://[^[:space:]]+$' then
    raise exception 'La URL fuente debe comenzar con https://';
  end if;

  return v;
end;
$$;

revoke all on function public.prive_normalize_source_url(text) from public;

-- ---------------------------------------------------------
-- Alta V2: perfume + clave + URL + origen de imagen
-- en una misma transacción PostgreSQL.
-- ---------------------------------------------------------
create or replace function public.admin_create_perfume_v2(
  p_name text,
  p_designer text,
  p_category text,
  p_code text,
  p_source_url text default null,
  p_image_url text default null,
  p_image_storage_path text default null,
  p_image_source public.perfume_image_source default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_perfume_id uuid;
  v_name text;
  v_designer text;
  v_category text;
  v_code text;
  v_source_url text;
begin
  if v_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_uid
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  v_name := upper(btrim(coalesce(p_name, '')));
  v_designer := upper(btrim(coalesce(p_designer, '')));
  v_category := btrim(coalesce(p_category, ''));
  v_code := upper(btrim(coalesce(p_code, '')));
  v_source_url := public.prive_normalize_source_url(p_source_url);

  if v_name = '' then raise exception 'El nombre del perfume es obligatorio'; end if;
  if v_designer = '' then raise exception 'El diseñador es obligatorio'; end if;
  if v_code = '' then raise exception 'La clave del perfume es obligatoria'; end if;

  if lower(v_category) not in ('caballero', 'dama', 'unisex') then
    raise exception 'La categoría debe ser Caballero, Dama o Unisex';
  end if;

  v_category := case lower(v_category)
    when 'caballero' then 'Caballero'
    when 'dama' then 'Dama'
    when 'unisex' then 'Unisex'
  end;

  if exists (
    select 1 from public.perfume_keys pk
    where upper(btrim(pk.code)) = v_code
  ) then
    raise exception 'La clave % ya existe', v_code;
  end if;

  if exists (
    select 1 from public.perfumes p
    where lower(btrim(p.name)) = lower(v_name)
      and lower(btrim(coalesce(p.designer, ''))) = lower(v_designer)
  ) then
    raise exception 'Ya existe un perfume con ese nombre y diseñador';
  end if;

  insert into public.perfumes (
    name, designer, category,
    image_url, image_storage_path, image_source,
    source_url, source_provider,
    active, availability_status, profile_status
  )
  values (
    v_name, v_designer, v_category,
    nullif(btrim(coalesce(p_image_url, '')), ''),
    nullif(btrim(coalesce(p_image_storage_path, '')), ''),
    case
      when nullif(btrim(coalesce(p_image_url, '')), '') is null then null
      else coalesce(p_image_source, 'manual'::public.perfume_image_source)
    end,
    v_source_url,
    case when v_source_url is not null then 'fragrantica' else null end,
    true, 'available', 'basic'
  )
  returning id into v_perfume_id;

  insert into public.perfume_keys (perfume_id, code)
  values (v_perfume_id, v_code);

  return v_perfume_id;
end;
$$;

revoke all on function public.admin_create_perfume_v2(text,text,text,text,text,text,text,public.perfume_image_source) from public;
grant execute on function public.admin_create_perfume_v2(text,text,text,text,text,text,text,public.perfume_image_source) to authenticated;

-- ---------------------------------------------------------
-- Edición V2: mantiene todo editable y permite vincular URL
-- a perfumes básicos existentes.
-- ---------------------------------------------------------
create or replace function public.admin_update_perfume_v2(
  p_perfume_id uuid,
  p_name text,
  p_designer text,
  p_category text,
  p_code text,
  p_source_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_designer text;
  v_category text;
  v_code text;
  v_source_url text;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_uid and p.role = 'admin' and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  if not exists (select 1 from public.perfumes p where p.id = p_perfume_id) then
    raise exception 'Perfume no encontrado';
  end if;

  v_name := upper(btrim(coalesce(p_name, '')));
  v_designer := upper(btrim(coalesce(p_designer, '')));
  v_category := btrim(coalesce(p_category, ''));
  v_code := upper(btrim(coalesce(p_code, '')));
  v_source_url := public.prive_normalize_source_url(p_source_url);

  if v_name = '' then raise exception 'El nombre del perfume es obligatorio'; end if;
  if v_designer = '' then raise exception 'El diseñador es obligatorio'; end if;
  if v_code = '' then raise exception 'La clave del perfume es obligatoria'; end if;

  if lower(v_category) not in ('caballero', 'dama', 'unisex') then
    raise exception 'La categoría debe ser Caballero, Dama o Unisex';
  end if;

  v_category := case lower(v_category)
    when 'caballero' then 'Caballero'
    when 'dama' then 'Dama'
    when 'unisex' then 'Unisex'
  end;

  if exists (
    select 1 from public.perfume_keys pk
    where upper(btrim(pk.code)) = v_code
      and pk.perfume_id <> p_perfume_id
  ) then
    raise exception 'La clave % ya existe', v_code;
  end if;

  if exists (
    select 1 from public.perfumes p
    where p.id <> p_perfume_id
      and lower(btrim(p.name)) = lower(v_name)
      and lower(btrim(coalesce(p.designer, ''))) = lower(v_designer)
  ) then
    raise exception 'Ya existe otro perfume con ese nombre y diseñador';
  end if;

  update public.perfumes
  set name = v_name,
      designer = v_designer,
      category = v_category,
      source_url = v_source_url,
      source_provider = case when v_source_url is not null then 'fragrantica' else null end,
      updated_at = now()
  where id = p_perfume_id;

  update public.perfume_keys
  set code = v_code, updated_at = now()
  where perfume_id = p_perfume_id;
end;
$$;

revoke all on function public.admin_update_perfume_v2(uuid,text,text,text,text,text) from public;
grant execute on function public.admin_update_perfume_v2(uuid,text,text,text,text,text) to authenticated;

-- ---------------------------------------------------------
-- Imagen V2 + borrado lógico de referencia.
-- ---------------------------------------------------------
create or replace function public.admin_set_perfume_image_v2(
  p_perfume_id uuid,
  p_image_url text,
  p_image_storage_path text,
  p_image_source public.perfume_image_source
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  if not exists (select 1 from public.perfumes p where p.id = p_perfume_id) then
    raise exception 'Perfume no encontrado';
  end if;

  update public.perfumes
  set image_url = nullif(btrim(coalesce(p_image_url, '')), ''),
      image_storage_path = nullif(btrim(coalesce(p_image_storage_path, '')), ''),
      image_source = case
        when nullif(btrim(coalesce(p_image_url, '')), '') is null then null
        else coalesce(p_image_source, 'manual'::public.perfume_image_source)
      end,
      updated_at = now()
  where id = p_perfume_id;
end;
$$;

revoke all on function public.admin_set_perfume_image_v2(uuid,text,text,public.perfume_image_source) from public;
grant execute on function public.admin_set_perfume_image_v2(uuid,text,text,public.perfume_image_source) to authenticated;

create or replace function public.admin_clear_perfume_image(p_perfume_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  update public.perfumes
  set image_url = null,
      image_storage_path = null,
      image_source = null,
      updated_at = now()
  where id = p_perfume_id;

  if not found then raise exception 'Perfume no encontrado'; end if;
end;
$$;

revoke all on function public.admin_clear_perfume_image(uuid) from public;
grant execute on function public.admin_clear_perfume_image(uuid) to authenticated;
