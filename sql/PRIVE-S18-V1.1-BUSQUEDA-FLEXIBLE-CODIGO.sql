-- PRIVÉ · S18 V1.1 · Búsqueda flexible por clave sin exponer claves
-- Ejecutar después de S18 V1.
--
-- Ejemplos:
--   CP025-15 -> solo la variante CP correspondiente.
--   25-15    -> todas las variantes activas cuya parte numérica sea 02515
--               (por ejemplo CP025-15 y DP025-15).
--
-- Seguridad:
--   La clave privada nunca se devuelve. La RPC entrega únicamente perfume_id.

reset role;

create or replace function public.get_public_perfume_id_by_code(p_code text)
returns table (perfume_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  with input as (
    select
      upper(regexp_replace(btrim(coalesce(p_code,'')), '[^A-Za-z0-9]', '', 'g')) as compact
  ),
  parsed as (
    select
      compact,
      case when compact ~ '^(CP|DP|UP)[0-9]{4,7}$' then left(compact,2) else null end as prefix,
      regexp_replace(compact, '[^0-9]', '', 'g') as digits
    from input
  ),
  candidates as (
    select
      p.id as perfume_id,
      upper(regexp_replace(btrim(pk.code), '[^A-Za-z0-9]', '', 'g')) as key_compact,
      regexp_replace(upper(regexp_replace(btrim(pk.code), '[^A-Za-z0-9]', '', 'g')), '[^0-9]', '', 'g') as key_digits
    from public.perfume_keys pk
    join public.perfumes p on p.id = pk.perfume_id
    where p.active = true
  )
  select distinct c.perfume_id
  from candidates c
  cross join parsed q
  where
    (
      q.prefix is not null
      and left(c.key_compact,2) = q.prefix
      and ltrim(c.key_digits,'0') = ltrim(q.digits,'0')
    )
    or
    (
      q.prefix is null
      and q.compact ~ '^[0-9]{4,7}$'
      and ltrim(c.key_digits,'0') = ltrim(q.digits,'0')
    )
  order by c.perfume_id
  limit 20;
$$;

revoke all on function public.get_public_perfume_id_by_code(text) from public;
grant execute on function public.get_public_perfume_id_by_code(text) to anon, authenticated;

comment on function public.get_public_perfume_id_by_code(text) is
'Búsqueda pública PRIVÉ flexible por clave. Con prefijo devuelve esa variante; solo números devuelve todas las variantes coincidentes. Nunca expone perfume_keys.code.';

select proname
from pg_proc
where pronamespace='public'::regnamespace
  and proname='get_public_perfume_id_by_code';
