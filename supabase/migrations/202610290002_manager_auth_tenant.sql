-- Aula Estética Manager · tenant/auth foundation
-- Apply only in a disposable Supabase project first. Review with security lead before production.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.center_role as enum ('owner','admin','reception','professional');
create type public.booking_status as enum ('pending','confirmed','completed','cancelled','no_show');

create table public.centers (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 140),
 timezone text not null default 'Europe/Madrid',
 currency char(3) not null default 'EUR',
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table public.center_members (
 center_id uuid not null references public.centers(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.center_role not null default 'professional',
 active boolean not null default true,
 created_at timestamptz not null default now(),
 primary key(center_id,user_id)
);
create index center_members_user_idx on public.center_members(user_id) where active;

create function public.is_center_member(p_center uuid)
returns boolean language sql stable security definer
set search_path=public,pg_temp
as $$ select exists(select 1 from public.center_members m where m.center_id=p_center and m.user_id=auth.uid() and m.active); $$;
create function public.has_center_role(p_center uuid, p_roles public.center_role[])
returns boolean language sql stable security definer
set search_path=public,pg_temp
as $$ select exists(select 1 from public.center_members m where m.center_id=p_center and m.user_id=auth.uid() and m.active and m.role=any(p_roles)); $$;
revoke all on function public.is_center_member(uuid) from public;
revoke all on function public.has_center_role(uuid,public.center_role[]) from public;
grant execute on function public.is_center_member(uuid),public.has_center_role(uuid,public.center_role[]) to authenticated;

create table public.locations (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 name text not null, address text, timezone text not null default 'Europe/Madrid', active boolean not null default true,
 created_at timestamptz not null default now(), unique(center_id,id)
);
create table public.staff (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null, display_name text not null,
 email text, phone text, active boolean not null default true, created_at timestamptz not null default now(),
 unique(center_id,id)
);
create index staff_user_idx on public.staff(user_id);
create table public.clients (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 name text not null, phone text, email text, operational_notes text,
 marketing_consent_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(center_id,id)
);
create index clients_center_name_idx on public.clients(center_id,name);
create table public.services (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 name text not null, duration_minutes int not null check(duration_minutes between 5 and 600),
 price_cents int not null check(price_cents>=0), buffer_minutes int not null default 0 check(buffer_minutes between 0 and 240),
 active boolean not null default true, created_at timestamptz not null default now(), unique(center_id,id)
);
create table public.appointments (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 location_id uuid, client_id uuid not null, service_id uuid not null, staff_id uuid not null,
 starts_at timestamptz not null, ends_at timestamptz not null, status public.booking_status not null default 'pending',
 service_name_snapshot text not null, duration_snapshot_minutes int not null, price_snapshot_cents int not null,
 notes text, created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 time_span tstzrange generated always as (tstzrange(starts_at,ends_at,'[)')) stored,
 check(ends_at>starts_at), check(duration_snapshot_minutes>0), check(price_snapshot_cents>=0),
 foreign key(center_id,location_id) references public.locations(center_id,id),
 foreign key(center_id,client_id) references public.clients(center_id,id),
 foreign key(center_id,service_id) references public.services(center_id,id),
 foreign key(center_id,staff_id) references public.staff(center_id,id)
);
-- Enforce no simultaneous active appointment for one staff member.
alter table public.appointments add constraint appointment_staff_no_overlap
 exclude using gist (staff_id with =, time_span with &&)
 where (status in ('pending','confirmed'));
create index appointments_center_starts_idx on public.appointments(center_id,starts_at);
create table public.appointment_events (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 appointment_id uuid not null, actor_id uuid references auth.users(id), event_type text not null,
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 foreign key(center_id,appointment_id) references public.appointments(center_id,id)
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), center_id uuid not null references public.centers(id) on delete cascade,
 appointment_id uuid, amount_cents int not null check(amount_cents>=0), currency char(3) not null default 'EUR',
 method text not null check(method in ('cash','card','transfer','online','other')),
 status text not null check(status in ('pending','paid','refunded','failed')),
 provider_reference text, recorded_by uuid references auth.users(id), created_at timestamptz not null default now(),
 foreign key(center_id,appointment_id) references public.appointments(center_id,id)
);

alter table public.centers enable row level security;
alter table public.center_members enable row level security;
alter table public.locations enable row level security;
alter table public.staff enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_events enable row level security;
alter table public.payments enable row level security;

create policy center_select on public.centers for select to authenticated using(public.is_center_member(id));
create policy member_select on public.center_members for select to authenticated using(public.is_center_member(center_id));
create policy location_select on public.locations for select to authenticated using(public.is_center_member(center_id));
create policy staff_select on public.staff for select to authenticated using(public.is_center_member(center_id));
create policy clients_read on public.clients for select to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]));
create policy clients_write on public.clients for all to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[])) with check(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]));
create policy services_read on public.services for select to authenticated using(public.is_center_member(center_id));
create policy services_manage on public.services for all to authenticated using(public.has_center_role(center_id,array['owner','admin']::public.center_role[])) with check(public.has_center_role(center_id,array['owner','admin']::public.center_role[]));
create policy appointments_read on public.appointments for select to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]) or exists(select 1 from public.staff s where s.id=staff_id and s.user_id=auth.uid()));
create policy appointments_manage on public.appointments for all to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]) or exists(select 1 from public.staff s where s.id=staff_id and s.user_id=auth.uid())) with check(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]) or exists(select 1 from public.staff s where s.id=staff_id and s.user_id=auth.uid()));
create policy events_read on public.appointment_events for select to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]) or exists(select 1 from public.appointments a join public.staff s on s.id=a.staff_id where a.id=appointment_id and s.user_id=auth.uid()));
create policy payments_read on public.payments for select to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]));
create policy payments_manage on public.payments for all to authenticated using(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[])) with check(public.has_center_role(center_id,array['owner','admin','reception']::public.center_role[]));

grant select on public.centers,public.center_members,public.locations,public.staff,public.clients,public.services,public.appointments,public.appointment_events,public.payments to authenticated;
grant insert,update,delete on public.clients,public.services,public.appointments,public.payments to authenticated;
-- Intentionally no public/anon access and no client-side ability to create centers/members.
-- Center onboarding and invitations must be server-controlled, authorize owner creation,
-- and add membership atomically. Add audited RPC/Edge Function before offering signup.
