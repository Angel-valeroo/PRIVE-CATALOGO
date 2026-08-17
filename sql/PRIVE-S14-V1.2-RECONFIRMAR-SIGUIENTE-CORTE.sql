-- CATALOGO PRIVÉ · S14 V1.2
-- Corrección: volver a confirmar un pedido reabierto cuando su corte original ya cerró.
--
-- Regla:
-- 1) Si el corte original todavía está abierto, el pedido conserva ese corte.
-- 2) Si el corte original ya cerró, el pedido pasa automáticamente al próximo corte activo.
-- 3) Si cambia de corte, se eliminan únicamente marcas logísticas temporales de delivery_items
--    asociadas a ese pedido, para no arrastrar un "entregado" del corte anterior.
-- 4) El pedido, sus líneas, notas y folio permanecen; no se duplica el pedido.

begin;

create or replace function public.confirm_order(p_order_id uuid)
returns table (
  order_id uuid,
  folio text,
  cycle_id uuid,
  confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_status public.order_status;
  v_existing_cycle uuid;
  v_existing_folio text;
  v_cycle_id uuid;
  v_order_day date;
  v_folio text;
  v_confirmed_at timestamptz := now();
  v_moved_cycle boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  select o.user_id, o.status, o.cycle_id, o.folio
  into v_user_id, v_status, v_existing_cycle, v_existing_folio
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_user_id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_user_id <> auth.uid() then
    raise exception 'No tienes permiso para confirmar este pedido';
  end if;

  if v_status not in ('draft','reopened') then
    raise exception 'Este pedido ya fue confirmado';
  end if;

  if not exists (
    select 1
    from public.order_items oi
    where oi.order_id = p_order_id
  ) then
    raise exception 'No puedes confirmar un pedido vacío';
  end if;

  -- Pedido reabierto: intenta primero conservar el corte original.
  if v_status = 'reopened' and v_existing_cycle is not null then
    select oc.id, oc.order_day
    into v_cycle_id, v_order_day
    from public.order_cycles oc
    where oc.id = v_existing_cycle
      and oc.active = true
      and oc.cutoff_at >= v_confirmed_at;

    -- Si el corte original ya cerró, se mueve al siguiente corte disponible.
    if v_cycle_id is null then
      select oc.id, oc.order_day
      into v_cycle_id, v_order_day
      from public.order_cycles oc
      where oc.active = true
        and oc.cutoff_at >= v_confirmed_at
      order by oc.cutoff_at asc
      limit 1;

      v_moved_cycle := v_cycle_id is not null
                       and v_cycle_id is distinct from v_existing_cycle;
    end if;
  else
    -- Pedido nuevo/borrador: usa el próximo corte activo.
    select oc.id, oc.order_day
    into v_cycle_id, v_order_day
    from public.order_cycles oc
    where oc.active = true
      and oc.cutoff_at >= v_confirmed_at
    order by oc.cutoff_at asc
    limit 1;
  end if;

  if v_cycle_id is null then
    raise exception 'No hay un próximo corte de pedido configurado';
  end if;

  -- Conservamos el folio del mismo pedido para mantener identidad y auditoría.
  v_folio := coalesce(
    v_existing_folio,
    'PRV-' || to_char(v_order_day,'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_folio_seq')::text,6,'0')
  );

  -- Si el pedido cambia de corte, cualquier marca logística del corte anterior
  -- deja de ser válida. Solo limpiamos delivery_items; orders/order_items no se tocan.
  if v_moved_cycle and to_regclass('public.delivery_items') is not null then
    delete from public.delivery_items di
    where di.order_item_id in (
      select oi.id
      from public.order_items oi
      where oi.order_id = p_order_id
    );
  end if;

  update public.orders
  set cycle_id = v_cycle_id,
      status = 'confirmed',
      folio = v_folio,
      confirmed_at = v_confirmed_at,
      updated_at = v_confirmed_at
  where id = p_order_id;

  insert into public.order_events(
    order_id,
    actor_user_id,
    event_type,
    note
  )
  values (
    p_order_id,
    auth.uid(),
    'confirmed',
    case
      when v_moved_cycle
        then 'Pedido reabierto reconfirmado y reasignado automáticamente al siguiente corte'
      else null
    end
  );

  return query
  select p_order_id, v_folio, v_cycle_id, v_confirmed_at;
end;
$$;

revoke all on function public.confirm_order(uuid) from public;
grant execute on function public.confirm_order(uuid) to authenticated;

commit;

-- VALIDACIÓN: debe devolver confirm_order.
select
  p.proname,
  pg_get_function_arguments(p.oid) as argumentos
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'confirm_order';
