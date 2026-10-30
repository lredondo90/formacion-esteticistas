-- Academy accounts: each student sees only her own purchases and progress, and cannot grant herself
-- a course (only the Stripe webhook, with the service role, writes entitlements).
reset role;
insert into auth.users(email) values ('ana@alumna.test'), ('bea@alumna.test');
insert into public.academy_entitlements(user_id, product, stripe_session_id)
select id, 'microblading', 'cs_test_ana' from auth.users where email = 'ana@alumna.test';

select tests.login('ana@alumna.test');
select tests.ok((select count(*) from public.academy_entitlements) = 1, 'a student sees her purchase');
select tests.fails(
  $$insert into public.academy_entitlements(user_id, product) values (auth.uid(), 'all')$$,
  'permission denied', 'a student cannot unlock a course herself');
select tests.fails(
  $$update public.academy_entitlements set expires_at = null$$,
  'permission denied', 'a student cannot extend her access');
insert into public.academy_progress(user_id, progress) values (auth.uid(), '{"points":40,"courses":{"microblading":{"step":3,"done":false}}}');
update public.academy_progress set progress = jsonb_set(progress, '{points}', '50');
select tests.ok((select (progress->>'points')::int from public.academy_progress) = 50, 'a student saves her progress');

select tests.login('bea@alumna.test');
select tests.ok((select count(*) from public.academy_entitlements) = 0, 'a student does not see other purchases');
select tests.ok((select count(*) from public.academy_progress) = 0, 'a student does not see other progress');
select tests.fails(
  $$insert into public.academy_progress(user_id) values (gen_random_uuid())$$,
  'row-level security', 'a student cannot write someone else''s progress');

select tests.anon();
select tests.fails($$select * from public.academy_entitlements$$, 'permission denied', 'visitors cannot read purchases');
select tests.fails($$select * from public.academy_progress$$, 'permission denied', 'visitors cannot read progress');
reset role;
