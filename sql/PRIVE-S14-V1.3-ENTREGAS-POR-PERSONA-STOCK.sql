-- CATALOGO PRIVÉ · S14 V1.3 · Pendientes de entrega por persona + stock + cantidades en notas
-- Ejecutar en Supabase SQL Editor como postgres.
--
-- Reglas:
-- A) PEDIDOS DE DISTRIBUIDORES
--    - Se consolidan por distribuidor.
--    - Sus notas de clientes NO se muestran ni dividen la entrega del admin.
--    - Perfumes y muestras son asignaciones separadas.
--
-- B) PEDIDO DE LA CUENTA ADMIN QUE ESTÁ USANDO EL PANEL
--    - Solo los perfumes con cliente escrito en customer_note entran a Pendientes de entrega.
--    - Sintaxis soportada: "CARLA (2), DANIELA (3), PEDRO"
--      * (N) asigna N perfumes a ese cliente.
--      * Sin (N), se asume 1.
--    - Si la suma asignada es menor que quantity, el sobrante se considera STOCK y NO aparece en Pendientes.
--    - Si no hay nota, todos los perfumes de esa línea se consideran STOCK.
--    - Si la suma de la nota excede quantity, se genera una asignación visible "REVISAR NOTA"
--      para no ocultar un error de captura.
--    - Las muestras siempre van en una sección separada y no se intentan repartir por cliente.
--
-- Esta migración NO modifica orders ni order_items.

begin;

-- Helper V1.3: genera la granularidad real de entregas.
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
      greatest(coalesce(oi.quantity,0),0)::integer as quantity,
      greatest(coalesce(oi.sample_quantity,0),0)::integer as sample_quantity,
      nullif(trim(coalesce(oi.customer_note,'')), '') as customer_note,
      (o.user_id = auth.uid()) as is_current_admin_order
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.profiles pr on pr.id = o.user_id
    join public.perfumes p on p.id = oi.perfume_id
    join public.perfume_keys pk on pk.perfume_id = p.id
    where o.cycle_id = p_cycle_id
      and o.status = 'confirmed'
  ),
  note_tokens as (
    select
      b.*,
      t.ordinality::integer as note_pos,
      trim(t.token) as raw_token
    from base b
    cross join lateral regexp_split_to_table(
      coalesce(b.customer_note,''),
      E'\\s*[,;\\n]+\\s*'
    ) with ordinality as t(token, ordinality)
    where b.is_current_admin_order
      and nullif(trim(t.token),'') is not null
  ),
  parsed_tokens as (
    select
      n.*,
      nullif(trim(regexp_replace(
        n.raw_token,
        E'\\s*\\(\\s*\\d+\\s*\\)\\s*$',
        ''
      )), '') as client_name,
      coalesce(
        nullif(substring(n.raw_token from E'\\(\\s*(\\d+)\\s*\\)\\s*$'),'')::integer,
        1
      ) as client_qty
    from note_tokens n
  ),
  valid_tokens as (
    select *
    from parsed_tokens
    where client_name is not null
      and client_qty > 0
  ),
  token_totals as (
    select
      b.order_item_id,
      coalesce(sum(v.client_qty),0)::integer as assigned_qty,
      count(v.*)::integer as token_count
    from base b
    left join valid_tokens v on v.order_item_id = b.order_item_id
    where b.is_current_admin_order
    group by b.order_item_id
  ),

  -- Distribuidores: perfumes consolidados.
  distributor_perfumes as (
    select
      b.order_item_id::text || ':perfume' as delivery_key,
      b.order_item_id, b.order_id, b.folio, b.confirmed_at,
      b.distributor_id, b.distributor_name, b.distributor_alias,
      b.perfume_id, b.perfume_name, b.perfume_code, b.presentation,
      b.quantity,
      0::integer as sample_quantity,
      null::text as customer_note,
      coalesce(nullif(b.distributor_alias,''), b.distributor_name, 'Distribuidor') as delivery_recipient,
      'distributor_perfume'::text as delivery_kind
    from base b
    where not b.is_current_admin_order
      and b.quantity > 0
  ),

  -- Distribuidores: muestras separadas de los perfumes.
  distributor_samples as (
    select
      b.order_item_id::text || ':samples' as delivery_key,
      b.order_item_id, b.order_id, b.folio, b.confirmed_at,
      b.distributor_id, b.distributor_name, b.distributor_alias,
      b.perfume_id, b.perfume_name, b.perfume_code, b.presentation,
      0::integer as quantity,
      b.sample_quantity,
      null::text as customer_note,
      coalesce(nullif(b.distributor_alias,''), b.distributor_name, 'Distribuidor') as delivery_recipient,
      'distributor_samples'::text as delivery_kind
    from base b
    where not b.is_current_admin_order
      and b.sample_quantity > 0
  ),

  -- Cuenta admin: cada cliente escrito en la nota genera una asignación por cliente,
  -- usando (N) como cantidad y 1 cuando no hay cantidad.
  admin_clients as (
    select
      b.order_item_id::text || ':client:' || v.note_pos::text as delivery_key,
      b.order_item_id, b.order_id, b.folio, b.confirmed_at,
      b.distributor_id, b.distributor_name, b.distributor_alias,
      b.perfume_id, b.perfume_name, b.perfume_code, b.presentation,
      v.client_qty::integer as quantity,
      0::integer as sample_quantity,
      v.client_name::text as customer_note,
      v.client_name::text as delivery_recipient,
      'direct_client'::text as delivery_kind
    from base b
    join token_totals tt on tt.order_item_id = b.order_item_id
    join valid_tokens v on v.order_item_id = b.order_item_id
    where b.is_current_admin_order
      and tt.assigned_qty > 0
      and tt.assigned_qty <= b.quantity
  ),

  -- Si la nota pide más piezas que la cantidad real, no adivinamos:
  -- mostramos una sola alerta operativa para que el admin corrija el pedido.
  admin_note_review as (
    select
      b.order_item_id::text || ':note-review' as delivery_key,
      b.order_item_id, b.order_id, b.folio, b.confirmed_at,
      b.distributor_id, b.distributor_name, b.distributor_alias,
      b.perfume_id, b.perfume_name, b.perfume_code, b.presentation,
      b.quantity,
      0::integer as sample_quantity,
      b.customer_note,
      'REVISAR NOTA'::text as delivery_recipient,
      'admin_note_review'::text as delivery_kind
    from base b
    join token_totals tt on tt.order_item_id = b.order_item_id
    where b.is_current_admin_order
      and tt.assigned_qty > b.quantity
      and b.quantity > 0
  ),

  -- Cuenta admin: muestras independientes; no se intentan repartir por los nombres.
  admin_samples as (
    select
      b.order_item_id::text || ':samples' as delivery_key,
      b.order_item_id, b.order_id, b.folio, b.confirmed_at,
      b.distributor_id, b.distributor_name, b.distributor_alias,
      b.perfume_id, b.perfume_name, b.perfume_code, b.presentation,
      0::integer as quantity,
      b.sample_quantity,
      null::text as customer_note,
      'Mi pedido'::text as delivery_recipient,
      'admin_samples'::text as delivery_kind
    from base b
    where b.is_current_admin_order
      and b.sample_quantity > 0
  )

  select * from distributor_perfumes
  union all
  select * from distributor_samples
  union all
  select * from admin_clients
  union all
  select * from admin_note_review
  union all
  select * from admin_samples;
