-- Acceptance tests for the Manager MVP (plan, section 10). Runs on a throwaway local database
-- created by scripts/test-db.sh. Every check raises an exception on failure, so psql stops with
-- a non-zero exit code.
\set ON_ERROR_STOP 1
\set QUIET 1

insert into auth.users(email) values ('owner.a@test.dev'), ('owner.b@test.dev'), ('recepcion@test.dev'), ('intrusa@test.dev');
select id as owner_a from auth.users where email = 'owner.a@test.dev' \gset

-- A Wednesday at least a week ahead, so every booking is inside the booking window.
select (current_date + 7 + ((3 - extract(dow from current_date + 7)::int + 7) % 7))::date as day \gset

-- 1. An owner creates a center and configures services.
select tests.login('owner.a@test.dev');
select public.create_my_first_center('Estudio Aura') as center_a \gset
select tests.ok(public.seed_example_services(:'center_a') = 6, 'owner seeds example services');
select tests.ok((select count(*) from public.center_opening_hours where center_id = :'center_a') = 6, 'default opening hours created');
select id as staff_a from public.staff where center_id = :'center_a' \gset
select id as facial from public.services where center_id = :'center_a' and name = 'Higiene facial profunda' \gset
select tests.ok((select role from public.center_members where center_id = :'center_a') = 'owner', 'creator is owner');
update public.centers set online_booking_enabled = true, min_notice_minutes = 0 where id = :'center_a';
insert into public.resources(center_id, name) values (:'center_a', 'Cabina 1') returning id as cabina \gset
insert into public.service_resources(center_id, service_id, resource_id) values (:'center_a', :'facial', :'cabina');

-- 2. Invite an employee with limited permissions.
select public.invite_member(:'center_a', 'recepcion@test.dev', 'reception') as invite \gset
select tests.ok((select count(*) from public.notifications where kind = 'invitation') = 1, 'invitation email queued');
select tests.login('intrusa@test.dev');
select tests.fails(format('select public.accept_invitation(%L)', :'invite'), 'invitation_email_mismatch', 'invitation only works for the invited email');
select tests.login('recepcion@test.dev');
select tests.ok(public.accept_invitation(:'invite') = :'center_a', 'employee accepts invitation');
select tests.fails(format('select public.seed_example_services(%L)', :'center_a'), 'forbidden', 'reception cannot change the service catalogue');
update public.services set price_cents = 1 where center_id = :'center_a';
select tests.ok((select price_cents from public.services where id = :'facial') = 4500, 'reception update on services has no effect');

-- 3. A client books online (anonymous visitor).
select slug as slug_a from public.centers where id = :'center_a' \gset
select tests.anon();
select tests.ok(jsonb_array_length(public.public_center(:'slug_a') -> 'services') = 6, 'public page lists services');
select tests.ok((select count(*) from public.public_availability(:'slug_a', :'facial', :'day')) > 10, 'public availability returns slots');
select tests.ok((select count(*) from public.clients) = 0, 'anonymous visitors cannot read clients');
select public.public_book(:'slug_a', :'facial', (:'day'::date + time '10:00') at time zone 'Europe/Madrid',
  'Lucía Pérez', '+34 600 111 222', 'lucia@test.dev', true) ->> 'token' as token \gset
select tests.fails(format($q$select public.public_book(%L, %L, %L, 'Ana', '600333444', 'ana@test.dev', false)$q$, :'slug_a', :'facial',
  (:'day'::date + time '12:00') at time zone 'Europe/Madrid'), 'privacy_required', 'online booking requires accepting the privacy notice');

-- 4. Two clients try the same slot: no double booking.
select tests.fails(format($q$select public.public_book(%L, %L, %L, 'Marta', '600999888', 'marta@test.dev', true)$q$, :'slug_a', :'facial',
  (:'day'::date + time '10:00') at time zone 'Europe/Madrid'), 'slot_taken', 'second booking of the same slot is rejected');
