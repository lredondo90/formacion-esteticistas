-- Aula Estética Manager · MVP 1.0
-- Profiles, center settings, opening hours, closures, resources (cabinas), service/staff rules,
-- invitations, server-side booking with availability checks, online booking, payments ledger,
-- notifications outbox, consents, sensitive notes, waitlist, audit log and data export.
-- Apply after 202610290002…0005. Weekdays use PostgreSQL's convention: 0 = Sunday … 6 = Saturday.

-- ───────────────────────── Helpers ─────────────────────────
create or replace function public.slugify(p_text text)
returns text language sql immutable as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(
    translate(lower(coalesce(p_text, '')), 'áàäâãéèëêíìïîóòöôõúùüûñç', 'aaaaaeeeeiiiiooooouuuunc'),
    '[^a-z0-9]+', '-', 'g')), ''), 'centro')
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ───────────────────────── Profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or length(full_name) <= 140),
  locale text not null default 'es-ES' check (locale in ('es-ES', 'es-419', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.center_members me
    join public.center_members them on them.center_id = me.center_id
    where me.user_id = auth.uid() and me.active and them.user_id = profiles.id));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, locale) on public.profiles to authenticated;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created_profile after insert on auth.users
  for each row execute function public.handle_new_user();
insert into public.profiles(id, full_name)
  select id, split_part(email, '@', 1) from auth.users on conflict (id) do nothing;

-- ───────────────────────── Center settings ─────────────────────────
alter table public.centers
  add column slug text,
  add column phone text,
  add column email text,
  add column address text,
  add column locale text not null default 'es-ES' check (locale in ('es-ES', 'es-419', 'en')),
  add column slot_interval_minutes int not null default 15 check (slot_interval_minutes in (5, 10, 15, 20, 30, 60)),
  add column min_notice_minutes int not null default 120 check (min_notice_minutes between 0 and 10080),
  add column max_advance_days int not null default 60 check (max_advance_days between 1 and 365),
  add column cancellation_hours int not null default 24 check (cancellation_hours between 0 and 336),
  add column cancellation_policy text check (cancellation_policy is null or length(cancellation_policy) <= 1000),
  add column online_booking_enabled boolean not null default false,
  add column online_requires_approval boolean not null default false,
  add column updated_at timestamptz not null default now();
update public.centers set slug = left(public.slugify(name), 50) || '-' || substr(replace(id::text, '-', ''), 1, 6) where slug is null;
alter table public.centers alter column slug set not null;
alter table public.centers add constraint centers_slug_key unique (slug);
alter table public.centers add constraint centers_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60);
create trigger centers_touch before update on public.centers for each row execute function public.touch_updated_at();

create policy center_update on public.centers for update to authenticated
  using (public.has_center_role(id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(id, array['owner', 'admin']::public.center_role[]));
revoke insert, update, delete on public.centers from anon, authenticated;
grant update (name, slug, phone, email, address, timezone, locale, slot_interval_minutes, min_notice_minutes,
  max_advance_days, cancellation_hours, cancellation_policy, online_booking_enabled, online_requires_approval)
  on public.centers to authenticated;

create table public.center_opening_hours (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  check (closes_at > opens_at)
);
create index center_opening_hours_idx on public.center_opening_hours(center_id, weekday);

create table public.center_closures (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  reason text check (reason is null or length(reason) <= 140),
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index center_closures_idx on public.center_closures(center_id, starts_on);

alter table public.center_opening_hours enable row level security;
alter table public.center_closures enable row level security;
create policy opening_hours_read on public.center_opening_hours for select to authenticated using (public.is_center_member(center_id));
create policy opening_hours_manage on public.center_opening_hours for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
create policy closures_read on public.center_closures for select to authenticated using (public.is_center_member(center_id));
create policy closures_manage on public.center_closures for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
grant select, insert, update, delete on public.center_opening_hours, public.center_closures to authenticated;

-- Locations can now be managed by owners and admins.
create policy location_manage on public.locations for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
grant insert, update, delete on public.locations to authenticated;

-- ───────────────────────── Staff, resources and services ─────────────────────────
alter table public.staff
  add column role_title text check (role_title is null or length(role_title) <= 80),
  add column color text not null default '#b64f78' check (color ~ '^#[0-9a-fA-F]{6}$'),
  add column bookable boolean not null default true;
create policy staff_manage on public.staff for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
grant insert, update, delete on public.staff to authenticated;

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  kind text not null default 'cabina' check (kind in ('cabina', 'equipo', 'sala', 'otro')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (center_id, id)
);

alter table public.services
  add column description text check (description is null or length(description) <= 600),
  add column category text check (category is null or length(category) <= 60),
  add column color text not null default '#b64f78' check (color ~ '^#[0-9a-fA-F]{6}$'),
  add column online_bookable boolean not null default true,
  add column updated_at timestamptz not null default now();
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

-- A service that lists resources needs ONE free resource from the list (e.g. any facial cabin).
create table public.service_resources (
  center_id uuid not null,
  service_id uuid not null,
  resource_id uuid not null,
  primary key (service_id, resource_id),
  foreign key (center_id, service_id) references public.services(center_id, id) on delete cascade,
  foreign key (center_id, resource_id) references public.resources(center_id, id) on delete cascade
);
-- A service that lists professionals can only be booked with one of them; no rows = anyone.
create table public.staff_services (
  center_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  primary key (staff_id, service_id),
  foreign key (center_id, staff_id) references public.staff(center_id, id) on delete cascade,
  foreign key (center_id, service_id) references public.services(center_id, id) on delete cascade
);
create index staff_services_service_idx on public.staff_services(service_id);

alter table public.resources enable row level security;
alter table public.service_resources enable row level security;
alter table public.staff_services enable row level security;
create policy resources_read on public.resources for select to authenticated using (public.is_center_member(center_id));
create policy resources_manage on public.resources for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
create policy service_resources_read on public.service_resources for select to authenticated using (public.is_center_member(center_id));
create policy service_resources_manage on public.service_resources for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
create policy staff_services_read on public.staff_services for select to authenticated using (public.is_center_member(center_id));
create policy staff_services_manage on public.staff_services for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
grant select, insert, update, delete on public.resources, public.service_resources, public.staff_services to authenticated;

-- ───────────────────────── Clients, consents, sensitive notes ─────────────────────────
alter table public.clients add column anonymized_at timestamptz;
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();
create index clients_center_email_idx on public.clients(center_id, lower(email));
create index clients_center_phone_idx on public.clients(center_id, phone);
-- Professionals see the clients they have appointments with.
create policy clients_professional_read on public.clients for select to authenticated using (
  exists (select 1 from public.appointments a join public.staff s on s.id = a.staff_id
          where a.client_id = clients.id and s.user_id = auth.uid()));
-- Clients are anonymized (anonymize_client), not deleted, so the financial history survives.
drop policy clients_write on public.clients;
create policy clients_insert on public.clients for insert to authenticated
  with check (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]));
create policy clients_update on public.clients for update to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]) and anonymized_at is null)
  with check (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]) and anonymized_at is null);
revoke delete on public.clients from anon, authenticated;