$$;

revoke all on function public.admin_delivery_assignments(uuid) from public;

-- Ciclos: conteos logísticos usan las asignaciones V1.3.
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
    count(a.delivery_key)::bigint,
    cb.total_perfumes,
    cb.total_samples,
    count(di.assignment_key)::bigint,
    (count(a.delivery_key) - count(di.assignment_key))::bigint,
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

-- Detalle del ciclo.
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
    select 1
    from public.delivery_cycles dc
    where dc.cycle_id = p_cycle_id
      and dc.archived_at is null
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
  left join public.delivery_items di
    on di.assignment_key = a.delivery_key
  order by
    case
      when a.delivery_kind in ('distributor_perfume','direct_client','admin_note_review') then 0
      else 1
    end,
    coalesce(nullif(a.distributor_alias,''), a.distributor_name),
    a.perfume_name,
    a.delivery_recipient,
    a.delivery_key;
end;
$$;

revoke all on function public.admin_get_delivery_items(uuid) from public;
grant execute on function public.admin_get_delivery_items(uuid) to authenticated;

-- Las asignaciones antiguas que ya no existen bajo V1.3 son logística temporal.
-- Se eliminan para no arrastrar un "entregado" incompatible con la nueva granularidad.
delete from public.delivery_items di
where not exists (
  select 1
  from public.orders o
  cross join lateral public.admin_delivery_assignments(o.cycle_id) a
  where a.order_item_id = di.order_item_id
    and a.delivery_key = di.assignment_key
);

commit;

-- VALIDACIÓN 1: funciones.
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

-- VALIDACIÓN 2: muestra cuántas asignaciones V1.3 existen por tipo en cortes activos.
select
  a.delivery_kind,
  count(*) as asignaciones,
  coalesce(sum(a.quantity),0) as perfumes,
  coalesce(sum(a.sample_quantity),0) as muestras
from public.delivery_cycles dc
cross join lateral public.admin_delivery_assignments(dc.cycle_id) a
where dc.archived_at is null
group by a.delivery_kind
order by a.delivery_kind;
