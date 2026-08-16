-- PRIVÉ · Sprint 8 · Carrito móvil persistente V2
-- Compatible con estados: draft / confirmed / reopened
-- Ejecutar en Supabase SQL Editor como postgres.

reset role;

-- 1) Metadatos de reapertura y auditoría.
alter table public.orders
  add column if not exists reopened_at timestamptz,
  add column if not exists reopened_by uuid references public.profiles(id) on delete set null,
  add column if not exists reopen_count integer not null default 0,
  add column if not exists reopen_reason text;

create unique index if not exists orders_one_editable_per_user_idx
  on public.orders (user_id)
  where status in ('draft', 'reopened');

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('confirmed','reopened')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx
  on public.order_events(order_id, created_at desc);

alter table public.order_events enable row level security;
grant select on table public.order_events to authenticated;

drop policy if exists order_events_select_own_or_admin on public.order_events;
create policy order_events_select_own_or_admin
on public.order_events
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_events.order_id
      and (
        o.user_id = auth.uid()
        or public.current_user_role() = 'admin'
      )
  )
);

-- 2) Pedido operativo actual.
-- Regla: si ya existe un pedido confirmado para un corte todavía abierto,
-- NO se crea un nuevo borrador. Solo admin puede reabrir ese mismo pedido.
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
  if v_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

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

  -- Primero recupera el único pedido editable.
  select o.*
  into v_order
  from public.orders o
  where o.user_id = v_uid
    and o.status in ('draft','reopened')
  order by o.updated_at desc
  limit 1;

  -- Si no hay editable, un confirmado cuyo corte aún no cierra sigue siendo
  -- el pedido operativo actual y bloquea uno nuevo.
  if v_order.id is null then
    select o.*
    into v_order
    from public.orders o
    join public.order_cycles oc on oc.id = o.cycle_id
    where o.user_id = v_uid
      and o.status = 'confirmed'
      and oc.active = true
      and oc.cutoff_at >= now()
    order by o.confirmed_at desc nulls last, o.updated_at desc
    limit 1;
  end if;

  -- Solo cuando ya no existe pedido operativo para el corte vigente,
  -- crea un borrador nuevo.
  if v_order.id is null then
    insert into public.orders (user_id, status)
    values (v_uid, 'draft')
    returning * into v_order;
  end if;

  if v_order.cycle_id is not null then
    select * into v_cycle
    from public.order_cycles
    where id = v_order.cycle_id;
  else
    select * into v_cycle
    from public.order_cycles
    where active = true
      and cutoff_at >= now()
    order by cutoff_at asc
    limit 1;
  end if;

  select
    coalesce(sum(oi.quantity), 0)::bigint,
    coalesce(sum(oi.sample_quantity), 0)::bigint
  into v_total_perfumes, v_total_samples
  from public.order_items oi
  where oi.order_id = v_order.id;

  return query
  select
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

-- 3) Líneas del pedido visibles para portal, SIN claves internas.
create or replace function public.get_portal_order_items(p_order_id uuid)
returns table (
  item_id uuid,
  perfume_id uuid,
  perfume_name text,
  designer text,
  category text,
  image_url text,
  quantity integer,
  sample_quantity integer,
  customer_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and (o.user_id = v_uid or public.current_user_role() = 'admin')
  ) then
    raise exception 'No tienes permiso para ver este pedido';
  end if;

  return query
  select
    oi.id,
    oi.perfume_id,
    p.name,
    p.designer,
    p.category,
    p.image_url,
    oi.quantity,
    oi.sample_quantity,
    oi.customer_note
  from public.order_items oi
  join public.perfumes p on p.id = oi.perfume_id
  where oi.order_id = p_order_id
  order by oi.created_at asc;
end;
$$;

revoke all on function public.get_portal_order_items(uuid) from public;
grant execute on function public.get_portal_order_items(uuid) to authenticated;