create table public.client_consents (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null,
  client_id uuid not null,
  kind text not null check (kind in ('privacy', 'marketing', 'health_data', 'treatment', 'image')),
  granted boolean not null,
  version text not null default 'v1',
  text_snapshot text,
  collected_via text not null default 'in_person' check (collected_via in ('in_person', 'online', 'whatsapp', 'other')),
  collected_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (center_id, client_id) references public.clients(center_id, id) on delete cascade
);
create index client_consents_client_idx on public.client_consents(client_id, kind, created_at desc);
alter table public.client_consents enable row level security;
create policy consents_read on public.client_consents for select to authenticated using (public.is_center_member(center_id));
create policy consents_insert on public.client_consents for insert to authenticated
  with check (public.is_center_member(center_id) and collected_by = auth.uid());
revoke update, delete on public.client_consents from anon, authenticated;
grant select, insert on public.client_consents to authenticated;

-- Health-related notes (allergies, contraindications) are kept apart from commercial notes,
-- hidden from reception, readable only through get_client_health_notes (which logs the access).
create table public.client_health_notes (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null,
  client_id uuid not null,
  content text not null check (length(trim(content)) between 1 and 4000),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (center_id, client_id) references public.clients(center_id, id) on delete cascade
);
alter table public.client_health_notes enable row level security;
create policy health_notes_insert on public.client_health_notes for insert to authenticated with check (
  public.has_center_role(center_id, array['owner', 'admin', 'professional']::public.center_role[]) and created_by = auth.uid());
revoke select, update, delete on public.client_health_notes from anon, authenticated;
grant insert on public.client_health_notes to authenticated;

-- ───────────────────────── Appointments ─────────────────────────
alter table public.appointments
  add column resource_id uuid,
  add column buffer_snapshot_minutes int not null default 0 check (buffer_snapshot_minutes >= 0),
  add column block_ends_at timestamptz,
  add column source text not null default 'staff' check (source in ('staff', 'online', 'whatsapp', 'import')),
  add column cancelled_at timestamptz,
  add column cancel_reason text check (cancel_reason is null or length(cancel_reason) <= 300),
  add column public_token uuid not null default gen_random_uuid();
update public.appointments set block_ends_at = ends_at where block_ends_at is null;
alter table public.appointments alter column block_ends_at set not null;
alter table public.appointments add constraint appointments_block_after_end check (block_ends_at >= ends_at);
alter table public.appointments add constraint appointments_public_token_key unique (public_token);
alter table public.appointments add constraint appointments_resource_fk
  foreign key (center_id, resource_id) references public.resources(center_id, id);
alter table public.appointments drop constraint appointment_staff_no_overlap;
alter table public.appointments add column block_span tstzrange
  generated always as (tstzrange(starts_at, block_ends_at, '[)')) stored;
-- Final, atomic protection against double booking (preparation/cleaning time included).
alter table public.appointments add constraint appointment_staff_no_overlap
  exclude using gist (staff_id with =, block_span with &&) where (status in ('pending', 'confirmed'));
alter table public.appointments add constraint appointment_resource_no_overlap
  exclude using gist (resource_id with =, block_span with &&) where (resource_id is not null and status in ('pending', 'confirmed'));
create index appointments_client_idx on public.appointments(client_id, starts_at desc);
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();

-- The browser never writes appointments or payments directly: only the RPCs below do.
drop policy appointments_manage on public.appointments;
revoke insert, update, delete on public.appointments from anon, authenticated;
drop policy payments_manage on public.payments;
revoke insert, update, delete on public.payments from anon, authenticated;
revoke insert, update, delete on public.appointment_events from anon, authenticated;

alter table public.payments
  add column kind text not null default 'charge' check (kind in ('charge', 'refund')),
  add column client_id uuid,
  add column refunds_payment_id uuid references public.payments(id),
  add column note text check (note is null or length(note) <= 300);
alter table public.payments add constraint payments_client_fk foreign key (center_id, client_id) references public.clients(center_id, id);
create index payments_center_created_idx on public.payments(center_id, created_at desc);
create index payments_appointment_idx on public.payments(appointment_id);

create or replace function public.log_appointment_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_events(center_id, appointment_id, actor_id, event_type, details)
    values (new.center_id, new.id, auth.uid(), 'created', jsonb_build_object(
      'status', new.status, 'starts_at', new.starts_at, 'staff_id', new.staff_id, 'source', new.source,
      'price_cents', new.price_snapshot_cents));
    return new;
  end if;
  if old.status is distinct from new.status then
    insert into public.appointment_events(center_id, appointment_id, actor_id, event_type, details)
    values (new.center_id, new.id, auth.uid(), 'status_changed', jsonb_build_object(
      'from', old.status, 'to', new.status, 'reason', new.cancel_reason));
  end if;
  if old.starts_at is distinct from new.starts_at or old.staff_id is distinct from new.staff_id
     or old.resource_id is distinct from new.resource_id then
    insert into public.appointment_events(center_id, appointment_id, actor_id, event_type, details)
    values (new.center_id, new.id, auth.uid(), 'rescheduled', jsonb_build_object(
      'from', jsonb_build_object('starts_at', old.starts_at, 'staff_id', old.staff_id, 'resource_id', old.resource_id),
      'to', jsonb_build_object('starts_at', new.starts_at, 'staff_id', new.staff_id, 'resource_id', new.resource_id)));
  end if;
  if old.notes is distinct from new.notes then
    insert into public.appointment_events(center_id, appointment_id, actor_id, event_type, details)
    values (new.center_id, new.id, auth.uid(), 'notes_changed', '{}'::jsonb);
  end if;
  return new;
end $$;
create trigger appointments_log after insert or update on public.appointments
  for each row execute function public.log_appointment_event();

-- ───────────────────────── Notifications outbox ─────────────────────────
-- One row per message. dedupe_key makes every enqueue idempotent, so retries and repeated
-- triggers never send the same message twice.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  channel text not null default 'email' check (channel in ('email', 'sms', 'whatsapp')),
  kind text not null check (kind in ('confirmation', 'pending', 'reminder', 'cancellation', 'rescheduled', 'invitation')),
  recipient text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  scheduled_for timestamptz not null default now(),
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed', 'skipped')),
  attempts int not null default 0,
  last_error text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_due_idx on public.notifications(scheduled_for) where status = 'queued';
create index notifications_center_idx on public.notifications(center_id, created_at desc);
alter table public.notifications enable row level security;
create policy notifications_read on public.notifications for select to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]));
revoke insert, update, delete on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;