select tests.fails(format($q$select public.public_book(%L, %L, %L, 'Marta', '600999888', 'marta@test.dev', true)$q$, :'slug_a', :'facial',
  (:'day'::date + time '10:30') at time zone 'Europe/Madrid'), 'slot_taken', 'overlapping booking (incl. cleaning time) is rejected');
select tests.ok(not exists (select 1 from public.public_availability(:'slug_a', :'facial', :'day')
  where slot_start = (:'day'::date + time '10:00') at time zone 'Europe/Madrid'), 'booked slot disappears from availability');

-- 5. Cancelling frees the slot.
select public.public_cancel(:'token');
select tests.ok(exists (select 1 from public.public_availability(:'slug_a', :'facial', :'day')
  where slot_start = (:'day'::date + time '10:00') at time zone 'Europe/Madrid'), 'cancelled slot is available again');
select tests.ok((public.public_appointment(:'token') ->> 'status') = 'cancelled', 'client sees the cancellation');

-- 6. Reception manages appointments and records payments.
select tests.login('recepcion@test.dev');
select id as lucia from public.clients where email = 'lucia@test.dev' \gset
select public.create_appointment(:'center_a', :'lucia', :'facial', :'staff_a', (:'day'::date + time '16:00') at time zone 'Europe/Madrid') as appt \gset
select tests.fails(format('select public.create_appointment(%L, %L, %L, %L, %L)', :'center_a', :'lucia', :'facial', :'staff_a',
  (:'day'::date + time '21:00') at time zone 'Europe/Madrid'), 'outside_opening_hours', 'booking outside opening hours is rejected');
select tests.fails(format($q$insert into public.appointments(center_id, client_id, service_id, staff_id, starts_at, ends_at, block_ends_at,
  service_name_snapshot, duration_snapshot_minutes, price_snapshot_cents) values (%L, %L, %L, %L, now(), now() + interval '1h', now() + interval '1h', 'x', 60, 0)$q$,
  :'center_a', :'lucia', :'facial', :'staff_a'), 'permission denied', 'browser cannot insert appointments directly');
select public.reschedule_appointment(:'appt', (:'day'::date + time '17:00') at time zone 'Europe/Madrid');
select public.set_appointment_status(:'appt', 'completed');
select public.record_payment(:'center_a', 4500, 'card', :'appt') as payment \gset
select tests.ok((select paid_cents from public.appointment_balances where appointment_id = :'appt') = 4500, 'appointment shows as paid');
select tests.fails(format('select public.refund_payment(%L, 1000)', :'payment'), 'forbidden', 'reception cannot refund');
select tests.fails(format('update public.payments set amount_cents = 1 where id = %L', :'payment'), 'permission denied', 'payments cannot be edited');
select tests.fails(format('select public.export_center_data(%L)', :'center_a'), 'forbidden', 'only the owner can export');
select tests.fails(format('select public.get_client_health_notes(%L)', :'lucia'), 'forbidden', 'reception cannot read health notes');

-- 7. One center never sees another center's data.
select tests.login('owner.b@test.dev');
select public.create_my_first_center('Centro Bella') as center_b \gset
select tests.ok((select count(*) from public.clients) = 0, 'center B sees no clients of center A');
select tests.ok((select count(*) from public.appointments) = 0, 'center B sees no appointments of center A');
select tests.ok((select count(*) from public.payments) = 0, 'center B sees no payments of center A');
select tests.ok((select count(*) from public.services) = 0, 'center B sees no services of center A');
select tests.ok((select count(*) from public.centers) = 1, 'center B sees only its own center');
select tests.fails(format('select public.create_appointment(%L, %L, %L, %L, %L)', :'center_a', :'lucia', :'facial', :'staff_a',
  (:'day'::date + time '11:00') at time zone 'Europe/Madrid'), 'forbidden', 'center B cannot book in center A');
