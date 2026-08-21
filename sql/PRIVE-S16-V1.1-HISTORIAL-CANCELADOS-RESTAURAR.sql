-- CATÁLOGO PRIVÉ · S16 V1.1 · Historial de cancelados + Restaurar pedido
-- Ejecutar en Supabase SQL Editor como postgres.
--
-- Objetivos:
-- 1) Historial Admin incluye pedidos CONFIRMADOS y CANCELADOS.
-- 2) Los cancelados se ven como CANCELADO, sin volver a reportes/cortes operativos.
-- 3) Admin puede restaurar un cancelado eligiendo un corte futuro/abierto.
-- 4) Se conserva folio, líneas, notas y confirmed_at.
-- 5) La restauración queda auditada en order_events.

reset role;

-- Auditoría: añadir evento restored.
alter table public.order_events
  drop constraint if exists order_events_event_type_check;

alter table public.order_events
  add constraint order_events_event_type_check
  check (event_type in ('confirmed','reopened','moved','cancelled','restored'));

-- Historial administrativo, separado del RPC histórico del portal.
create or replace function public.admin_get_order_history()
returns table (
  order_id uuid,
  folio text,
  confirmed_at timestamptz,
  cycle_id uuid,
  cycle_name text,
  user_id uuid,
  user_name text,
  user_alias text,
  total_perfumes bigint,
  total_samples bigint,
  status text,
  cancelled_at timestamptz,
  cancel_reason text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_active_admin();

  return query
  select
    o.id,
    o.folio,
    o.confirmed_at,
    o.cycle_id,
    oc.name,
    o.user_id,
    pr.full_name,
    pr.alias,
    coalesce(sum(oi.quantity),0)::bigint,
    coalesce(sum(oi.sample_quantity),0)::bigint,
    o.status::text,
    o.cancelled_at,
    o.cancel_reason
  from public.orders o
  join public.profiles pr on pr.id = o.user_id
  left join public.order_cycles oc on oc.id = o.cycle_id
  left join public.order_items oi on oi.order_id = o.id
  where o.status in ('confirmed','cancelled')
  group by o.id, o.folio, o.confirmed_at, o.cycle_id, oc.name,
           o.user_id, pr.full_name, pr.alias, o.status,
           o.cancelled_at, o.cancel_reason
  order by coalesce(o.cancelled_at,o.confirmed_at,o.updated_at) desc;
end;
$$;

revoke all on function public.admin_get_order_history() from public;
grant execute on function public.admin_get_order_history() to authenticated;

-- Permitir a Admin abrir el detalle de un pedido cancelado.
-- Se conserva exactamente la misma firma/columnas existentes.
create or replace function public.get_admin_order_detail(p_order_id uuid)
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
  perform public.assert_active_admin();

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
    and o.status in ('confirmed','reopened','cancelled')
  order by p.name, oi.presentation nulls first, oi.created_at;
end;
$$;

revoke all on function public.get_admin_order_detail(uuid) from public;
grant execute on function public.get_admin_order_detail(uuid) to authenticated;

-- Cortes válidos para restaurar. A diferencia de mover, el corte original
-- también puede aparecer si sigue abierto.
create or replace function public.admin_get_order_restore_cycles(p_order_id uuid)
returns table (
  cycle_id uuid,
  cycle_name text,
  cutoff_at timestamptz,
  order_day date
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
begin
  perform public.assert_active_admin();

  select o.status
  into v_status
  from public.orders o
  where o.id = p_order_id;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if v_status <> 'cancelled' then
    raise exception 'Solo puedes restaurar pedidos cancelados';
  end if;

  return query
  select oc.id, oc.name, oc.cutoff_at, oc.order_day
  from public.order_cycles oc
  where oc.active = true
    and oc.cutoff_at >= now()
  order by oc.cutoff_at asc;
end;
$$;

revoke all on function public.admin_get_order_restore_cycles(uuid) from public;
grant execute on function public.admin_get_order_restore_cycles(uuid) to authenticated;

-- Restaurar pedido cancelado a un corte abierto/futuro.
create or replace function public.admin_restore_order(
  p_order_id uuid,
  p_cycle_id uuid,
  p_reason text default null
)
returns table (
  order_id uuid,
  restored_cycle_id uuid,
  restored_cycle_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
  v_cycle_name text;
  v_reason text := nullif(btrim(coalesce(p_reason,'')), '');
begin
  perform public.assert_active_admin();

  select o.status
  into v_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if v_status <> 'cancelled' then
    raise exception 'Solo puedes restaurar pedidos cancelados';
  end if;

  if p_cycle_id is null then
    raise exception 'Selecciona el corte donde se restaurará el pedido';
  end if;

  select oc.name
  into v_cycle_name
  from public.order_cycles oc
  where oc.id = p_cycle_id
    and oc.active = true
    and oc.cutoff_at >= now();

  if not found then
    raise exception 'El corte seleccionado ya no está disponible';
  end if;

  -- Seguridad: no debe quedar progreso de entrega asociado a una cancelación.
  delete from public.delivery_items di
  using public.order_items oi
  where oi.order_id = p_order_id
    and di.order_item_id = oi.id;

  update public.orders
  set status = 'confirmed',
      cycle_id = p_cycle_id,
      cancelled_at = null,
      cancelled_by = null,
      cancel_reason = null,
      updated_at = now()
  where id = p_order_id;

  insert into public.order_events(order_id, actor_user_id, event_type, note)
  values (
    p_order_id,
    auth.uid(),
    'restored',
    concat_ws(' · ', 'Restaurado a: ' || v_cycle_name, v_reason)
  );

  return query select p_order_id, p_cycle_id, v_cycle_name;
end;
$$;

revoke all on function public.admin_restore_order(uuid,uuid,text) from public;
grant execute on function public.admin_restore_order(uuid,uuid,text) to authenticated;

-- Validación de instalación.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'admin_get_order_history',
    'admin_get_order_restore_cycles',
    'admin_restore_order'
  )
order by proname;