create or replace function public.enqueue_notification(
  p_center uuid, p_appointment uuid, p_kind text, p_recipient text, p_dedupe text,
  p_when timestamptz default now(), p_payload jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public, pg_temp as $$
  insert into public.notifications(center_id, appointment_id, kind, recipient, dedupe_key, scheduled_for, payload)
  values (p_center, p_appointment, p_kind, p_recipient, p_dedupe, greatest(p_when, now()), p_payload)
  on conflict (dedupe_key) do nothing
$$;
revoke all on function public.enqueue_notification(uuid, uuid, text, text, text, timestamptz, jsonb) from public, anon, authenticated;

create or replace function public.appointment_notifications()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_email text;
  v_tz text;
  v_key text := extract(epoch from new.starts_at)::bigint::text;
  v_reminder timestamptz;
begin
  select nullif(trim(c.email), '') into v_email from public.clients c where c.id = new.client_id;
  if v_email is null then return null; end if;
  select timezone into v_tz from public.centers where id = new.center_id;

  if tg_op = 'INSERT' then
    if new.status = 'confirmed' then
      perform public.enqueue_notification(new.center_id, new.id, 'confirmation', v_email, 'confirmation:' || new.id);
    elsif new.status = 'pending' then
      perform public.enqueue_notification(new.center_id, new.id, 'pending', v_email, 'pending:' || new.id);
    end if;
  else
    if old.status = 'pending' and new.status = 'confirmed' then
      perform public.enqueue_notification(new.center_id, new.id, 'confirmation', v_email, 'confirmation:' || new.id);
    end if;
    if new.status not in ('pending', 'confirmed') then
      update public.notifications set status = 'skipped' where appointment_id = new.id and kind = 'reminder' and status = 'queued';
    end if;
    if new.status in ('cancelled', 'rejected', 'expired') and old.status in ('pending', 'confirmed') then
      perform public.enqueue_notification(new.center_id, new.id, 'cancellation', v_email, 'cancellation:' || new.id);
    end if;
    if old.starts_at <> new.starts_at and new.status in ('pending', 'confirmed') then
      update public.notifications set status = 'skipped' where appointment_id = new.id and kind = 'reminder' and status = 'queued';
      perform public.enqueue_notification(new.center_id, new.id, 'rescheduled', v_email, 'rescheduled:' || new.id || ':' || v_key);
    end if;
  end if;

  -- Reminder: the day before at 10:00 (center time), or right away if that moment has passed.
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status <> 'confirmed' or old.starts_at <> new.starts_at)
     and new.starts_at > now() + interval '3 hours' then
    v_reminder := (((new.starts_at at time zone v_tz)::date - 1) + time '10:00') at time zone v_tz;
    perform public.enqueue_notification(new.center_id, new.id, 'reminder', v_email, 'reminder:' || new.id || ':' || v_key, v_reminder);
  end if;
  return null;
end $$;
create trigger appointments_notify after insert or update of status, starts_at on public.appointments
  for each row execute function public.appointment_notifications();

-- Used by the server dispatcher (service role only): claims due messages without double sending.
create or replace function public.claim_due_notifications(p_limit int default 25)
returns setof jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  -- Messages stuck in "sending" for 15 minutes go back to the queue.
  update public.notifications set status = 'queued'
   where status = 'sending' and scheduled_for < now() - interval '15 minutes' and attempts < 5;
  return query
  with due as (
    select n.id from public.notifications n
     where n.status = 'queued' and n.scheduled_for <= now() and n.attempts < 5
     order by n.scheduled_for limit greatest(1, least(p_limit, 100))
     for update skip locked
  ), claimed as (
    update public.notifications n set status = 'sending', attempts = n.attempts + 1
      from due where n.id = due.id
    returning n.*
  )
  select jsonb_build_object(
    'id', c.id, 'kind', c.kind, 'channel', c.channel, 'recipient', c.recipient, 'payload', c.payload,
    'center', jsonb_build_object('name', ce.name, 'timezone', ce.timezone, 'locale', ce.locale, 'phone', ce.phone,
                                 'address', ce.address, 'slug', ce.slug, 'cancellation_hours', ce.cancellation_hours),
    'appointment', case when a.id is null then null else jsonb_build_object(
      'starts_at', a.starts_at, 'service', a.service_name_snapshot, 'status', a.status,
      'token', a.public_token, 'staff', s.display_name, 'client', cl.name) end)
  from claimed c
  join public.centers ce on ce.id = c.center_id
  left join public.appointments a on a.id = c.appointment_id
  left join public.staff s on s.id = a.staff_id
  left join public.clients cl on cl.id = a.client_id;
end $$;

create or replace function public.complete_notification(p_id uuid, p_ok boolean, p_provider_id text default null, p_error text default null)
returns void language sql security definer set search_path = public, pg_temp as $$
  update public.notifications
     set status = case when p_ok then 'sent' when attempts >= 5 then 'failed' else 'queued' end,
         sent_at = case when p_ok then now() else sent_at end,
         provider_message_id = coalesce(p_provider_id, provider_message_id),
         last_error = left(p_error, 500),
         scheduled_for = case when p_ok then scheduled_for else now() + interval '10 minutes' end
   where id = p_id and status = 'sending'
$$;
revoke all on function public.claim_due_notifications(int) from public, anon, authenticated;
revoke all on function public.complete_notification(uuid, boolean, text, text) from public, anon, authenticated;
grant execute on function public.claim_due_notifications(int), public.complete_notification(uuid, boolean, text, text) to service_role;

-- ───────────────────────── Availability and booking ─────────────────────────
create type public.slot_check as (problem text, resource_id uuid, ends_at timestamptz, block_ends_at timestamptz);

-- Returns the first rule a booking would break (problem) or, when it fits, the resource to use.
-- p_enforce_hours = false lets reception book outside opening/working hours (never over other
-- bookings or time off).
create or replace function public._slot_problem(
  p_center uuid, p_service uuid, p_staff uuid, p_resource uuid, p_starts timestamptz,
  p_ignore uuid default null, p_enforce_hours boolean default true)
returns public.slot_check language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_tz text;
  v_service public.services;
  v_end timestamptz;
  v_block timestamptz;
  v_ls timestamp;
  v_le timestamp;
  v_span tstzrange;
  v_res uuid := p_resource;
begin
  select timezone into v_tz from public.centers where id = p_center;
  select * into v_service from public.services where id = p_service and center_id = p_center;
  if v_service.id is null or not v_service.active then
    return row('service_unavailable', null, null, null)::public.slot_check;
  end if;
  v_end := p_starts + make_interval(mins => v_service.duration_minutes);
  v_block := v_end + make_interval(mins => v_service.buffer_minutes);
  v_span := tstzrange(p_starts, v_block, '[)');
  v_ls := p_starts at time zone v_tz;
  v_le := v_block at time zone v_tz;

  if not exists (select 1 from public.staff where id = p_staff and center_id = p_center and active) then
    return row('staff_unavailable', null, v_end, v_block)::public.slot_check;
  end if;
  if exists (select 1 from public.staff_services where service_id = p_service)
     and not exists (select 1 from public.staff_services where service_id = p_service and staff_id = p_staff) then
    return row('staff_not_qualified', null, v_end, v_block)::public.slot_check;
  end if;

  if p_enforce_hours then
    if exists (select 1 from public.center_closures where center_id = p_center
               and (v_ls::date between starts_on and ends_on or v_le::date between starts_on and ends_on)) then
      return row('center_closed', null, v_end, v_block)::public.slot_check;
    end if;
    if exists (select 1 from public.center_opening_hours where center_id = p_center)
       and not exists (select 1 from public.center_opening_hours where center_id = p_center
                       and weekday = extract(dow from v_ls)::int and v_ls::date = v_le::date
                       and opens_at <= v_ls::time and closes_at >= v_le::time) then
      return row('outside_opening_hours', null, v_end, v_block)::public.slot_check;
    end if;
    if exists (select 1 from public.staff_working_hours where staff_id = p_staff and active)
       and not exists (select 1 from public.staff_working_hours where staff_id = p_staff and active
                       and weekday = extract(dow from v_ls)::int and v_ls::date = v_le::date
                       and starts_at <= v_ls::time and ends_at >= v_le::time) then
      return row('staff_not_working', null, v_end, v_block)::public.slot_check;
    end if;
  end if;

  if exists (select 1 from public.staff_time_off where staff_id = p_staff
             and tstzrange(starts_at, ends_at, '[)') && v_span) then
    return row('staff_time_off', null, v_end, v_block)::public.slot_check;
  end if;
  if exists (select 1 from public.appointments a where a.staff_id = p_staff and a.status in ('pending', 'confirmed')
             and a.block_span && v_span and a.id is distinct from p_ignore) then
    return row('staff_busy', null, v_end, v_block)::public.slot_check;
  end if;

  if exists (select 1 from public.service_resources where service_id = p_service) then
    if v_res is not null and not exists (select 1 from public.service_resources where service_id = p_service and resource_id = v_res) then
      return row('resource_not_suitable', null, v_end, v_block)::public.slot_check;
    end if;
    if v_res is null then
      select r.id into v_res from public.service_resources sr join public.resources r on r.id = sr.resource_id
       where sr.service_id = p_service and r.active
         and not exists (select 1 from public.appointments a where a.resource_id = r.id and a.status in ('pending', 'confirmed')
                         and a.block_span && v_span and a.id is distinct from p_ignore)
       order by r.name limit 1;
      if v_res is null then
        return row('no_resource_available', null, v_end, v_block)::public.slot_check;
      end if;
    end if;
  end if;
  if v_res is not null then
    if not exists (select 1 from public.resources where id = v_res and center_id = p_center and active) then
      return row('resource_not_suitable', null, v_end, v_block)::public.slot_check;
    end if;
    if exists (select 1 from public.appointments a where a.resource_id = v_res and a.status in ('pending', 'confirmed')
               and a.block_span && v_span and a.id is distinct from p_ignore) then
      return row('resource_busy', null, v_end, v_block)::public.slot_check;
    end if;
  end if;
  return row(null, v_res, v_end, v_block)::public.slot_check;
