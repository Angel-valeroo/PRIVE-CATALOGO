-- PRIVÉ · S12 V1 · Catálogo público seguro desde Supabase
-- Ejecutar una sola vez en Supabase SQL Editor como postgres.
-- Expone únicamente campos públicos. NO expone perfume_keys, source_url
-- ni información administrativa.

reset role;

create or replace function public.get_public_catalog()
returns table (
  id uuid,
  name text,
  designer text,
  category text,
  image_url text,
  availability_status text,
  profile_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.designer,
    p.category::text,
    p.image_url,
    p.availability_status::text,
    p.profile_status::text
  from public.perfumes p
  where p.active = true
  order by p.designer asc, p.name asc;
$$;

revoke all on function public.get_public_catalog() from public;
grant execute on function public.get_public_catalog() to anon, authenticated;

comment on function public.get_public_catalog() is
'Catálogo público PRIVÉ: solo datos operativos seguros; no expone claves privadas ni source_url.';

-- Verificación rápida: debe devolver perfumes activos y SOLO siete columnas.
select * from public.get_public_catalog() limit 5;
