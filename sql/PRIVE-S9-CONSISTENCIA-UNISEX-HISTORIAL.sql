-- PRIVÉ · Sprint 9 · Consistencia de presentación Unisex, reportes e historial
-- Ejecutar en Supabase SQL Editor como postgres.
-- Requiere que public.order_items.presentation y public.unisex_presentation ya existan.

reset role;

begin;

-- 1) Pedido operativo: prioridad reabierto > confirmado vigente > draft.
create or replace function public.get_portal_current_order()
returns table (
  order_id uuid,
  db_status public.order_status,
  ui_status text,
  editable boolean,
  folio text,
  cycle_id uuid,
  cycle_name text,
  cutoff_at timestamptz,
  order_day date,
  reopened_at timestamptz,
  total_perfumes bigint,
  total_samples bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
  v_cycle public.order_cycles%rowtype;
  v_total_perfumes bigint := 0;
  v_total_samples bigint := 0;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_uid
      and p.status = 'active'
      and p.role in ('reseller','distributor','admin')
  ) then
    raise exception 'Cuenta no activa o sin acceso al portal';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_uid::text));

  select o.* into v_order
  from public.orders o
  where o.user_id = v_uid and o.status = 'reopened'
  order by o.reopened_at desc nulls last, o.updated_at desc
  limit 1;

  if v_order.id is null then
    select o.* into v_order
    from public.orders o
    join public.order_cycles oc on oc.id = o.cycle_id
    where o.user_id = v_uid
      and o.status = 'confirmed'
      and oc.active = true
      and oc.cutoff_at >= now()
    order by o.confirmed_at desc nulls last, o.updated_at desc
    limit 1;
  end if;

  if v_order.id is null then
    select o.* into v_order
    from public.orders o
    where o.user_id = v_uid and o.status = 'draft'
    order by o.updated_at desc
    limit 1;
  end if;

  if v_order.id is null then
    insert into public.orders (user_id, status)
    values (v_uid, 'draft')
    returning * into v_order;
  end if;

  if v_order.cycle_id is not null then
    select * into v_cycle from public.order_cycles where id = v_order.cycle_id;
  else
    select * into v_cycle
    from public.order_cycles
    where active = true and cutoff_at >= now()
    order by cutoff_at asc
    limit 1;
  end if;

  select
    coalesce(sum(oi.quantity),0)::bigint,
    coalesce(sum(oi.sample_quantity),0)::bigint
  into v_total_perfumes, v_total_samples
  from public.order_items oi
  where oi.order_id = v_order.id;

  return query select
    v_order.id,
    v_order.status,
    case
      when v_order.status = 'confirmed' then 'Pedido cerrado'
      when v_order.status = 'reopened' then 'Pedido reabierto'
      else 'Pedido abierto'
    end,
    (v_order.status in ('draft','reopened')),
    v_order.folio,
    v_order.cycle_id,
    v_cycle.name,
    v_cycle.cutoff_at,
    v_cycle.order_day,
    v_order.reopened_at,
    v_total_perfumes,
    v_total_samples;
end;
$$;

revoke all on function public.get_portal_current_order() from public;
grant execute on function public.get_portal_current_order() to authenticated;

-- 2) Líneas del pedido del portal, con presentación pero sin clave antes de confirmar.
drop function if exists public.get_portal_order_items(uuid);
create function public.get_portal_order_items(p_order_id uuid)
returns table (
  item_id uuid,
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text,
  quantity integer,
  sample_quantity integer,
  customer_note text,
  presentation public.unisex_presentation
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1 from public.orders o
    where o.id = p_order_id
      and (o.user_id = v_uid or public.current_user_role() = 'admin')
  ) then
    raise exception 'No tienes permiso para ver este pedido';
  end if;

  return query
  select
    oi.id, oi.perfume_id, p.name, p.designer, p.category, p.image_url,
    oi.quantity, oi.sample_quantity, oi.customer_note, oi.presentation
  from public.order_items oi
  join public.perfumes p on p.id = oi.perfume_id
  where oi.order_id = p_order_id
  order by oi.created_at asc;
end;
$$;
revoke all on function public.get_portal_order_items(uuid) from public;
grant execute on function public.get_portal_order_items(uuid) to authenticated;