-- 4) Agregar línea. El mismo perfume puede repetirse para distintas notas/clientes.
create or replace function public.portal_add_order_item(
  p_order_id uuid,
  p_perfume_id uuid,
  p_quantity integer,
  p_sample_quantity integer default 0,
  p_customer_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if coalesce(p_quantity,0) < 1 then raise exception 'La cantidad debe ser mayor a cero'; end if;
  if coalesce(p_sample_quantity,0) < 0 then raise exception 'Las muestras no pueden ser negativas'; end if;

  if not exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.user_id = auth.uid()
      and o.status in ('draft','reopened')
  ) then
    raise exception 'Este pedido no está disponible para edición';
  end if;

  if not exists (
    select 1 from public.perfumes p
    where p.id = p_perfume_id and p.active = true
  ) then
    raise exception 'Perfume no disponible';
  end if;

  insert into public.order_items (
    order_id, perfume_id, quantity, sample_quantity, customer_note
  ) values (
    p_order_id,
    p_perfume_id,
    p_quantity,
    coalesce(p_sample_quantity,0),
    nullif(btrim(coalesce(p_customer_note,'')), '')
  )
  returning id into v_item_id;

  update public.orders set updated_at = now() where id = p_order_id;
  return v_item_id;
end;
$$;

revoke all on function public.portal_add_order_item(uuid,uuid,integer,integer,text) from public;
grant execute on function public.portal_add_order_item(uuid,uuid,integer,integer,text) to authenticated;

-- 5) Editar línea.
create or replace function public.portal_update_order_item(
  p_item_id uuid,
  p_quantity integer,
  p_sample_quantity integer default 0,
  p_customer_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if coalesce(p_quantity,0) < 1 then raise exception 'La cantidad debe ser mayor a cero'; end if;
  if coalesce(p_sample_quantity,0) < 0 then raise exception 'Las muestras no pueden ser negativas'; end if;

  select oi.order_id into v_order_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_item_id
    and o.user_id = auth.uid()
    and o.status in ('draft','reopened');

  if v_order_id is null then
    raise exception 'Esta línea no está disponible para edición';
  end if;

  update public.order_items
  set quantity = p_quantity,
      sample_quantity = coalesce(p_sample_quantity,0),
      customer_note = nullif(btrim(coalesce(p_customer_note,'')), ''),
      updated_at = now()
  where id = p_item_id;

  update public.orders set updated_at = now() where id = v_order_id;
end;
$$;

revoke all on function public.portal_update_order_item(uuid,integer,integer,text) from public;
grant execute on function public.portal_update_order_item(uuid,integer,integer,text) to authenticated;

-- 6) Eliminar línea.
create or replace function public.portal_delete_order_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;

  select oi.order_id into v_order_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_item_id
    and o.user_id = auth.uid()
    and o.status in ('draft','reopened');

  if v_order_id is null then
    raise exception 'Esta línea no está disponible para eliminar';
  end if;

  delete from public.order_items where id = p_item_id;
  update public.orders set updated_at = now() where id = v_order_id;
end;
$$;

revoke all on function public.portal_delete_order_item(uuid) from public;
grant execute on function public.portal_delete_order_item(uuid) to authenticated;

-- 7) Confirmación: acepta pedido abierto o reabierto.
create sequence if not exists public.order_folio_seq;

