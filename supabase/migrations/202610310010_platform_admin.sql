-- Belaura · panel de administración de la plataforma (#/admin)
-- Lets the app owner see income and users and give permissions, in two areas:
--   · Cursos (the academy): students, sales, course access granted by hand.
--   · Gestor (the centers manager): centers, their teams and member roles.
-- Every function checks the caller's platform role, so the browser never needs the service role.

-- ───────────────────────── Platform admins ─────────────────────────
-- owner: everything, including adding or removing admins. courses / manager: only that area.
create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'courses', 'manager')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;

-- ───────────────────────── Academy payments ─────────────────────────
-- One row per charge Stripe confirms (first purchase and each subscription renewal). Written only
-- by api/stripe-webhook.ts with the service role; read only through the admin functions below.
create table public.academy_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product text not null,
  kind text not null check (kind in ('purchase', 'renewal')),
  amount_cents int not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR',
  stripe_ref text not null unique,
  created_at timestamptz not null default now()
);
create index academy_payments_created_idx on public.academy_payments(created_at);
create index academy_payments_user_idx on public.academy_payments(user_id);
alter table public.academy_payments enable row level security;
revoke all on public.academy_payments from anon, authenticated;

-- Access given by hand from the panel (gifts, staff, refunds handled outside Stripe…).
alter table public.academy_entitlements
  add column granted_by uuid references auth.users(id) on delete set null,
  add column note text check (note is null or length(note) <= 200);

-- ───────────────────────── Helpers ─────────────────────────
create or replace function public.platform_role()
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select role from public.platform_admins where user_id = auth.uid();
$$;

create or replace function public._require_platform(p_area text)
returns void language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_role text := public.platform_role();
begin
  if v_role is null or (v_role <> 'owner' and v_role <> p_area) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

-- ───────────────────────── Cursos ─────────────────────────
create or replace function public.admin_academy_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
declare v jsonb;
begin
  perform public._require_platform('courses');
  select jsonb_build_object(
    'students', (select count(*) from auth.users),
    'new_students_30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'active_7d', (select count(*) from public.academy_progress where updated_at > now() - interval '7 days'),
    'paying_students', (select count(distinct user_id) from public.academy_entitlements where active and granted_by is null and (expires_at is null or expires_at > now())),
    'active_subscriptions', (select count(*) from public.academy_entitlements where active and product in ('monthly', 'yearly') and (expires_at is null or expires_at > now())),
    'revenue_total_cents', (select coalesce(sum(amount_cents), 0) from public.academy_payments),
    'revenue_30d_cents', (select coalesce(sum(amount_cents), 0) from public.academy_payments where created_at > now() - interval '30 days'),
    'revenue_today_cents', (select coalesce(sum(amount_cents), 0) from public.academy_payments where created_at >= date_trunc('day', now())),
    'sales_total', (select count(*) from public.academy_payments),
    'by_month', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'), 'cents', coalesce(s.cents, 0), 'sales', coalesce(s.sales, 0)) order by m)
        from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
        left join (select date_trunc('month', created_at) mo, sum(amount_cents) cents, count(*) sales from public.academy_payments group by 1) s on s.mo = m
    ), '[]'::jsonb),
    'by_product', coalesce((
      select jsonb_agg(jsonb_build_object('product', product, 'cents', cents, 'sales', sales) order by cents desc)
        from (select product, sum(amount_cents) cents, count(*) sales from public.academy_payments group by product) p
    ), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object('at', p.created_at, 'email', u.email, 'product', p.product, 'kind', p.kind, 'cents', p.amount_cents, 'currency', p.currency) order by p.created_at desc)
        from (select * from public.academy_payments order by created_at desc limit 10) p
        left join auth.users u on u.id = p.user_id
    ), '[]'::jsonb)
  ) into v;
  return v;
end $$;

create or replace function public.admin_list_users(p_search text default null, p_limit int default 100)
returns table (user_id uuid, email text, full_name text, created_at timestamptz, last_sign_in_at timestamptz,
               products text[], points int, courses_started int, courses_done int, spent_cents bigint,
               platform_role text, centers text[])
