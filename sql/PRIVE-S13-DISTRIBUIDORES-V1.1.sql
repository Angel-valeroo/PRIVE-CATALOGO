-- CATALOGO PRIVÉ · S13 Distribuidores V1.1
-- Simplifica el modelo de cuentas: solo Administrador y Distribuidor.
-- No elimina valores del enum para no romper historial ni dependencias existentes.

begin;

-- Las cuentas que antes se llamaban reseller pasan a ser distribuidores directos de PRIVÉ.
update public.profiles
set role = 'distributor'::public.user_role,
    parent_distributor_id = null,
    updated_at = now()
where role = 'reseller'::public.user_role;

-- Ya no existe jerarquía de distribuidores/revendedores en el modelo operativo.
update public.profiles
set parent_distributor_id = null,
    updated_at = now()
where parent_distributor_id is not null;

-- Mantener los permisos requeridos por el panel/Edge Function administrativa.
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

commit;

-- Validación: debe devolver solo admin y distributor (si hay cuentas).
select role, count(*) as cuentas
from public.profiles
group by role
order by role;

-- Validación: ninguna cuenta debe conservar distribuidor asignado.
select count(*) as cuentas_con_distribuidor_asignado
from public.profiles
where parent_distributor_id is not null;
