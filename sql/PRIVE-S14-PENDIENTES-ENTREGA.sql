-- CATALOGO PRIVE · S14 V1 · Pendientes de entrega
-- Ejecutar en Supabase SQL Editor como postgres.
-- No modifica pedidos ni order_items: solo agrega seguimiento logistico temporal.

begin;

create table if not exists public.delivery_cycles (
  cycle_id uuid primary key references public.order_cycles(id) on delete cascade,
  activated_at timestamptz not null default now(),
  activated_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.delivery_items (
  order_item_id uuid primary key references public.order_items(id) on delete cascade,
  delivered_at timestamptz not null default now(),
  delivered_by uuid references public.profiles(id) on delete set null
);

create index if not exists delivery_cycles_archived_idx
  on public.delivery_cycles (archived_at, activated_at desc);

alter table public.delivery_cycles enable row level security;
alter table public.delivery_items enable row level security;

-- Las tablas no se exponen directamente al navegador. Todo pasa por RPC admin-only.
revoke all on table public.delivery_cycles from anon, authenticated;
revoke all on table public.delivery_items from anon, authenticated;

create or replace function public.assert_active_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Acceso exclusivo para administrador';
  end if;
end;
$$;
revoke all on function public.assert_active_admin() from public;

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
  select
    oc.id,
    oc.name,
    oc.cutoff_at,
    oc.order_day,
    count(distinct o.id)::bigint,
    count(oi.id)::bigint,
    coalesce(sum(oi.quantity),0)::bigint,
    coalesce(sum(oi.sample_quantity),0)::bigint,
    count(di.order_item_id)::bigint,
    (count(oi.id) - count(di.order_item_id))::bigint,
    dc.activated_at,
    dc.archived_at
  from public.order_cycles oc
  join public.orders o
    on o.cycle_id = oc.id
   and o.status = 'confirmed'
  join public.order_items oi on oi.order_id = o.id
  left join public.delivery_items di on di.order_item_id = oi.id
  left join public.delivery_cycles dc on dc.cycle_id = oc.id
  group by oc.id, oc.name, oc.cutoff_at, oc.order_day, dc.activated_at, dc.archived_at
  order by coalesce(dc.activated_at, oc.cutoff_at) desc nulls last;
end;
$$;
revoke all on function public.admin_get_delivery_cycles() from public;
grant execute on function public.admin_get_delivery_cycles() to authenticated;

create or replace function public.admin_activate_delivery_cycle(p_cycle_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_active_admin();

  if not exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.cycle_id = p_cycle_id
      and o.status = 'confirmed'
  ) then
    raise exception 'Este corte no tiene pedidos confirmados para entregar';
  end if;

  insert into public.delivery_cycles(cycle_id, activated_at, activated_by, archived_at, archived_by)
  values (p_cycle_id, now(), auth.uid(), null, null)
  on conflict (cycle_id) do update
    set activated_at = case when delivery_cycles.archived_at is null then delivery_cycles.activated_at else now() end,
        activated_by = case when delivery_cycles.archived_at is null then delivery_cycles.activated_by else auth.uid() end,
        archived_at = null,
        archived_by = null;
end;
$$;
revoke all on function public.admin_activate_delivery_cycle(uuid) from public;
grant execute on function public.admin_activate_delivery_cycle(uuid) to authenticated;

create or replace function public.admin_get_delivery_items(p_cycle_id uuid)
returns table (
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
    oi.id,
    o.id,
    o.folio,
    o.confirmed_at,
    o.user_id,
    pr.full_name,
    pr.alias,
    p.id,
    p.name,
    pk.code,
    oi.presentation,
    oi.quantity,
    oi.sample_quantity,
    oi.customer_note,
    (di.order_item_id is not null),
    di.delivered_at
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.profiles pr on pr.id = o.user_id
  join public.perfumes p on p.id = oi.perfume_id
  join public.perfume_keys pk on pk.perfume_id = p.id
  left join public.delivery_items di on di.order_item_id = oi.id
  where o.cycle_id = p_cycle_id
    and o.status = 'confirmed'
  order by p.name, oi.presentation nulls first, coalesce(pr.alias, pr.full_name), oi.created_at;
end;
$$;
revoke all on function public.admin_get_delivery_items(uuid) from public;
grant execute on function public.admin_get_delivery_items(uuid) to authenticated;

create or replace function public.admin_set_delivery_item(
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

  if coalesce(p_delivered,false) then
    insert into public.delivery_items(order_item_id, delivered_at, delivered_by)
    values (p_order_item_id, now(), auth.uid())
    on conflict (order_item_id) do update
      set delivered_at = excluded.delivered_at,
          delivered_by = excluded.delivered_by;
  else
    delete from public.delivery_items where order_item_id = p_order_item_id;
  end if;
end;
$$;
revoke all on function public.admin_set_delivery_item(uuid,boolean) from public;
grant execute on function public.admin_set_delivery_item(uuid,boolean) to authenticated;

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
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  left join public.delivery_items di on di.order_item_id = oi.id
  where o.cycle_id = p_cycle_id
    and o.status = 'confirmed'
    and di.order_item_id is null;

  if v_pending > 0 then
    raise exception 'Todavia hay % entrega(s) pendiente(s)', v_pending;
  end if;

  -- Para no acumular seguimiento por linea, al archivar se limpian los marcadores.
  -- El pedido original y sus notas permanecen intactos en orders/order_items.
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

-- VALIDACION. Deben aparecer las 4 funciones del modulo y las 2 tablas.
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'admin_get_delivery_cycles',
    'admin_activate_delivery_cycle',
    'admin_get_delivery_items',
    'admin_set_delivery_item',
    'admin_archive_delivery_cycle'
  )
order by proname;

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('delivery_cycles','delivery_items')
order by tablename;
