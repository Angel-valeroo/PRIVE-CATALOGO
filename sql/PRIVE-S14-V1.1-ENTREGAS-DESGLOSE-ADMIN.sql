-- CATALOGO PRIVÉ · S14 V1.1 · Entregas: distribuidores consolidados + clientes directos del admin
-- Ejecutar en Supabase SQL Editor como postgres.
-- Esta migración NO modifica orders ni order_items.
-- Solo cambia la granularidad del seguimiento logístico de delivery_items y sus RPC.

begin;

-- 1) delivery_items pasa de 1 marca por order_item a 1 marca por asignación lógica.
--    Los marcadores antiguos se conservan como ':all'.
alter table public.delivery_items
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists assignment_key text;

update public.delivery_items
set assignment_key = order_item_id::text || ':all'
where assignment_key is null;

alter table public.delivery_items
  alter column id set not null,
  alter column assignment_key set not null;

alter table public.delivery_items
  drop constraint if exists delivery_items_pkey;

alter table public.delivery_items
  add constraint delivery_items_pkey primary key (id);

create unique index if not exists delivery_items_assignment_key_uq
  on public.delivery_items (assignment_key);

create index if not exists delivery_items_order_item_idx
  on public.delivery_items (order_item_id);

-- 2) Helper interno: genera las asignaciones reales de entrega.
-- Regla:
-- - Pedidos de distribuidores: UNA sola asignación consolidada por línea; sus notas no se muestran aquí.
-- - Pedido del admin que está viendo el panel: si cantidad = número de nombres separados por coma/;/salto,
--   se crea una asignación por cliente final.
-- - Las muestras del pedido directo, cuando hubo desglose por clientes, quedan como una asignación aparte
--   para no adivinar a qué cliente corresponde cada muestra.
create or replace function public.admin_delivery_assignments(p_cycle_id uuid)
returns table (
  delivery_key text,
  order_item_id uuid,
  order_id uuid,
  folio text,
  confirmed_at timestamptz,
  distributor_id uuid,
  distributor_name text,
  distributor_alias text,
  perfume_id uuid,
  perfume_name text,
  perfume_code text,
  presentation public.unisex_presentation,
  quantity integer,
  sample_quantity integer,
  customer_note text,
  delivery_recipient text,
  delivery_kind text
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      oi.id as order_item_id,
      o.id as order_id,
      o.folio,
      o.confirmed_at,
      o.user_id as distributor_id,
      pr.full_name as distributor_name,
      pr.alias as distributor_alias,
      p.id as perfume_id,
      p.name as perfume_name,
      pk.code as perfume_code,
      oi.presentation,
      oi.quantity,
      oi.sample_quantity,
      oi.customer_note,
      o.user_id = auth.uid() as is_current_admin_order,
      case
        when nullif(trim(coalesce(oi.customer_note, '')), '') is null then array[]::text[]
        else array_remove(
          regexp_split_to_array(trim(oi.customer_note), E'\\s*[,;\\n]+\\s*'),
          ''
        )
      end as note_parts
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.profiles pr on pr.id = o.user_id
    join public.perfumes p on p.id = oi.perfume_id
    join public.perfume_keys pk on pk.perfume_id = p.id
    where o.cycle_id = p_cycle_id
      and o.status = 'confirmed'
  ), classified as (
    select *,
      (
        is_current_admin_order
        and quantity > 1
        and cardinality(note_parts) = quantity
      ) as should_split
    from base
  ), consolidated as (
    select
      order_item_id::text || ':all' as delivery_key,
      order_item_id, order_id, folio, confirmed_at,
      distributor_id, distributor_name, distributor_alias,
      perfume_id, perfume_name, perfume_code, presentation,
      quantity, sample_quantity,
      case when is_current_admin_order then customer_note else null end as customer_note,
      case
        when is_current_admin_order and cardinality(note_parts) = 1
          then note_parts[1]
        else coalesce(nullif(distributor_alias,''), distributor_name, 'Distribuidor')
      end as delivery_recipient,
      case
        when is_current_admin_order and cardinality(note_parts) = 1 then 'direct_client'
        when is_current_admin_order then 'admin_order'
        else 'distributor'
      end as delivery_kind
    from classified
    where not should_split
  ), split_units as (
    select
      c.order_item_id::text || ':unit:' || gs.i::text as delivery_key,
      c.order_item_id, c.order_id, c.folio, c.confirmed_at,
      c.distributor_id, c.distributor_name, c.distributor_alias,
      c.perfume_id, c.perfume_name, c.perfume_code, c.presentation,
      1::integer as quantity,
      0::integer as sample_quantity,
      c.note_parts[gs.i] as customer_note,
      c.note_parts[gs.i] as delivery_recipient,
      'direct_client'::text as delivery_kind
    from classified c
    cross join lateral generate_series(1, c.quantity) as gs(i)
    where c.should_split
  ), split_samples as (
    select
      c.order_item_id::text || ':samples' as delivery_key,
      c.order_item_id, c.order_id, c.folio, c.confirmed_at,
      c.distributor_id, c.distributor_name, c.distributor_alias,
      c.perfume_id, c.perfume_name, c.perfume_code, c.presentation,
      0::integer as quantity,
      c.sample_quantity::integer as sample_quantity,
      null::text as customer_note,
      'Muestras del pedido'::text as delivery_recipient,
      'admin_samples'::text as delivery_kind
    from classified c
    where c.should_split
      and c.sample_quantity > 0
  )
  select * from consolidated
  union all
  select * from split_units
  union all
  select * from split_samples;
