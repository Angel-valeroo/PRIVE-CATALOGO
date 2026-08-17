-- CATALOGO PRIVÉ · S13 USUARIOS V1
-- Ejecutar una sola vez antes de desplegar el módulo.
-- Es idempotente: agrega el estado "inactive" si aún no existe y deja instalada
-- la protección de campos privilegiados de profiles.

begin;

alter type public.account_status add value if not exists 'inactive';

create or replace function public.profiles_protect_privileged_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller_role text;
begin
  caller_role := auth.role();
  if caller_role = 'service_role' then return new; end if;
  if public.current_user_role() = 'admin'::public.user_role then return new; end if;

  if auth.uid() is null or old.id <> auth.uid() or new.id <> old.id then
    raise exception 'No autorizado para modificar este perfil' using errcode = '42501';
  end if;
  if new.role is distinct from old.role then
    raise exception 'No puedes modificar tu propio rol' using errcode = '42501';
  end if;
  if new.status is distinct from old.status then
    raise exception 'No puedes modificar tu propio estado' using errcode = '42501';
  end if;
  if new.parent_distributor_id is distinct from old.parent_distributor_id then
    raise exception 'No puedes modificar tu distribuidor asignado' using errcode = '42501';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'No puedes modificar created_at' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_privileged_fields on public.profiles;
create trigger trg_profiles_protect_privileged_fields
before update on public.profiles
for each row execute function public.profiles_protect_privileged_fields();

commit;

select enumlabel as account_status
from pg_enum e
join pg_type t on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'account_status'
order by e.enumsortorder;

select tgname as trigger_name, tgenabled as enabled
from pg_trigger
where tgrelid = 'public.profiles'::regclass
  and tgname = 'trg_profiles_protect_privileged_fields'
  and not tgisinternal;