-- 3) Detalle confirmado del dueño o admin, con clave y presentación.
drop function if exists public.get_confirmed_order_report(uuid);
create function public.get_confirmed_order_report(p_order_id uuid)
returns table (
  item_id uuid,
  order_id uuid,
  folio text,
  confirmed_at timestamptz,
  cycle_id uuid,
  cycle_name text,
  user_id uuid,
  user_name text,
  user_alias text,
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text,
  perfume_code text,
  presentation public.unisex_presentation,
  quantity integer,
  sample_quantity integer,
  customer_note text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    oi.id,
    o.id,
    o.folio,
    o.confirmed_at,
    o.cycle_id,
    oc.name,
    o.user_id,
    pr.full_name,
    pr.alias,
    p.id,
    p.name,
    p.designer,
    p.category,
    p.image_url,
    pk.code,
    oi.presentation,
    oi.quantity,
    oi.sample_quantity,
    oi.customer_note
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.perfumes p on p.id = oi.perfume_id
  join public.perfume_keys pk on pk.perfume_id = p.id
  join public.profiles pr on pr.id = o.user_id
  left join public.order_cycles oc on oc.id = o.cycle_id
  where o.id = p_order_id
    and o.status = 'confirmed'
    and (o.user_id = auth.uid() or public.current_user_role() = 'admin')
  order by p.name, oi.presentation nulls first, oi.created_at;
$$;
revoke all on function public.get_confirmed_order_report(uuid) from public;
grant execute on function public.get_confirmed_order_report(uuid) to authenticated;

-- 4) Detalle administrativo, con presentación.
drop function if exists public.get_admin_order_detail(uuid);
create function public.get_admin_order_detail(p_order_id uuid)
returns table (
  item_id uuid,
  order_id uuid,
  folio text,
  confirmed_at timestamptz,
  cycle_id uuid,
  cycle_name text,
  user_id uuid,
  user_name text,
  user_alias text,
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text,
  perfume_code text,
  presentation public.unisex_presentation,
  quantity integer,
  sample_quantity integer,
  customer_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if public.current_user_role() <> 'admin' then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  return query
  select
    oi.id, o.id, o.folio, o.confirmed_at, o.cycle_id, oc.name,
    o.user_id, pr.full_name, pr.alias,
    p.id, p.name, p.designer, p.category, p.image_url,
    pk.code, oi.presentation, oi.quantity, oi.sample_quantity, oi.customer_note
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.perfumes p on p.id = oi.perfume_id
  join public.perfume_keys pk on pk.perfume_id = p.id
  join public.profiles pr on pr.id = o.user_id
  left join public.order_cycles oc on oc.id = o.cycle_id
  where o.id = p_order_id
    and o.status in ('confirmed','reopened')
  order by p.name, oi.presentation nulls first, oi.created_at;
end;
$$;
revoke all on function public.get_admin_order_detail(uuid) from public;
grant execute on function public.get_admin_order_detail(uuid) to authenticated;

-- 5) Reporte limpio para proveedor: el mismo perfume Unisex se separa por presentación.
drop function if exists public.get_supplier_cycle_report(uuid);
create function public.get_supplier_cycle_report(p_cycle_id uuid)
returns table (
  total_quantity bigint,
  perfume_name text,
  perfume_code text,
  presentation public.unisex_presentation,
  total_samples bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if public.current_user_role() <> 'admin' then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  return query
  select
    sum(oi.quantity)::bigint,
    p.name,
    pk.code,
    oi.presentation,
    sum(oi.sample_quantity)::bigint
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.perfumes p on p.id = oi.perfume_id
  join public.perfume_keys pk on pk.perfume_id = p.id
  where o.status = 'confirmed'
    and o.cycle_id = p_cycle_id
  group by p.id, p.name, pk.code, oi.presentation
  order by p.name, oi.presentation nulls first;
end;
$$;
revoke all on function public.get_supplier_cycle_report(uuid) from public;
grant execute on function public.get_supplier_cycle_report(uuid) to authenticated;

-- 6) Consolidado interno: conserva también la presentación.
drop function if exists public.get_cycle_consolidated_report(uuid);
create function public.get_cycle_consolidated_report(p_cycle_id uuid)
returns table (
  perfume_name text,
  perfume_code text,
  presentation public.unisex_presentation,
  total_quantity bigint,
  total_samples bigint,
  internal_breakdown text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if public.current_user_role() <> 'admin' then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  return query
  select
    p.name,
    pk.code,
    oi.presentation,
    sum(oi.quantity)::bigint,
    sum(oi.sample_quantity)::bigint,
    string_agg(
      coalesce(pr.alias, pr.full_name, 'Usuario') || ' → ' ||
      oi.quantity::text || ' perfume' || case when oi.quantity <> 1 then 's' else '' end ||
      ' · ' || oi.sample_quantity::text || ' muestra' ||
      case when oi.sample_quantity <> 1 then 's' else '' end,
      ' | ' order by coalesce(pr.alias, pr.full_name, 'Usuario')
    )
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.perfumes p on p.id = oi.perfume_id
  join public.perfume_keys pk on pk.perfume_id = p.id
  join public.profiles pr on pr.id = o.user_id
  where o.status = 'confirmed'
    and o.cycle_id = p_cycle_id
  group by p.id, p.name, pk.code, oi.presentation
  order by p.name, oi.presentation nulls first;
end;
$$;
revoke all on function public.get_cycle_consolidated_report(uuid) from public;
grant execute on function public.get_cycle_consolidated_report(uuid) to authenticated;

commit;

-- Validaciones rápidas:
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'get_portal_current_order',
    'get_portal_order_items',
    'get_confirmed_order_report',
    'get_admin_order_detail',
    'get_supplier_cycle_report',
    'get_cycle_consolidated_report'
  )
order by proname;