$$;
revoke all on function public.admin_delivery_assignments(uuid) from public;

-- 3) Lista de ciclos usando el número real de asignaciones lógicas.
create or replace function public.admin_get_delivery_cycles()
returns table (
  cycle_id uuid,
  cycle_name text,
  cutoff_at timestamptz,
  order_day date,
  confirmed_orders bigint,
  total_allocations bigint,
  total_perfumes bigint,
  total_samples bigint,
  delivered_allocations bigint,
  pending_allocations bigint,
  activated_at timestamptz,
  archived_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_active_admin();

  return query
  with cycle_base as (
    select
      oc.id,
      oc.name,
      oc.cutoff_at,
      oc.order_day,
      dc.activated_at,
      dc.archived_at,
      count(distinct o.id)::bigint as confirmed_orders,
      coalesce(sum(oi.quantity),0)::bigint as total_perfumes,
      coalesce(sum(oi.sample_quantity),0)::bigint as total_samples
    from public.order_cycles oc
    join public.orders o
      on o.cycle_id = oc.id
     and o.status = 'confirmed'
    join public.order_items oi on oi.order_id = o.id
    left join public.delivery_cycles dc on dc.cycle_id = oc.id
    group by oc.id, oc.name, oc.cutoff_at, oc.order_day, dc.activated_at, dc.archived_at
  )
  select
    cb.id,
    cb.name,
    cb.cutoff_at,
    cb.order_day,
    cb.confirmed_orders,
    count(a.delivery_key)::bigint as total_allocations,
    cb.total_perfumes,
    cb.total_samples,
    count(di.assignment_key)::bigint as delivered_allocations,
    (count(a.delivery_key) - count(di.assignment_key))::bigint as pending_allocations,
    cb.activated_at,
    cb.archived_at
  from cycle_base cb
  left join lateral public.admin_delivery_assignments(cb.id) a on true
  left join public.delivery_items di on di.assignment_key = a.delivery_key
  group by cb.id, cb.name, cb.cutoff_at, cb.order_day, cb.confirmed_orders,
           cb.total_perfumes, cb.total_samples, cb.activated_at, cb.archived_at
  order by coalesce(cb.activated_at, cb.cutoff_at) desc nulls last;
end;
$$;
revoke all on function public.admin_get_delivery_cycles() from public;
grant execute on function public.admin_get_delivery_cycles() to authenticated;

-- 4) Detalle del ciclo con asignaciones separables.
drop function if exists public.admin_get_delivery_items(uuid);
create function public.admin_get_delivery_items(p_cycle_id uuid)
returns table (
  delivery_key text,
  order_item_id uuid,
  order_id uuid,
  folio text,
  confirmed_at timestamptz,
  distributor_id uuid,
  distributor_name text,
  distributor_alias text,
  perfume_id uuid,
  perfume_name text,
  perfume_code text,
  presentation public.unisex_presentation,
  quantity integer,
  sample_quantity integer,
  customer_note text,
  delivery_recipient text,
  delivery_kind text,
  delivered boolean,
  delivered_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_active_admin();

  if not exists (
    select 1 from public.delivery_cycles dc
    where dc.cycle_id = p_cycle_id and dc.archived_at is null
  ) then
    raise exception 'Primero inicia las entregas de este corte';
  end if;

  return query
  select
    a.delivery_key,
    a.order_item_id,
    a.order_id,
    a.folio,
    a.confirmed_at,
    a.distributor_id,
    a.distributor_name,
    a.distributor_alias,
    a.perfume_id,
    a.perfume_name,
    a.perfume_code,
    a.presentation,
    a.quantity,
    a.sample_quantity,
    a.customer_note,
    a.delivery_recipient,
    a.delivery_kind,
    (di.assignment_key is not null) as delivered,
    di.delivered_at
  from public.admin_delivery_assignments(p_cycle_id) a
  left join public.delivery_items di on di.assignment_key = a.delivery_key
  order by a.perfume_name, a.presentation nulls first, a.delivery_recipient, a.delivery_key;
end;
$$;
revoke all on function public.admin_get_delivery_items(uuid) from public;
grant execute on function public.admin_get_delivery_items(uuid) to authenticated;

-- 5) Marcar/desmarcar una asignación, no la línea completa.
drop function if exists public.admin_set_delivery_item(uuid, boolean);
drop function if exists public.admin_set_delivery_item(text, uuid, boolean);
create function public.admin_set_delivery_item(
  p_delivery_key text,
  p_order_item_id uuid,
  p_delivered boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cycle_id uuid;
begin
  perform public.assert_active_admin();

  select o.cycle_id into v_cycle_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_order_item_id
    and o.status = 'confirmed';

  if v_cycle_id is null then
    raise exception 'Linea de pedido confirmada no encontrada';
  end if;

  if not exists (
    select 1 from public.delivery_cycles dc
    where dc.cycle_id = v_cycle_id and dc.archived_at is null
  ) then
    raise exception 'El ciclo de entregas no esta activo';
  end if;

  if not exists (
    select 1
    from public.admin_delivery_assignments(v_cycle_id) a
    where a.delivery_key = p_delivery_key
      and a.order_item_id = p_order_item_id
  ) then
    raise exception 'Asignacion de entrega no valida';
  end if;

  if coalesce(p_delivered,false) then
    insert into public.delivery_items(order_item_id, assignment_key, delivered_at, delivered_by)
    values (p_order_item_id, p_delivery_key, now(), auth.uid())
    on conflict (assignment_key) do update
      set delivered_at = excluded.delivered_at,
          delivered_by = excluded.delivered_by,
          order_item_id = excluded.order_item_id;
  else
    delete from public.delivery_items
    where assignment_key = p_delivery_key;
  end if;
end;
$$;
revoke all on function public.admin_set_delivery_item(text,uuid,boolean) from public;
grant execute on function public.admin_set_delivery_item(text,uuid,boolean) to authenticated;

-- 6) Archivar solo cuando TODAS las asignaciones lógicas estén entregadas.
create or replace function public.admin_archive_delivery_cycle(p_cycle_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending bigint;
begin
  perform public.assert_active_admin();

  if not exists (
    select 1 from public.delivery_cycles dc
    where dc.cycle_id = p_cycle_id and dc.archived_at is null
  ) then
    raise exception 'El ciclo de entregas no esta activo';
  end if;

  select count(*) into v_pending
  from public.admin_delivery_assignments(p_cycle_id) a
  left join public.delivery_items di on di.assignment_key = a.delivery_key
  where di.assignment_key is null;

  if v_pending > 0 then
    raise exception 'Todavia hay % entrega(s) pendiente(s)', v_pending;
  end if;

  delete from public.delivery_items di
  using public.order_items oi, public.orders o
  where di.order_item_id = oi.id
    and oi.order_id = o.id
    and o.cycle_id = p_cycle_id;

  update public.delivery_cycles
  set archived_at = now(), archived_by = auth.uid()
  where cycle_id = p_cycle_id;
end;
$$;
revoke all on function public.admin_archive_delivery_cycle(uuid) from public;
grant execute on function public.admin_archive_delivery_cycle(uuid) to authenticated;

commit;

-- VALIDACIÓN 1: nueva estructura de delivery_items.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'delivery_items'
  and column_name in ('id','order_item_id','assignment_key','delivered_at','delivered_by')
order by ordinal_position;

-- VALIDACIÓN 2: funciones del módulo.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'admin_delivery_assignments',
    'admin_get_delivery_cycles',
    'admin_get_delivery_items',
    'admin_set_delivery_item',
    'admin_archive_delivery_cycle'
  )
order by proname;
