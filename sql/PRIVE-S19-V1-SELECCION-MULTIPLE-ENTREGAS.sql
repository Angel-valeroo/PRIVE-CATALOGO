-- CATALOGO PRIVÉ · S19 V1 · Selección múltiple en Pendientes de entrega
-- Ejecutar una sola vez en Supabase SQL Editor ANTES de publicar admin/index.html y admin/admin.js de S19.
-- Agrega un RPC atómico para marcar varias asignaciones en una sola llamada.

begin;

create or replace function public.admin_set_delivery_items(
  p_delivery_keys text[],
  p_order_item_ids uuid[],
  p_delivered boolean
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_i integer;
  v_cycle_id uuid;
  v_first_cycle_id uuid := null;
  v_delivered_at timestamptz := now();
begin
  perform public.assert_active_admin();

  v_count := coalesce(cardinality(p_delivery_keys), 0);
  if v_count = 0 then
    raise exception 'Seleccion vacia';
  end if;

  if cardinality(p_order_item_ids) is distinct from v_count then
    raise exception 'Las listas de entregas no coinciden';
  end if;

  if v_count > 250 then
    raise exception 'Demasiadas entregas en una sola operacion';
  end if;

  if (select count(distinct x) from unnest(p_delivery_keys) as t(x)) <> v_count then
    raise exception 'La seleccion contiene entregas duplicadas';
  end if;

  -- Validar cada pareja key/order_item antes de escribir nada.
  -- Toda la función corre en una sola transacción: si una asignación falla, no se marca ninguna.
  for v_i in 1..v_count loop
    if nullif(trim(p_delivery_keys[v_i]), '') is null or p_order_item_ids[v_i] is null then
      raise exception 'Asignacion de entrega incompleta';
    end if;

    v_cycle_id := null;
    select o.cycle_id into v_cycle_id
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.id = p_order_item_ids[v_i]
      and o.status = 'confirmed';

    if v_cycle_id is null then
      raise exception 'Linea de pedido confirmada no encontrada';
    end if;

    if v_first_cycle_id is null then
      v_first_cycle_id := v_cycle_id;
    elsif v_first_cycle_id <> v_cycle_id then
      raise exception 'La seleccion mezcla cortes distintos';
    end if;

    if not exists (
      select 1
      from public.delivery_cycles dc
      where dc.cycle_id = v_cycle_id
        and dc.archived_at is null
    ) then
      raise exception 'El ciclo de entregas no esta activo';
    end if;

    if not exists (
      select 1
      from public.admin_delivery_assignments(v_cycle_id) a
      where a.delivery_key = p_delivery_keys[v_i]
        and a.order_item_id = p_order_item_ids[v_i]
    ) then
      raise exception 'Asignacion de entrega no valida';
    end if;
  end loop;

  if coalesce(p_delivered, false) then
    insert into public.delivery_items(order_item_id, assignment_key, delivered_at, delivered_by)
    select ids.order_item_id, keys.delivery_key, v_delivered_at, auth.uid()
    from unnest(p_delivery_keys) with ordinality as keys(delivery_key, ord)
    join unnest(p_order_item_ids) with ordinality as ids(order_item_id, ord) using (ord)
    on conflict (assignment_key) do update
      set delivered_at = excluded.delivered_at,
          delivered_by = excluded.delivered_by,
          order_item_id = excluded.order_item_id;
  else
    delete from public.delivery_items di
    using unnest(p_delivery_keys) with ordinality as keys(delivery_key, ord)
    join unnest(p_order_item_ids) with ordinality as ids(order_item_id, ord) using (ord)
    where di.assignment_key = keys.delivery_key
      and di.order_item_id = ids.order_item_id;
  end if;

  return v_count;
end;
$$;

revoke all on function public.admin_set_delivery_items(text[],uuid[],boolean) from public;
grant execute on function public.admin_set_delivery_items(text[],uuid[],boolean) to authenticated;

commit;

-- VALIDACIÓN: debe devolver una fila con el nombre de la función.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'admin_set_delivery_items';
