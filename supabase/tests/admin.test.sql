-- Platform admin panel: only platform admins see income and users, each role only its own area,
-- and only the owner can add or remove admins.
reset role;
create function tests.uid(p_email text) returns uuid language sql stable security definer as $$ select id from auth.users where email = p_email $$;
grant execute on function tests.uid(text) to authenticated;
insert into auth.users(email) values ('jefa@belaura.test'), ('cursos@belaura.test'), ('gestor@belaura.test'), ('alumna@belaura.test');
insert into public.platform_admins(user_id, role) select id, 'owner' from auth.users where email = 'jefa@belaura.test';
insert into public.academy_payments(user_id, product, kind, amount_cents, currency, stripe_ref)
select id, 'microblading', 'purchase', 4900, 'EUR', 'cs_admin_test' from auth.users where email = 'alumna@belaura.test';

select tests.login('alumna@belaura.test');
select tests.ok(public.platform_role() is null, 'a student has no platform role');
select tests.fails($$select public.admin_academy_overview()$$, 'forbidden', 'a student cannot see income');
select tests.fails($$select * from public.admin_list_users()$$, 'forbidden', 'a student cannot list users');
select tests.fails($$select * from public.academy_payments$$, 'permission denied', 'a student cannot read payments');
select tests.fails($$select * from public.platform_admins$$, 'permission denied', 'a student cannot read admins');
select tests.fails($$select public.admin_set_platform_role('alumna@belaura.test', 'owner')$$, 'forbidden', 'a student cannot make herself admin');

select tests.login('jefa@belaura.test');
select tests.ok(public.platform_role() = 'owner', 'the owner is recognised');
select tests.ok((public.admin_academy_overview() ->> 'revenue_total_cents')::int = 4900, 'the owner sees academy income');
select tests.ok((select count(*) from public.admin_list_users()) >= 4, 'the owner lists users');
select tests.ok((select spent_cents from public.admin_list_users('alumna@belaura')) = 4900, 'user list shows what each student spent');
select public.admin_set_platform_role('cursos@belaura.test', 'courses');
select public.admin_set_platform_role('gestor@belaura.test', 'manager');
select tests.ok((select count(*) from public.admin_list_admins()) = 3, 'the owner adds admins');
select public.admin_grant_product(tests.uid('alumna@belaura.test'), 'all', null, 'Regalo');
select tests.ok((select count(*) from public.admin_user_entitlements(tests.uid('alumna@belaura.test')) where source = 'manual') = 1, 'the owner gives a course by hand');
select tests.fails($$select public.admin_set_platform_role('jefa@belaura.test', null)$$, 'last_owner', 'the last owner cannot be removed');

select tests.login('cursos@belaura.test');
select tests.ok((public.admin_academy_overview() ->> 'sales_total')::int = 1, 'a courses admin sees academy income');
select tests.fails($$select public.admin_manager_overview()$$, 'forbidden', 'a courses admin cannot see the manager area');
select tests.fails($$select public.admin_set_platform_role('alumna@belaura.test', 'courses')$$, 'forbidden', 'a courses admin cannot add admins');
select public.admin_set_entitlement_active((select id from public.admin_user_entitlements(tests.uid('alumna@belaura.test')) where source = 'manual'), false);
select tests.ok((select not active from public.admin_user_entitlements(tests.uid('alumna@belaura.test')) where source = 'manual'), 'a courses admin removes access');

select tests.login('gestor@belaura.test');
select tests.ok((public.admin_manager_overview() ->> 'centers')::int >= 0, 'a manager admin sees the manager area');
select tests.fails($$select public.admin_academy_overview()$$, 'forbidden', 'a manager admin cannot see academy income');
select tests.fails($$select public._require_platform('owner')$$, 'permission denied', 'the internal check is not callable');
reset role;