end $$;
revoke all on function public._slot_problem(uuid, uuid, uuid, uuid, timestamptz, uuid, boolean) from public, anon, authenticated;

create or replace function public._availability(p_center uuid, p_service uuid, p_date date, p_staff uuid, p_online boolean)
returns table (slot_start timestamptz, slot_staff uuid, slot_resource uuid)
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_center public.centers;
  v_service public.services;
  v_window record;
  v_t timestamp;
  v_start timestamptz;
  v_min timestamptz;
  v_staff record;
  v_check public.slot_check;
begin
  select * into v_center from public.centers where id = p_center;
  select * into v_service from public.services where id = p_service and center_id = p_center and active;
  if v_center.id is null or v_service.id is null then return; end if;
  v_min := now() + case when p_online then make_interval(mins => v_center.min_notice_minutes) else interval '0' end;
  for v_window in
    select h.opens_at, h.closes_at from public.center_opening_hours h
     where h.center_id = p_center and h.weekday = extract(dow from p_date)::int
    union all
    select time '09:00', time '20:00' where not exists (select 1 from public.center_opening_hours where center_id = p_center)
    order by 1
  loop
    v_t := p_date + v_window.opens_at;
    while v_t + make_interval(mins => v_service.duration_minutes + v_service.buffer_minutes) <= p_date + v_window.closes_at loop
      v_start := v_t at time zone v_center.timezone;
      if v_start >= v_min then
        for v_staff in
          select s.id from public.staff s
           where s.center_id = p_center and s.active and (p_staff is null or s.id = p_staff) and (not p_online or s.bookable)
           order by s.display_name
        loop
          v_check := public._slot_problem(p_center, p_service, v_staff.id, null, v_start, null, true);
          if v_check.problem is null then
            slot_start := v_start; slot_staff := v_staff.id; slot_resource := v_check.resource_id;
            return next;
          end if;
        end loop;
      end if;
      v_t := v_t + make_interval(mins => v_center.slot_interval_minutes);
    end loop;
  end loop;
end $$;
revoke all on function public._availability(uuid, uuid, date, uuid, boolean) from public, anon, authenticated;

create or replace function public.get_availability(p_center uuid, p_service uuid, p_date date, p_staff uuid default null)
returns table (slot_start timestamptz, slot_staff uuid, slot_resource uuid)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not public.is_center_member(p_center) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select * from public._availability(p_center, p_service, p_date, p_staff, false);
end $$;