create or replace function public.confirm_order(p_order_id uuid)
returns table (order_id uuid, folio text, cycle_id uuid, confirmed_at timestamptz)
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
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;

  select o.user_id, o.status, o.cycle_id, o.folio
  into v_user_id, v_status, v_existing_cycle, v_existing_folio
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_user_id is null then raise exception 'Pedido no encontrado'; end if;
  if v_user_id <> auth.uid() then raise exception 'No tienes permiso para confirmar este pedido'; end if;
  if v_status not in ('draft','reopened') then raise exception 'Este pedido ya fue confirmado'; end if;

  if not exists (select 1 from public.order_items oi where oi.order_id = p_order_id) then
    raise exception 'No puedes confirmar un pedido vacío';
  end if;

  -- Si es reabierto, conserva su ciclo original siempre que siga abierto.
  if v_status = 'reopened' and v_existing_cycle is not null then
    select oc.id, oc.order_day
    into v_cycle_id, v_order_day
    from public.order_cycles oc
    where oc.id = v_existing_cycle
      and oc.active = true
      and oc.cutoff_at >= v_confirmed_at;

    if v_cycle_id is null then
      raise exception 'El corte original ya cerró; no se puede volver a confirmar este pedido';
    end if;
  else
    select oc.id, oc.order_day
    into v_cycle_id, v_order_day
    from public.order_cycles oc
    where oc.active = true
      and oc.cutoff_at >= v_confirmed_at
    order by oc.cutoff_at asc
    limit 1;
  end if;

  if v_cycle_id is null then raise exception 'No hay un próximo corte de pedido configurado'; end if;

  v_folio := coalesce(
    v_existing_folio,
    'PRV-' || to_char(v_order_day,'YYYYMMDD') || '-' || lpad(nextval('public.order_folio_seq')::text,6,'0')
  );

  update public.orders
  set cycle_id = v_cycle_id,
      status = 'confirmed',
      folio = v_folio,
      confirmed_at = v_confirmed_at,
      updated_at = v_confirmed_at
  where id = p_order_id;

  insert into public.order_events(order_id, actor_user_id, event_type)
  values (p_order_id, auth.uid(), 'confirmed');

  return query select p_order_id, v_folio, v_cycle_id, v_confirmed_at;
end;
$$;

revoke all on function public.confirm_order(uuid) from public;
grant execute on function public.confirm_order(uuid) to authenticated;

-- 8) Reapertura exclusiva para admin antes del cierre del corte.
create or replace function public.admin_reopen_order(
  p_order_id uuid,
  p_reason text default null
)
returns table (
  order_id uuid,
  status public.order_status,
  reopened_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_status public.order_status;
  v_cycle_id uuid;
  v_reopened_at timestamptz := now();
begin
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;

  select o.user_id, o.status, o.cycle_id
  into v_user_id, v_status, v_cycle_id
  from public.orders o
  where o.id = p_order_id
  for update;

  if v_user_id is null then raise exception 'Pedido no encontrado'; end if;
  if v_status <> 'confirmed' then raise exception 'Solo se puede reabrir un pedido cerrado'; end if;

  if not exists (
    select 1 from public.order_cycles oc
    where oc.id = v_cycle_id
      and oc.active = true
      and oc.cutoff_at >= now()
  ) then
    raise exception 'El corte de este pedido ya cerró';
  end if;

  if exists (
    select 1 from public.orders o
    where o.user_id = v_user_id
      and o.id <> p_order_id
      and o.status in ('draft','reopened')
  ) then
    raise exception 'El usuario ya tiene otro pedido editable';
  end if;

  update public.orders
  set status = 'reopened',
      reopened_at = v_reopened_at,
      reopened_by = auth.uid(),
      reopen_count = reopen_count + 1,
      reopen_reason = nullif(btrim(coalesce(p_reason,'')), ''),
      updated_at = v_reopened_at
  where id = p_order_id;

  insert into public.order_events(order_id, actor_user_id, event_type, note)
  values (p_order_id, auth.uid(), 'reopened', nullif(btrim(coalesce(p_reason,'')), ''));

  return query select p_order_id, 'reopened'::public.order_status, v_reopened_at;
end;
$$;

revoke all on function public.admin_reopen_order(uuid,text) from public;
grant execute on function public.admin_reopen_order(uuid,text) to authenticated;

-- 9) Comprobaciones rápidas.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'get_portal_current_order',
    'get_portal_order_items',
    'portal_add_order_item',
    'portal_update_order_item',
    'portal_delete_order_item',
    'confirm_order',
    'admin_reopen_order'
  )
order by proname;