language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
begin
  if public.platform_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select u.id, u.email::text, pr.full_name, u.created_at, u.last_sign_in_at,
           coalesce((select array_agg(distinct e.product order by e.product) from public.academy_entitlements e
                      where e.user_id = u.id and e.active and (e.expires_at is null or e.expires_at > now())), '{}'),
           coalesce((ap.progress ->> 'points')::int, 0),
           coalesce((select count(*)::int from jsonb_each(coalesce(ap.progress -> 'courses', '{}'::jsonb))), 0),
           coalesce((select count(*)::int from jsonb_each(coalesce(ap.progress -> 'courses', '{}'::jsonb)) c where (c.value ->> 'done')::boolean), 0),
           coalesce((select sum(p.amount_cents) from public.academy_payments p where p.user_id = u.id), 0)::bigint,
           pa.role,
           coalesce((select array_agg(c.name order by c.name) from public.center_members m join public.centers c on c.id = m.center_id
                      where m.user_id = u.id and m.active), '{}')
      from auth.users u
      left join public.profiles pr on pr.id = u.id
      left join public.academy_progress ap on ap.user_id = u.id
      left join public.platform_admins pa on pa.user_id = u.id
     where p_search is null or p_search = ''
        or u.email ilike '%' || p_search || '%' or pr.full_name ilike '%' || p_search || '%'
     order by u.created_at desc
     limit least(greatest(coalesce(p_limit, 100), 1), 500);
end $$;

