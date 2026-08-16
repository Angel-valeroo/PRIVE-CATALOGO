reset role;

-- =========================================================
-- PRIVÉ · S10
-- Regla permanente de mayúsculas para catálogo
-- + normalización segura de registros existentes
-- =========================================================

-- Antes de convertir claves existentes a mayúsculas, comprobamos que no
-- existan dos claves que solo se distingan por mayúsculas/minúsculas.
do $$
begin
  if exists (
    select 1
    from public.perfume_keys pk
    group by upper(btrim(pk.code))
    having count(*) > 1
  ) then
    raise exception 'Existen claves que colisionarían al convertirlas a mayúsculas. No se realizó la migración.';
  end if;
end
$$;

-- Normaliza solamente filas que realmente necesitan cambio.
update public.perfumes
set
  name = upper(btrim(name)),
  designer = upper(btrim(designer)),
  updated_at = now()
where name is distinct from upper(btrim(name))
   or designer is distinct from upper(btrim(designer));

update public.perfume_keys
set
  code = upper(btrim(code)),
  updated_at = now()
where code is distinct from upper(btrim(code));

-- =========================================================
-- Alta administrativa: backend también fuerza mayúsculas.
-- =========================================================
create or replace function public.admin_create_perfume(
  p_name text,
  p_designer text,
  p_category text,
  p_code text,
  p_image_url text default null,
  p_image_storage_path text default null
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
begin
  if v_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1
    from public.profiles p
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

  if v_name = '' then
    raise exception 'El nombre del perfume es obligatorio';
  end if;

  if v_designer = '' then
    raise exception 'El diseñador es obligatorio';
  end if;

  if v_code = '' then
    raise exception 'La clave del perfume es obligatoria';
  end if;

  if lower(v_category) not in ('caballero', 'dama', 'unisex') then
    raise exception 'La categoría debe ser Caballero, Dama o Unisex';
  end if;

  v_category :=
    case lower(v_category)
      when 'caballero' then 'Caballero'
      when 'dama' then 'Dama'
      when 'unisex' then 'Unisex'
    end;

  if exists (
    select 1
    from public.perfume_keys pk
    where upper(btrim(pk.code)) = v_code
  ) then
    raise exception 'La clave % ya existe', v_code;
  end if;

  if exists (
    select 1
    from public.perfumes p
    where lower(btrim(p.name)) = lower(v_name)
      and lower(btrim(coalesce(p.designer, ''))) = lower(v_designer)
  ) then
    raise exception 'Ya existe un perfume con ese nombre y diseñador';
  end if;

  insert into public.perfumes (
    name,
    designer,
    category,
    image_url,
    image_storage_path,
    active,
    availability_status,
    profile_status
  )
  values (
    v_name,
    v_designer,
    v_category,
    nullif(btrim(coalesce(p_image_url, '')), ''),
    nullif(btrim(coalesce(p_image_storage_path, '')), ''),
    true,
    'available',
    'basic'
  )
  returning id into v_perfume_id;

  insert into public.perfume_keys (
    perfume_id,
    code
  )
  values (
    v_perfume_id,
    v_code
  );

  return v_perfume_id;
end;
$$;

revoke all on function public.admin_create_perfume(text,text,text,text,text,text) from public;
grant execute on function public.admin_create_perfume(text,text,text,text,text,text) to authenticated;

-- =========================================================
-- Edición administrativa: misma regla permanente.
-- =========================================================
create or replace function public.admin_update_perfume(
  p_perfume_id uuid,
  p_name text,
  p_designer text,
  p_category text,
  p_code text
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
begin
  if v_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_uid
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  if not exists (
    select 1
    from public.perfumes p
    where p.id = p_perfume_id
  ) then
    raise exception 'Perfume no encontrado';
  end if;

  v_name := upper(btrim(coalesce(p_name, '')));
  v_designer := upper(btrim(coalesce(p_designer, '')));
  v_category := btrim(coalesce(p_category, ''));
  v_code := upper(btrim(coalesce(p_code, '')));

  if v_name = '' then
    raise exception 'El nombre del perfume es obligatorio';
  end if;

  if v_designer = '' then
    raise exception 'El diseñador es obligatorio';
  end if;

  if v_code = '' then
    raise exception 'La clave del perfume es obligatoria';
  end if;

  if lower(v_category) not in ('caballero', 'dama', 'unisex') then
    raise exception 'La categoría debe ser Caballero, Dama o Unisex';
  end if;

  v_category :=
    case lower(v_category)
      when 'caballero' then 'Caballero'
      when 'dama' then 'Dama'
      when 'unisex' then 'Unisex'
    end;

  if exists (
    select 1
    from public.perfume_keys pk
    where upper(btrim(pk.code)) = v_code
      and pk.perfume_id <> p_perfume_id
  ) then
    raise exception 'La clave % ya existe', v_code;
  end if;

  if exists (
    select 1
    from public.perfumes p
    where p.id <> p_perfume_id
      and lower(btrim(p.name)) = lower(v_name)
      and lower(btrim(coalesce(p.designer, ''))) = lower(v_designer)
  ) then
    raise exception 'Ya existe otro perfume con ese nombre y diseñador';
  end if;

  update public.perfumes
  set
    name = v_name,
    designer = v_designer,
    category = v_category,
    updated_at = now()
  where id = p_perfume_id;

  update public.perfume_keys
  set
    code = v_code,
    updated_at = now()
  where perfume_id = p_perfume_id;
end;
$$;

revoke all on function public.admin_update_perfume(uuid,text,text,text,text) from public;
grant execute on function public.admin_update_perfume(uuid,text,text,text,text) to authenticated;