create or replace function public._can_manage_appointments(p_center uuid, p_staff uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.has_center_role(p_center, array['owner', 'admin', 'reception']::public.center_role[])
      or exists (select 1 from public.staff where id = p_staff and center_id = p_center and user_id = auth.uid() and active)
$$;
revoke all on function public._can_manage_appointments(uuid, uuid) from public, anon;

create or replace function public._insert_appointment(
  p_center uuid, p_client uuid, p_service uuid, p_staff uuid, p_starts_at timestamptz, p_resource uuid,
  p_notes text, p_status public.booking_status, p_source text, p_enforce_hours boolean)
returns public.appointments language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_check public.slot_check;
  v_service public.services;
  v_row public.appointments;
begin
  v_check := public._slot_problem(p_center, p_service, p_staff, p_resource, p_starts_at, null, p_enforce_hours);
  if v_check.problem is not null then raise exception '%', v_check.problem using errcode = 'P0001'; end if;
  select * into v_service from public.services where id = p_service;
  begin
    insert into public.appointments(center_id, client_id, service_id, staff_id, resource_id, starts_at, ends_at, block_ends_at,
      status, service_name_snapshot, duration_snapshot_minutes, price_snapshot_cents, buffer_snapshot_minutes, notes, created_by, source)
    values (p_center, p_client, p_service, p_staff, v_check.resource_id, p_starts_at, v_check.ends_at, v_check.block_ends_at,
      p_status, v_service.name, v_service.duration_minutes, v_service.price_cents, v_service.buffer_minutes,
      nullif(trim(p_notes), ''), auth.uid(), p_source)
    returning * into v_row;
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = 'P0001';
  end;
  return v_row;
end $$;
revoke all on function public._insert_appointment(uuid, uuid, uuid, uuid, timestamptz, uuid, text, public.booking_status, text, boolean) from public, anon, authenticated;

create or replace function public.create_appointment(
  p_center uuid, p_client uuid, p_service uuid, p_staff uuid, p_starts_at timestamptz,
  p_resource uuid default null, p_notes text default null, p_status public.booking_status default 'confirmed',
  p_force boolean default false)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row public.appointments;
begin
  if not public._can_manage_appointments(p_center, p_staff) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_status not in ('pending', 'confirmed') then raise exception 'invalid_status' using errcode = '22023'; end if;
  if not exists (select 1 from public.clients where id = p_client and center_id = p_center and anonymized_at is null) then
    raise exception 'client_not_found' using errcode = 'P0001';
  end if;
  v_row := public._insert_appointment(p_center, p_client, p_service, p_staff, p_starts_at, p_resource, p_notes, p_status, 'staff', not p_force);
  return v_row.id;
end $$;

create or replace function public.reschedule_appointment(
  p_appointment uuid, p_starts_at timestamptz, p_staff uuid default null, p_resource uuid default null, p_force boolean default false)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_appt public.appointments;
  v_staff uuid;
  v_check public.slot_check;
begin
  select * into v_appt from public.appointments where id = p_appointment for update;
  if v_appt.id is null then raise exception 'appointment_not_found' using errcode = 'P0001'; end if;
  v_staff := coalesce(p_staff, v_appt.staff_id);
  if not (public._can_manage_appointments(v_appt.center_id, v_appt.staff_id) and public._can_manage_appointments(v_appt.center_id, v_staff)) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_appt.status not in ('pending', 'confirmed') then raise exception 'appointment_closed' using errcode = 'P0001'; end if;
  -- Keep the booked duration and price; only time, professional and resource move.
  v_check := public._slot_problem(v_appt.center_id, v_appt.service_id, v_staff, p_resource, p_starts_at, v_appt.id, not p_force);
  if v_check.problem is not null and v_check.problem <> 'service_unavailable' then
    raise exception '%', v_check.problem using errcode = 'P0001';
  end if;
  begin
    update public.appointments set
      starts_at = p_starts_at,
      ends_at = p_starts_at + make_interval(mins => v_appt.duration_snapshot_minutes),
      block_ends_at = p_starts_at + make_interval(mins => v_appt.duration_snapshot_minutes + v_appt.buffer_snapshot_minutes),
      staff_id = v_staff,
      resource_id = coalesce(v_check.resource_id, p_resource)
    where id = v_appt.id;
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = 'P0001';
  end;
end $$;

create or replace function public.set_appointment_status(p_appointment uuid, p_status public.booking_status, p_reason text default null)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_appt public.appointments;
  v_ok boolean;
begin
  select * into v_appt from public.appointments where id = p_appointment for update;
  if v_appt.id is null then raise exception 'appointment_not_found' using errcode = 'P0001'; end if;
  if not public._can_manage_appointments(v_appt.center_id, v_appt.staff_id) then raise exception 'forbidden' using errcode = '42501'; end if;
  v_ok := case v_appt.status
    when 'pending' then p_status in ('confirmed', 'rejected', 'cancelled', 'expired')
    when 'confirmed' then p_status in ('completed', 'cancelled', 'no_show')
    when 'completed' then p_status = 'no_show'
    when 'no_show' then p_status = 'completed'
    else false end;
  if not v_ok then raise exception 'invalid_transition' using errcode = 'P0001'; end if;
  begin
    update public.appointments set
      status = p_status,
      cancelled_at = case when p_status in ('cancelled', 'rejected', 'expired') then now() else cancelled_at end,
      cancel_reason = case when p_status in ('cancelled', 'rejected', 'expired') then nullif(trim(p_reason), '') else cancel_reason end
    where id = v_appt.id;
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = 'P0001';
  end;
end $$;

create or replace function public.update_appointment_notes(p_appointment uuid, p_notes text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_appt public.appointments;
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if v_appt.id is null or not public._can_manage_appointments(v_appt.center_id, v_appt.staff_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.appointments set notes = nullif(trim(left(p_notes, 2000)), '') where id = p_appointment;
end $$;

-- ───────────────────────── Payments (immutable ledger) ─────────────────────────
create or replace function public.record_payment(
  p_center uuid, p_amount_cents int, p_method text, p_appointment uuid default null,
  p_client uuid default null, p_note text default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_client uuid := p_client;
  v_id uuid;
  v_currency char(3);
begin
  if not public.has_center_role(p_center, array['owner', 'admin', 'reception']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > 10000000 then raise exception 'invalid_amount' using errcode = '22023'; end if;
  if p_appointment is not null then
    select client_id into v_client from public.appointments where id = p_appointment and center_id = p_center;
    if v_client is null then raise exception 'appointment_not_found' using errcode = 'P0001'; end if;
  elsif v_client is not null and not exists (select 1 from public.clients where id = v_client and center_id = p_center) then
    raise exception 'client_not_found' using errcode = 'P0001';
  end if;
  select currency into v_currency from public.centers where id = p_center;
  insert into public.payments(center_id, appointment_id, client_id, amount_cents, currency, method, status, kind, note, recorded_by)
  values (p_center, p_appointment, v_client, p_amount_cents, v_currency, p_method, 'paid', 'charge', nullif(trim(p_note), ''), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.refund_payment(p_payment uuid, p_amount_cents int, p_note text default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_pay public.payments;
  v_refunded int;
  v_id uuid;
begin
  select * into v_pay from public.payments where id = p_payment and kind = 'charge' for update;
  if v_pay.id is null then raise exception 'payment_not_found' using errcode = 'P0001'; end if;
  if not public.has_center_role(v_pay.center_id, array['owner', 'admin']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select coalesce(sum(amount_cents), 0) into v_refunded from public.payments where refunds_payment_id = p_payment;
  if p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > v_pay.amount_cents - v_refunded then
    raise exception 'invalid_amount' using errcode = '22023';
  end if;
  insert into public.payments(center_id, appointment_id, client_id, amount_cents, currency, method, status, kind, refunds_payment_id, note, recorded_by)
  values (v_pay.center_id, v_pay.appointment_id, v_pay.client_id, p_amount_cents, v_pay.currency, v_pay.method, 'refunded', 'refund', p_payment,
          nullif(trim(p_note), ''), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create view public.appointment_balances with (security_invoker = true) as
  select a.id as appointment_id, a.center_id, a.price_snapshot_cents,
         coalesce(sum(case when p.kind = 'charge' and p.status = 'paid' then p.amount_cents
                           when p.kind = 'refund' then -p.amount_cents else 0 end), 0)::int as paid_cents
    from public.appointments a
    left join public.payments p on p.appointment_id = a.id
   group by a.id;
grant select on public.appointment_balances to authenticated;

-- ───────────────────────── Team: invitations and roles ─────────────────────────
create table public.center_invitations (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role public.center_role not null,
  staff_id uuid,
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  revoked_at timestamptz,
  foreign key (center_id, staff_id) references public.staff(center_id, id) on delete set null (staff_id)
);
alter table public.center_invitations enable row level security;
create policy invitations_read on public.center_invitations for select to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
revoke insert, update, delete on public.center_invitations from anon, authenticated;
grant select on public.center_invitations to authenticated;

create or replace function public.invite_member(p_center uuid, p_email text, p_role public.center_role, p_staff uuid default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_inv public.center_invitations;
  v_center text;
begin
  if not public.has_center_role(p_center, array['owner', 'admin']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_role = 'owner' and not public.has_center_role(p_center, array['owner']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_staff is not null and not exists (select 1 from public.staff where id = p_staff and center_id = p_center and user_id is null) then
    raise exception 'staff_not_available' using errcode = 'P0001';
  end if;
  update public.center_invitations set revoked_at = now()
   where center_id = p_center and lower(email) = lower(trim(p_email)) and accepted_at is null and revoked_at is null;
  insert into public.center_invitations(center_id, email, role, staff_id, invited_by)
  values (p_center, lower(trim(p_email)), p_role, p_staff, auth.uid())
  returning * into v_inv;
  select name into v_center from public.centers where id = p_center;
  perform public.enqueue_notification(p_center, null, 'invitation', v_inv.email, 'invitation:' || v_inv.id, now(),
    jsonb_build_object('token', v_inv.token, 'role', v_inv.role, 'center_name', v_center));
  return v_inv.token;
end $$;

create or replace function public.revoke_invitation(p_invitation uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_center uuid;
begin
  select center_id into v_center from public.center_invitations where id = p_invitation;
  if v_center is null or not public.has_center_role(v_center, array['owner', 'admin']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.center_invitations set revoked_at = now() where id = p_invitation and accepted_at is null;
end $$;

create or replace function public.invitation_preview(p_token uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('center_name', c.name, 'role', i.role, 'email', i.email,
           'valid', i.accepted_at is null and i.revoked_at is null and i.expires_at > now())
    from public.center_invitations i join public.centers c on c.id = i.center_id
   where i.token = p_token
$$;

create or replace function public.accept_invitation(p_token uuid)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_inv public.center_invitations;
  v_user uuid := auth.uid();
  v_email text := lower(auth.jwt() ->> 'email');
  v_name text;
begin
  if v_user is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into v_inv from public.center_invitations where token = p_token for update;
  if v_inv.id is null or v_inv.revoked_at is not null or v_inv.accepted_at is not null or v_inv.expires_at <= now() then
    raise exception 'invitation_invalid' using errcode = 'P0001';
  end if;
  if v_email is distinct from v_inv.email then raise exception 'invitation_email_mismatch' using errcode = '42501'; end if;

  insert into public.center_members(center_id, user_id, role, active) values (v_inv.center_id, v_user, v_inv.role, true)
  on conflict (center_id, user_id) do update set role = excluded.role, active = true;
  if v_inv.staff_id is not null then
    update public.staff set user_id = v_user where id = v_inv.staff_id and user_id is null;
  elsif v_inv.role = 'professional' and not exists (select 1 from public.staff where center_id = v_inv.center_id and user_id = v_user) then
    select coalesce(full_name, split_part(v_email, '@', 1)) into v_name from public.profiles where id = v_user;
    insert into public.staff(center_id, user_id, display_name, email) values (v_inv.center_id, v_user, coalesce(v_name, 'Profesional'), v_email);
  end if;
  update public.center_invitations set accepted_at = now(), accepted_by = v_user where id = v_inv.id;
  return v_inv.center_id;
end $$;

create or replace function public.list_center_members(p_center uuid)
returns table (user_id uuid, role public.center_role, active boolean, full_name text, email text, staff_id uuid, joined_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not public.has_center_role(p_center, array['owner', 'admin']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select m.user_id, m.role, m.active, p.full_name, u.email::text,
           (select s.id from public.staff s where s.center_id = p_center and s.user_id = m.user_id limit 1), m.created_at
      from public.center_members m
      join auth.users u on u.id = m.user_id
      left join public.profiles p on p.id = m.user_id
     where m.center_id = p_center
     order by m.created_at;
end $$;

create or replace function public.set_member_role(p_center uuid, p_user uuid, p_role public.center_role, p_active boolean default true)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_current public.center_members;
begin
  select * into v_current from public.center_members where center_id = p_center and user_id = p_user for update;
  if v_current.user_id is null then raise exception 'member_not_found' using errcode = 'P0001'; end if;
  if not public.has_center_role(p_center, array['owner', 'admin']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  if (v_current.role = 'owner' or p_role = 'owner') and not public.has_center_role(p_center, array['owner']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_current.role = 'owner' and v_current.active and (p_role <> 'owner' or not p_active)
     and (select count(*) from public.center_members where center_id = p_center and role = 'owner' and active) <= 1 then
    raise exception 'last_owner' using errcode = 'P0001';
  end if;
  update public.center_members set role = p_role, active = p_active where center_id = p_center and user_id = p_user;
end $$;

-- ───────────────────────── Onboarding ─────────────────────────
create or replace function public._setup_center_defaults(p_center uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare v_name text;
begin
  if not exists (select 1 from public.center_opening_hours where center_id = p_center) then
    insert into public.center_opening_hours(center_id, weekday, opens_at, closes_at)
    select p_center, d, time '09:30', time '20:00' from generate_series(1, 5) d
    union all select p_center, 6, time '10:00', time '14:00';
  end if;
  if not exists (select 1 from public.locations where center_id = p_center) then
    insert into public.locations(center_id, name, timezone) select p_center, 'Principal', timezone from public.centers where id = p_center;
  end if;
  if p_user is not null and not exists (select 1 from public.staff where center_id = p_center and user_id = p_user) then
    select coalesce(p.full_name, split_part(u.email, '@', 1)) into v_name
      from auth.users u left join public.profiles p on p.id = u.id where u.id = p_user;
    insert into public.staff(center_id, user_id, display_name, email)
    select p_center, p_user, coalesce(v_name, 'Yo'), email from auth.users where id = p_user;
  end if;
end $$;
revoke all on function public._setup_center_defaults(uuid, uuid) from public, anon, authenticated;

create or replace function public.create_my_first_center(p_name text)
returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  v_center_id uuid := gen_random_uuid();
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(p_name)) > 140 then
    raise exception 'invalid_center_name' using errcode = '22023';
  end if;
  if exists (select 1 from public.center_members where user_id = v_user_id and active) then
    raise exception 'user_already_belongs_to_a_center' using errcode = '23505';
  end if;
  insert into public.centers(id, name, slug, created_by)
  values (v_center_id, trim(p_name), left(public.slugify(p_name), 50) || '-' || substr(replace(v_center_id::text, '-', ''), 1, 6), v_user_id);
  insert into public.center_members(center_id, user_id, role, active) values (v_center_id, v_user_id, 'owner', true);
  perform public._setup_center_defaults(v_center_id, v_user_id);
  return v_center_id;
end $$;
revoke all on function public.create_my_first_center(text) from public, anon;
grant execute on function public.create_my_first_center(text) to authenticated;

-- Existing centers get the same defaults.
do $$ begin perform public._setup_center_defaults(c.id, c.created_by) from public.centers c; end $$;

create or replace function public.seed_example_services(p_center uuid)
returns int language plpgsql security definer set search_path = public, pg_temp as $$
declare v_count int;
begin
  if not public.has_center_role(p_center, array['owner', 'admin']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into public.services(center_id, name, category, duration_minutes, buffer_minutes, price_cents, color, description)
  select p_center, v.name, v.category, v.minutes, v.buffer, v.price, v.color, v.description
    from (values
      ('Higiene facial profunda', 'Facial', 60, 10, 4500, '#b64f78', 'Limpieza, extracción, mascarilla y masaje.'),
      ('Tratamiento hidratante', 'Facial', 45, 10, 3800, '#7c5cbf', 'Hidratación intensiva para pieles secas o deshidratadas.'),
      ('Diseño de cejas', 'Cejas y pestañas', 30, 5, 1800, '#c9853a', 'Visagismo, depilación y perfilado.'),
      ('Lifting de pestañas', 'Cejas y pestañas', 60, 5, 4000, '#3a8fc9', 'Lifting, tinte y nutrición.'),
      ('Depilación piernas completas', 'Depilación', 40, 10, 2500, '#3aa57a', 'Cera tibia.'),
      ('Manicura semipermanente', 'Manos', 45, 5, 2200, '#d0567a', 'Preparación, esmaltado y secado en lámpara.')
    ) as v(name, category, minutes, buffer, price, color, description)
   where not exists (select 1 from public.services s where s.center_id = p_center and lower(s.name) = lower(v.name));
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ───────────────────────── Online booking (public, anonymous) ─────────────────────────
create or replace function public.public_center(p_slug text)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'name', c.name, 'slug', c.slug, 'address', c.address, 'phone', c.phone, 'timezone', c.timezone,
    'currency', c.currency, 'locale', c.locale, 'cancellation_hours', c.cancellation_hours,
    'cancellation_policy', c.cancellation_policy, 'max_advance_days', c.max_advance_days,
    'requires_approval', c.online_requires_approval,
    'services', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'description', s.description,
        'category', s.category, 'duration_minutes', s.duration_minutes, 'price_cents', s.price_cents) order by s.category nulls last, s.name)
      from public.services s where s.center_id = c.id and s.active and s.online_bookable), '[]'::jsonb),
    'staff', coalesce((select jsonb_agg(jsonb_build_object('id', st.id, 'name', st.display_name, 'title', st.role_title,
        'services', (select coalesce(jsonb_agg(ss.service_id), '[]'::jsonb) from public.staff_services ss where ss.staff_id = st.id))
        order by st.display_name)
      from public.staff st where st.center_id = c.id and st.active and st.bookable), '[]'::jsonb))
  from public.centers c where c.slug = p_slug and c.online_booking_enabled
$$;

create or replace function public.public_availability(p_slug text, p_service uuid, p_date date, p_staff uuid default null)
returns table (slot_start timestamptz, slot_staff uuid)
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_center public.centers;
begin
  select * into v_center from public.centers where slug = p_slug and online_booking_enabled;
  if v_center.id is null then return; end if;
  if not exists (select 1 from public.services where id = p_service and center_id = v_center.id and active and online_bookable) then return; end if;
  if p_date < (now() at time zone v_center.timezone)::date or p_date > (now() at time zone v_center.timezone)::date + v_center.max_advance_days then return; end if;
  return query
    select distinct on (a.slot_start) a.slot_start, a.slot_staff
      from public._availability(v_center.id, p_service, p_date, p_staff, true) a
     order by a.slot_start;
end $$;

create or replace function public.public_book(
  p_slug text, p_service uuid, p_starts_at timestamptz, p_name text, p_phone text, p_email text,
  p_privacy_accepted boolean, p_marketing boolean default false, p_staff uuid default null, p_notes text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_center public.centers;
  v_client uuid;
  v_staff uuid := p_staff;
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_row public.appointments;
begin
  select * into v_center from public.centers where slug = p_slug and online_booking_enabled;
  if v_center.id is null then raise exception 'booking_disabled' using errcode = 'P0001'; end if;
  if not coalesce(p_privacy_accepted, false) then raise exception 'privacy_required' using errcode = 'P0001'; end if;
  if length(trim(coalesce(p_name, ''))) not between 2 and 120 then raise exception 'invalid_name' using errcode = '22023'; end if;
  if v_email is null or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email' using errcode = '22023'; end if;
  if v_phone is null or length(v_phone) not between 6 and 20 then raise exception 'invalid_phone' using errcode = '22023'; end if;
  if not exists (select 1 from public.services where id = p_service and center_id = v_center.id and active and online_bookable) then
    raise exception 'service_unavailable' using errcode = 'P0001';
  end if;
  if p_starts_at < now() + make_interval(mins => v_center.min_notice_minutes)
     or p_starts_at > now() + make_interval(days => v_center.max_advance_days + 1) then
    raise exception 'outside_booking_window' using errcode = 'P0001';
  end if;

  -- Same person, same center: reuse the client record (matched by email, then phone).
  select id into v_client from public.clients
   where center_id = v_center.id and anonymized_at is null and (lower(email) = v_email or phone = v_phone)
   order by (lower(email) = v_email) desc nulls last, created_at limit 1;
  if v_client is not null and (select count(*) from public.appointments where client_id = v_client
        and status in ('pending', 'confirmed') and starts_at > now() and source = 'online') >= 3 then
    raise exception 'too_many_bookings' using errcode = 'P0001';
  end if;
  if v_client is null then
    insert into public.clients(center_id, name, phone, email) values (v_center.id, trim(p_name), v_phone, v_email) returning id into v_client;
  else
    update public.clients set email = coalesce(email, v_email), phone = coalesce(phone, v_phone) where id = v_client;
  end if;
  insert into public.client_consents(center_id, client_id, kind, granted, version, collected_via)
  values (v_center.id, v_client, 'privacy', true, 'v1', 'online'),
         (v_center.id, v_client, 'marketing', coalesce(p_marketing, false), 'v1', 'online');

  if v_staff is not null and not exists (select 1 from public.staff where id = v_staff and center_id = v_center.id and active and bookable) then
    raise exception 'staff_unavailable' using errcode = 'P0001';
  end if;
  if v_staff is null then
    select s.id into v_staff from public.staff s
     where s.center_id = v_center.id and s.active and s.bookable
       and (public._slot_problem(v_center.id, p_service, s.id, null, p_starts_at, null, true)).problem is null
     order by s.display_name limit 1;
    if v_staff is null then raise exception 'slot_taken' using errcode = 'P0001'; end if;
  end if;
  v_row := public._insert_appointment(v_center.id, v_client, p_service, v_staff, p_starts_at, null, left(p_notes, 500),
    case when v_center.online_requires_approval then 'pending' else 'confirmed' end::public.booking_status, 'online', true);
  return jsonb_build_object('token', v_row.public_token, 'status', v_row.status, 'starts_at', v_row.starts_at);
end $$;

create or replace function public.public_appointment(p_token uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'center', c.name, 'slug', c.slug, 'address', c.address, 'phone', c.phone, 'timezone', c.timezone,
    'service', a.service_name_snapshot, 'staff', s.display_name, 'starts_at', a.starts_at, 'status', a.status,
    'price_cents', a.price_snapshot_cents, 'currency', c.currency, 'cancellation_hours', c.cancellation_hours,
    'can_cancel', a.status in ('pending', 'confirmed') and a.starts_at - make_interval(hours => c.cancellation_hours) > now())
  from public.appointments a join public.centers c on c.id = a.center_id join public.staff s on s.id = a.staff_id
  where a.public_token = p_token
$$;

create or replace function public.public_cancel(p_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_appt public.appointments;
  v_hours int;
begin
  select a.* into v_appt from public.appointments a where a.public_token = p_token for update;
  if v_appt.id is null then raise exception 'appointment_not_found' using errcode = 'P0001'; end if;
  select cancellation_hours into v_hours from public.centers where id = v_appt.center_id;
  if v_appt.status not in ('pending', 'confirmed') then raise exception 'appointment_closed' using errcode = 'P0001'; end if;
  if v_appt.starts_at - make_interval(hours => v_hours) <= now() then raise exception 'too_late_to_cancel' using errcode = 'P0001'; end if;
  update public.appointments set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Cancelada por el cliente (online)'
   where id = v_appt.id;
end $$;

-- ───────────────────────── Waitlist ─────────────────────────
create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  client_id uuid not null,
  service_id uuid,
  staff_id uuid,
  preference text check (preference is null or length(preference) <= 300),
  status text not null default 'waiting' check (status in ('waiting', 'contacted', 'booked', 'dropped')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (center_id, client_id) references public.clients(center_id, id) on delete cascade,
  foreign key (center_id, service_id) references public.services(center_id, id) on delete set null (service_id),
  foreign key (center_id, staff_id) references public.staff(center_id, id) on delete set null (staff_id)
);
alter table public.waitlist_entries enable row level security;
create policy waitlist_all on public.waitlist_entries for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin', 'reception']::public.center_role[]));
grant select, insert, update, delete on public.waitlist_entries to authenticated;

-- ───────────────────────── Audit log ─────────────────────────
create table public.audit_log (
  id bigint generated always as identity primary key,
  center_id uuid not null references public.centers(id) on delete cascade,
  actor_id uuid,
  entity text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_center_idx on public.audit_log(center_id, created_at desc);
alter table public.audit_log enable row level security;
create policy audit_read on public.audit_log for select to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
revoke insert, update, delete on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row jsonb := to_jsonb(coalesce(new, old));
  v_details jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'services' and tg_op = 'UPDATE' then
    if old.price_cents = new.price_cents and old.duration_minutes = new.duration_minutes then return null; end if;
    v_details := jsonb_build_object('price_from', old.price_cents, 'price_to', new.price_cents,
                                    'duration_from', old.duration_minutes, 'duration_to', new.duration_minutes);
  elsif tg_table_name = 'center_members' then
    v_details := jsonb_build_object('user_id', v_row ->> 'user_id', 'role', v_row ->> 'role', 'active', v_row -> 'active');
  elsif tg_table_name = 'payments' then
    v_details := jsonb_build_object('kind', new.kind, 'amount_cents', new.amount_cents, 'method', new.method);
  end if;
  insert into public.audit_log(center_id, actor_id, entity, entity_id, action, details)
  values ((v_row ->> 'center_id')::uuid, auth.uid(), tg_table_name,
          case when v_row ? 'id' then (v_row ->> 'id')::uuid end, lower(tg_op), v_details);
  return null;
end $$;
create trigger clients_audit after insert or update or delete on public.clients for each row execute function public.audit_row();
create trigger services_audit after update on public.services for each row execute function public.audit_row();
create trigger members_audit after insert or update on public.center_members for each row execute function public.audit_row();
create trigger payments_audit after insert on public.payments for each row execute function public.audit_row();
create trigger health_notes_audit after insert on public.client_health_notes for each row execute function public.audit_row();

create or replace function public.get_client_health_notes(p_client uuid)
returns table (id uuid, content text, created_at timestamptz, author text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_center uuid;
begin
  select center_id into v_center from public.clients where clients.id = p_client;
  if v_center is null or not public.has_center_role(v_center, array['owner', 'admin', 'professional']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into public.audit_log(center_id, actor_id, entity, entity_id, action) values (v_center, auth.uid(), 'client_health_notes', p_client, 'view');
  return query
    select n.id, n.content, n.created_at, coalesce(p.full_name, 'Equipo')
      from public.client_health_notes n left join public.profiles p on p.id = n.created_by
     where n.client_id = p_client order by n.created_at desc;
end $$;

-- ───────────────────────── Privacy: anonymize and export ─────────────────────────
create or replace function public.anonymize_client(p_client uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_center uuid;
begin
  select center_id into v_center from public.clients where id = p_client;
  if v_center is null or not public.has_center_role(v_center, array['owner', 'admin']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.appointments set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Cliente eliminado'
   where client_id = p_client and status in ('pending', 'confirmed') and starts_at > now();
  delete from public.client_health_notes where client_id = p_client;
  delete from public.waitlist_entries where client_id = p_client;
  update public.notifications set status = 'skipped' where status = 'queued'
     and appointment_id in (select id from public.appointments where client_id = p_client);
  update public.clients set name = 'Cliente eliminado', phone = null, email = null, operational_notes = null,
         marketing_consent_at = null, anonymized_at = now()
   where id = p_client;
end $$;

create or replace function public.export_center_data(p_center uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_result jsonb;
begin
  if not public.has_center_role(p_center, array['owner']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into public.audit_log(center_id, actor_id, entity, entity_id, action) values (p_center, auth.uid(), 'centers', p_center, 'export');
  select jsonb_build_object(
    'exported_at', now(),
    'center', (select to_jsonb(c) from public.centers c where c.id = p_center),
    'opening_hours', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.center_opening_hours x where x.center_id = p_center),
    'closures', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.center_closures x where x.center_id = p_center),
    'locations', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.locations x where x.center_id = p_center),
    'staff', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.staff x where x.center_id = p_center),
    'resources', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.resources x where x.center_id = p_center),
    'services', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.services x where x.center_id = p_center),
    'clients', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.clients x where x.center_id = p_center),
    'client_consents', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.client_consents x where x.center_id = p_center),
    'client_health_notes', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.client_health_notes x where x.center_id = p_center),
    'appointments', (select coalesce(jsonb_agg(to_jsonb(x) - 'block_span'), '[]') from public.appointments x where x.center_id = p_center),
    'appointment_events', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.appointment_events x where x.center_id = p_center),
    'payments', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.payments x where x.center_id = p_center),
    'waitlist', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.waitlist_entries x where x.center_id = p_center)
  ) into v_result;
  return v_result;
end $$;

-- ───────────────────────── Function permissions ─────────────────────────
-- Supabase grants EXECUTE to anon by default: close every RPC, then open what each audience needs.
revoke all on function
  public.get_availability(uuid, uuid, date, uuid),
  public.create_appointment(uuid, uuid, uuid, uuid, timestamptz, uuid, text, public.booking_status, boolean),
  public.reschedule_appointment(uuid, timestamptz, uuid, uuid, boolean),
  public.set_appointment_status(uuid, public.booking_status, text),
  public.update_appointment_notes(uuid, text),
  public.record_payment(uuid, int, text, uuid, uuid, text),
  public.refund_payment(uuid, int, text),
  public.invite_member(uuid, text, public.center_role, uuid),
  public.revoke_invitation(uuid),
  public.invitation_preview(uuid),
  public.accept_invitation(uuid),
  public.list_center_members(uuid),
  public.set_member_role(uuid, uuid, public.center_role, boolean),
  public.seed_example_services(uuid),
  public.get_client_health_notes(uuid),
  public.anonymize_client(uuid),
  public.export_center_data(uuid),
  public.public_center(text),
  public.public_availability(text, uuid, date, uuid),
  public.public_book(text, uuid, timestamptz, text, text, text, boolean, boolean, uuid, text),
  public.public_appointment(uuid),
  public.public_cancel(uuid),
  public.handle_new_user(),
  public.log_appointment_event(),
  public.appointment_notifications(),
  public.audit_row()
from public, anon;
grant execute on function
  public.get_availability(uuid, uuid, date, uuid),
  public.create_appointment(uuid, uuid, uuid, uuid, timestamptz, uuid, text, public.booking_status, boolean),
  public.reschedule_appointment(uuid, timestamptz, uuid, uuid, boolean),
  public.set_appointment_status(uuid, public.booking_status, text),
  public.update_appointment_notes(uuid, text),
  public.record_payment(uuid, int, text, uuid, uuid, text),
  public.refund_payment(uuid, int, text),
  public.invite_member(uuid, text, public.center_role, uuid),
  public.revoke_invitation(uuid),
  public.invitation_preview(uuid),
  public.accept_invitation(uuid),
  public.list_center_members(uuid),
  public.set_member_role(uuid, uuid, public.center_role, boolean),
  public.seed_example_services(uuid),
  public.get_client_health_notes(uuid),
  public.anonymize_client(uuid),
  public.export_center_data(uuid)
to authenticated;
grant execute on function
  public.public_center(text),
  public.public_availability(text, uuid, date, uuid),
  public.public_book(text, uuid, timestamptz, text, text, text, boolean, boolean, uuid, text),
  public.public_appointment(uuid),
  public.public_cancel(uuid),
  public.invitation_preview(uuid)
to anon, authenticated;
