-- CATALOGO PRIVÉ · S16 V1 · Herramientas administrativas de pedidos
-- Ejecutar en Supabase SQL Editor como postgres.
--
-- Agrega:
-- 1) Mover un pedido confirmado/reabierto a otro corte FUTURO/ABIERTO.
-- 2) Cancelar un pedido sin borrarlo físicamente.
-- 3) Auditoría en order_events.
-- 4) Limpieza de estados temporales de entrega al mover/cancelar.
--
-- IMPORTANTE:
-- - El folio, líneas, notas y confirmed_at se conservan al mover.
-- - Cancelar NO elimina order_items ni el registro del pedido.
-- - Un pedido cancelado deja de aparecer en reportes/cortes operativos porque
--   esos flujos ya trabajan únicamente con status = 'confirmed'.

reset role;

-- 1) Nuevo estado recuperable: CANCELLED.
alter type public.order_status add value if not exists 'cancelled';

-- Auditoría de cancelación.
alter table public.orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references public.profiles(id) on delete set null,
  add column if not exists cancel_reason text;

-- Ampliar eventos de auditoría.
alter table public.order_events
  drop constraint if exists order_events_event_type_check;

alter table public.order_events
  add constraint order_events_event_type_check
  check (event_type in ('confirmed','reopened','moved','cancelled'));

-- 2) Cortes válidos a los que Admin puede mover un pedido.
create or replace function public.admin_get_order_move_cycles(p_order_id uuid)
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
  v_current_cycle uuid;
begin
  perform public.assert_active_admin();

  select o.cycle_id
  into v_current_cycle
  from public.orders o
  where o.id = p_order_id;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  return query
  select
    oc.id,
    oc.name,
    oc.cutoff_at,
    oc.order_day
  from public.order_cycles oc
  where oc.active = true
    and oc.cutoff_at >= now()
    and oc.id is distinct from v_current_cycle
  order by oc.cutoff_at asc;
end;
$$;

revoke all on function public.admin_get_order_move_cycles(uuid) from public;
grant execute on function public.admin_get_order_move_cycles(uuid) to authenticated;

-- 3) Mover pedido a otro corte.
create or replace function public.admin_move_order(
  p_order_id uuid,
  p_cycle_id uuid,
  p_reason text default null
)
returns table (
  order_id uuid,
  old_cycle_id uuid,
  old_cycle_name text,
  new_cycle_id uuid,
  new_cycle_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
  v_old_cycle_id uuid;
  v_old_cycle_name text;
  v_new_cycle_name text;
  v_reason text := nullif(btrim(coalesce(p_reason,'')), '');
begin
  perform public.assert_active_admin();

  select o.status, o.cycle_id, oc.name
  into v_status, v_old_cycle_id, v_old_cycle_name
  from public.orders o
  left join public.order_cycles oc on oc.id = o.cycle_id
  where o.id = p_order_id
  for update of o;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if v_status not in ('confirmed','reopened') then
    raise exception 'Solo puedes mover pedidos confirmados o reabiertos';
  end if;

  if p_cycle_id is null then
    raise exception 'Selecciona un corte destino';
  end if;

  if p_cycle_id = v_old_cycle_id then
    raise exception 'El pedido ya pertenece a ese corte';
  end if;

  select oc.name
  into v_new_cycle_name
  from public.order_cycles oc
  where oc.id = p_cycle_id
    and oc.active = true
    and oc.cutoff_at >= now();

  if not found then
    raise exception 'El corte destino no está disponible o ya cerró';
  end if;

  -- El seguimiento de entrega pertenece al corte anterior. Se reinicia solo
  -- para las líneas de este pedido; no se toca ningún otro pedido.
  delete from public.delivery_items di
  using public.order_items oi
  where oi.order_id = p_order_id
    and di.order_item_id = oi.id;

  update public.orders
  set cycle_id = p_cycle_id,
      updated_at = now()
  where id = p_order_id;

  insert into public.order_events(order_id, actor_user_id, event_type, note)
  values (
    p_order_id,
    auth.uid(),
    'moved',
    concat_ws(' · ',
      'Corte: ' || coalesce(v_old_cycle_name,'Sin corte') || ' → ' || v_new_cycle_name,
      v_reason
    )
  );

  return query
  select p_order_id, v_old_cycle_id, v_old_cycle_name, p_cycle_id, v_new_cycle_name;
end;
$$;

revoke all on function public.admin_move_order(uuid,uuid,text) from public;
grant execute on function public.admin_move_order(uuid,uuid,text) to authenticated;

-- 4) Cancelar pedido sin borrar físicamente.
create or replace function public.admin_cancel_order(
  p_order_id uuid,
  p_reason text default null
)
returns table (
  order_id uuid,
  previous_status text,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
  v_cancelled_at timestamptz := now();
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

  if v_status not in ('confirmed','reopened') then
    raise exception 'Este pedido no se puede cancelar desde esta herramienta';
  end if;

  delete from public.delivery_items di
  using public.order_items oi
  where oi.order_id = p_order_id
    and di.order_item_id = oi.id;

  update public.orders
  set status = 'cancelled',
      cancelled_at = v_cancelled_at,
      cancelled_by = auth.uid(),
      cancel_reason = v_reason,
      updated_at = v_cancelled_at
  where id = p_order_id;

  insert into public.order_events(order_id, actor_user_id, event_type, note)
  values (p_order_id, auth.uid(), 'cancelled', v_reason);

  return query
  select p_order_id, v_status::text, v_cancelled_at;
end;
$$;

revoke all on function public.admin_cancel_order(uuid,text) from public;
grant execute on function public.admin_cancel_order(uuid,text) to authenticated;

-- 5) Validación de instalación (no modifica datos).
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'admin_get_order_move_cycles',
    'admin_move_order',
    'admin_cancel_order'
  )
order by proname;