create or replace function public.admin_user_entitlements(p_user uuid)
returns table (id uuid, product text, active boolean, expires_at timestamptz, source text, note text, created_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public._require_platform('courses');
  return query
    select e.id, e.product, e.active, e.expires_at,
           case when e.granted_by is null then 'stripe' else 'manual' end, e.note, e.created_at
      from public.academy_entitlements e where e.user_id = p_user order by e.created_at desc;
end $$;

create or replace function public.admin_grant_product(p_user uuid, p_product text, p_expires_at timestamptz default null, p_note text default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  perform public._require_platform('courses');
  if p_product is null or p_product !~ '^[a-z0-9-]{2,40}$' then raise exception 'invalid_product' using errcode = '22023'; end if;
  if not exists (select 1 from auth.users where id = p_user) then raise exception 'user_not_found' using errcode = 'P0001'; end if;
  insert into public.academy_entitlements(user_id, product, active, expires_at, granted_by, note)
  values (p_user, p_product, true, p_expires_at, auth.uid(), nullif(left(trim(coalesce(p_note, '')), 200), ''))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.admin_set_entitlement_active(p_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public._require_platform('courses');
  update public.academy_entitlements set active = p_active, updated_at = now() where id = p_id;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
end $$;

-- ───────────────────────── Gestor ─────────────────────────
create or replace function public.admin_manager_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
declare v jsonb;
begin
  perform public._require_platform('manager');
  select jsonb_build_object(
    'centers', (select count(*) from public.centers),
    'new_centers_30d', (select count(*) from public.centers where created_at > now() - interval '30 days'),
    'members', (select count(*) from public.center_members where active),
    'clients', (select count(*) from public.clients where anonymized_at is null),
    'appointments_30d', (select count(*) from public.appointments where starts_at > now() - interval '30 days' and starts_at <= now()),
    'list', coalesce((
      select jsonb_agg(row_to_json(x)::jsonb order by x.created_at desc) from (
        select c.id, c.name, c.slug, c.currency, c.created_at,
               (select u.email from public.center_members m join auth.users u on u.id = m.user_id
                 where m.center_id = c.id and m.role = 'owner' and m.active order by m.created_at limit 1) owner_email,
               (select count(*) from public.center_members m where m.center_id = c.id and m.active) members,
               (select count(*) from public.clients cl where cl.center_id = c.id and cl.anonymized_at is null) clients,
               (select count(*) from public.appointments a where a.center_id = c.id and a.starts_at > now() - interval '30 days' and a.starts_at <= now()) appointments_30d,
               (select max(a.created_at) from public.appointments a where a.center_id = c.id) last_activity,
               (select coalesce(sum(case when p.kind = 'refund' then -p.amount_cents else p.amount_cents end), 0)
                  from public.payments p where p.center_id = c.id and p.status = 'paid' and p.created_at > now() - interval '30 days') takings_30d_cents
          from public.centers c) x
    ), '[]'::jsonb)
  ) into v;
  return v;
end $$;

create or replace function public.admin_center_members(p_center uuid)
returns table (user_id uuid, email text, full_name text, role public.center_role, active boolean, joined_at timestamptz)
language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
begin
  perform public._require_platform('manager');
  return query
    select m.user_id, u.email::text, p.full_name, m.role, m.active, m.created_at
      from public.center_members m join auth.users u on u.id = m.user_id
      left join public.profiles p on p.id = m.user_id
     where m.center_id = p_center order by m.created_at;
end $$;

create or replace function public.admin_set_member(p_center uuid, p_user uuid, p_role public.center_role, p_active boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_current public.center_members;
begin
  perform public._require_platform('manager');
  select * into v_current from public.center_members where center_id = p_center and user_id = p_user for update;
  if v_current.user_id is null then raise exception 'member_not_found' using errcode = 'P0001'; end if;
  if v_current.role = 'owner' and v_current.active and (p_role <> 'owner' or not p_active)
     and (select count(*) from public.center_members where center_id = p_center and role = 'owner' and active) <= 1 then
    raise exception 'last_owner' using errcode = 'P0001';
  end if;
  update public.center_members set role = p_role, active = p_active where center_id = p_center and user_id = p_user;
end $$;

-- ───────────────────────── Admins (owner only) ─────────────────────────
create or replace function public.admin_set_platform_role(p_email text, p_role text)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare v_user uuid;
begin
  perform public._require_platform('owner');
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then raise exception 'user_not_found' using errcode = 'P0001'; end if;
  if p_role is not null and p_role not in ('owner', 'courses', 'manager') then raise exception 'invalid_role' using errcode = '22023'; end if;
  if exists (select 1 from public.platform_admins where user_id = v_user and role = 'owner')
     and (p_role is null or p_role <> 'owner')
     and (select count(*) from public.platform_admins where role = 'owner') <= 1 then
    raise exception 'last_owner' using errcode = 'P0001';
  end if;
  if p_role is null then
    delete from public.platform_admins where user_id = v_user;
  else
    insert into public.platform_admins(user_id, role, granted_by) values (v_user, p_role, auth.uid())
    on conflict (user_id) do update set role = excluded.role, granted_by = excluded.granted_by;
  end if;
end $$;

create or replace function public.admin_list_admins()
returns table (user_id uuid, email text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
begin
  if public.platform_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select a.user_id, u.email::text, a.role, a.created_at
    from public.platform_admins a join auth.users u on u.id = a.user_id order by a.created_at;
end $$;

-- ───────────────────────── Grants ─────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'public.platform_role()', 'public._require_platform(text)', 'public.admin_academy_overview()',
    'public.admin_list_users(text,int)', 'public.admin_user_entitlements(uuid)',
    'public.admin_grant_product(uuid,text,timestamptz,text)', 'public.admin_set_entitlement_active(uuid,boolean)',
    'public.admin_manager_overview()', 'public.admin_center_members(uuid)',
    'public.admin_set_member(uuid,uuid,public.center_role,boolean)', 'public.admin_set_platform_role(text,text)',
    'public.admin_list_admins()'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
revoke execute on function public._require_platform(text) from authenticated;

-- The first owner is added once by hand in the SQL editor (see supabase/README.md):
--   insert into public.platform_admins(user_id, role) select id, 'owner' from auth.users where email = '<tu correo>';
