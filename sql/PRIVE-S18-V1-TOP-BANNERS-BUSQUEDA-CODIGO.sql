-- PRIVÉ · S18 V1 · Top ventas + banners + búsqueda pública por clave sin exponer claves
-- Ejecutar en Supabase SQL Editor como postgres.
--
-- Seguridad:
-- - La clave NO se devuelve al navegador. La búsqueda exacta por clave devuelve solo perfume_id.
-- - Los rankings públicos NO exponen cantidades vendidas, folios, usuarios, notas ni claves.
-- - Solo se consideran pedidos actualmente CONFIRMADOS.

reset role;

-- 1) Resolver una clave exacta sin exponerla en el catálogo ni en el resultado.
create or replace function public.get_public_perfume_id_by_code(p_code text)
returns table (perfume_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.perfume_keys pk
  join public.perfumes p on p.id = pk.perfume_id
  where p.active = true
    and upper(regexp_replace(btrim(pk.code), '\\s+', '', 'g')) =
        upper(regexp_replace(btrim(coalesce(p_code,'')), '\\s+', '', 'g'))
  limit 1;
$$;

revoke all on function public.get_public_perfume_id_by_code(text) from public;
grant execute on function public.get_public_perfume_id_by_code(text) to anon, authenticated;

comment on function public.get_public_perfume_id_by_code(text) is
'Búsqueda pública PRIVÉ por clave exacta. Devuelve únicamente perfume_id; nunca revela perfume_keys.code.';

-- 2) Top mensual público. NO devuelve unidades vendidas.
create or replace function public.get_public_monthly_bestsellers(p_month date default current_date)
returns table (
  month_start date,
  scope text,
  rank integer,
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select date_trunc('month', coalesce(p_month,current_date)::timestamp)::date as month_start
  ),
  sales as (
    select
      p.id as perfume_id,
      p.name as perfume_name,
      p.designer,
      p.category::text as category,
      p.image_url,
      sum(greatest(coalesce(oi.quantity,0),0))::bigint as units
    from bounds b
    join public.orders o
      on o.status = 'confirmed'
     and o.confirmed_at >= b.month_start::timestamptz
     and o.confirmed_at < (b.month_start + interval '1 month')::timestamptz
    join public.order_items oi on oi.order_id = o.id
    join public.perfumes p on p.id = oi.perfume_id
    where p.active = true
      and coalesce(oi.quantity,0) > 0
    group by p.id, p.name, p.designer, p.category, p.image_url
  ),
  overall as (
    select
      'Todos'::text as scope,
      row_number() over(order by units desc, perfume_name asc, perfume_id)::integer as rank,
      s.*
    from sales s
  ),
  by_category as (
    select
      category as scope,
      row_number() over(partition by category order by units desc, perfume_name asc, perfume_id)::integer as rank,
      s.*
    from sales s
    where category in ('Caballero','Dama','Unisex')
  ),
  combined as (
    select scope, rank, perfume_id, perfume_name, designer, category, image_url from overall
    union all
    select scope, rank, perfume_id, perfume_name, designer, category, image_url from by_category
  )
  select
    b.month_start,
    c.scope,
    c.rank,
    c.perfume_id,
    c.perfume_name,
    c.designer,
    c.category,
    c.image_url
  from bounds b
  cross join combined c
  where c.rank <= 5
  order by
    case c.scope when 'Todos' then 0 when 'Caballero' then 1 when 'Dama' then 2 when 'Unisex' then 3 else 9 end,
    c.rank;
$$;

revoke all on function public.get_public_monthly_bestsellers(date) from public;
grant execute on function public.get_public_monthly_bestsellers(date) to anon, authenticated;

comment on function public.get_public_monthly_bestsellers(date) is
'Top 5 mensual PRIVÉ por pedidos confirmados. Público y seguro: no devuelve cantidades ni datos de pedidos.';

-- 3) Nuevas integraciones públicas. No expone fecha ni campos administrativos.
create or replace function public.get_public_new_arrivals(p_limit integer default 8)
returns table (
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.designer, p.category::text, p.image_url
  from public.perfumes p
  where p.active = true
  order by p.created_at desc nulls last, p.name asc
  limit least(greatest(coalesce(p_limit,8),1),20);
$$;

revoke all on function public.get_public_new_arrivals(integer) from public;
grant execute on function public.get_public_new_arrivals(integer) to anon, authenticated;

comment on function public.get_public_new_arrivals(integer) is
'Nuevas integraciones públicas PRIVÉ, sin claves ni metadatos administrativos.';

-- Validación: deben existir las 3 funciones.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'get_public_perfume_id_by_code',
    'get_public_monthly_bestsellers',
    'get_public_new_arrivals'
  )
order by proname;