select tests.fails(format($q$insert into public.clients(center_id, name) values (%L, 'Infiltrada')$q$, :'center_a'), 'row-level security', 'center B cannot add clients to center A');

-- 8. Historical prices are kept.
select tests.login('owner.a@test.dev');
update public.services set price_cents = 5200 where id = :'facial';
select tests.ok((select price_snapshot_cents from public.appointments where id = :'appt') = 4500, 'old appointment keeps its price after a price change');
select tests.ok(exists (select 1 from public.audit_log where entity = 'services' and (details ->> 'price_to')::int = 5200), 'price change is audited');

-- 9. Notifications are not duplicated.
update public.clients set email = 'lucia@test.dev' where id = :'lucia';
select tests.ok((select count(*) from public.notifications where appointment_id = :'appt' and kind = 'confirmation') = 1, 'one confirmation per appointment');
select tests.ok((select count(*) from public.notifications where kind = 'cancellation') = 1, 'one cancellation message');
select tests.ok((select count(*) from public.notifications where appointment_id = :'appt' and kind = 'reminder' and status = 'queued') = 0,
  'no reminder stays queued for a moved and completed appointment');
select tests.ok((select count(*) from public.notifications where appointment_id = :'appt' and kind = 'reminder') = 2,
  'moving an appointment replaces its reminder');

-- 10. Appointment changes and payments leave a trail.
select tests.ok((select array_agg(event_type order by created_at, event_type) from public.appointment_events where appointment_id = :'appt')
  @> array['created', 'rescheduled', 'status_changed'], 'appointment history records creation, move and status change');
select tests.ok(exists (select 1 from public.audit_log where entity = 'payments'), 'payment is audited');

-- 11. The owner can export the center's data.
select tests.ok(jsonb_array_length(public.export_center_data(:'center_a') -> 'appointments') = 2, 'owner exports all appointments');

-- Health notes: written by the owner, readable with an access log entry.
insert into public.client_health_notes(center_id, client_id, content, created_by)
  values (:'center_a', :'lucia', 'Alergia al níquel', (:'owner_a'));
select tests.ok((select count(*) from public.get_client_health_notes(:'lucia')) = 1, 'owner reads health notes');
select tests.ok(exists (select 1 from public.audit_log where entity = 'client_health_notes' and action = 'view'), 'health note access is logged');

-- Roles: the last owner cannot be demoted.
select tests.fails(format('select public.set_member_role(%L, %L, %L)', :'center_a',
  :'owner_a', 'admin'), 'last_owner', 'last owner cannot be demoted');

-- Time off blocks the agenda.
insert into public.staff_working_hours(center_id, staff_id, weekday, starts_at, ends_at)
  values (:'center_a', :'staff_a', 3, '09:30', '14:00');
select tests.fails(format('select public.create_appointment(%L, %L, %L, %L, %L)', :'center_a', :'lucia', :'facial', :'staff_a',
  (:'day'::date + time '15:00') at time zone 'Europe/Madrid'), 'staff_not_working', 'professional working hours are enforced');
insert into public.staff_time_off(center_id, staff_id, starts_at, ends_at)
  values (:'center_a', :'staff_a', (:'day'::date + time '09:00') at time zone 'Europe/Madrid', (:'day'::date + time '11:00') at time zone 'Europe/Madrid');
select tests.fails(format('select public.create_appointment(%L, %L, %L, %L, %L)', :'center_a', :'lucia', :'facial', :'staff_a',
  (:'day'::date + time '10:00') at time zone 'Europe/Madrid'), 'staff_time_off', 'time off blocks bookings');

-- Notification dispatcher claims each message once.
reset role;
set role service_role;
select tests.ok((select count(*) from public.claim_due_notifications(50)) >= 2, 'dispatcher claims due messages');
select tests.ok((select count(*) from public.claim_due_notifications(50)) = 0, 'claimed messages are not handed out twice');
reset role;

\warn 'All manager MVP tests passed'
