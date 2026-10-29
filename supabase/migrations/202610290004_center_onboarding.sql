-- Secure first-center provisioning for Aula Estética.
-- Apply after 202610290002_manager_auth_tenant.sql.
-- The caller must be authenticated; each authenticated user may create their own first center.
create or replace function public.create_my_first_center(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_center_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(p_name)) > 140 then
    raise exception 'invalid_center_name' using errcode = '22023';
  end if;
  if exists (select 1 from public.center_members where user_id = v_user_id and active) then
    raise exception 'user_already_belongs_to_a_center' using errcode = '23505';
  end if;

  insert into public.centers(name, created_by)
  values (trim(p_name), v_user_id)
  returning id into v_center_id;

  insert into public.center_members(center_id, user_id, role, active)
  values (v_center_id, v_user_id, 'owner', true);

  return v_center_id;
end;
$$;
revoke all on function public.create_my_first_center(text) from public, anon;
grant execute on function public.create_my_first_center(text) to authenticated;
