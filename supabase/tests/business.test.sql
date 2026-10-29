-- Acceptance tests for Etapa 4: stock, materials per treatment, commissions, expenses and report.
\set ON_ERROR_STOP 1
\set QUIET 1

insert into auth.users(email) values ('biz.owner@test.dev'), ('biz.recepcion@test.dev');
select (current_date + 7 + ((3 - extract(dow from current_date + 7)::int + 7) % 7))::date as day \gset

select tests.login('biz.owner@test.dev');
select public.create_my_first_center('Centro Negocio') as center \gset
select public.seed_example_services(:'center');
select id as staff from public.staff where center_id = :'center' \gset
select id as facial from public.services where center_id = :'center' and name = 'Higiene facial profunda' \gset
update public.staff set commission_percent = 10 where id = :'staff';
insert into public.clients(center_id, name, email) values (:'center', 'Clienta Negocio', 'negocio@test.dev') returning id as client \gset

-- Stock changes only through movements.
insert into public.inventory_products(center_id, name, unit, low_stock_threshold) values (:'center', 'Mascarilla hidratante', 'ml', 100) returning id as product \gset
select tests.fails(format('update public.inventory_products set quantity = 999 where id = %L', :'product'), 'permission denied', 'stock cannot be edited directly');
select tests.ok(public.record_stock_movement(:'product', 'purchase', 500, 4) = 500, 'purchase adds stock');
select tests.ok(public.record_stock_movement(:'product', 'purchase', 500, 6) = 1000, 'second purchase adds stock');
select tests.ok((select cost_per_unit_cents from public.inventory_products where id = :'product') = 5, 'unit cost is the weighted average');
select tests.fails(format('select public.record_stock_movement(%L, %L, 5000)', :'product', 'waste'), 'insufficient_stock', 'cannot remove more than in stock');

-- Materials per treatment: 50 ml of mask = 2,50 € per facial.
insert into public.service_materials(center_id, service_id, product_id, quantity) values (:'center', :'facial', :'product', 50);
select public.create_appointment(:'center', :'client', :'facial', :'staff', (:'day'::date + time '10:00') at time zone 'Europe/Madrid') as appt \gset
select public.set_appointment_status(:'appt', 'completed');
select tests.ok((select quantity from public.inventory_products where id = :'product') = 950, 'completing the treatment consumes its materials');
select tests.ok((select material_cost_cents from public.appointments where id = :'appt') = 250, 'material cost is frozen on the appointment');
select tests.ok((select commission_cents from public.appointments where id = :'appt') = 450, 'commission is frozen on the appointment (10 %)');
select public.set_appointment_status(:'appt', 'no_show');
select tests.ok((select quantity from public.inventory_products where id = :'product') = 1000, 'undoing the completion gives the materials back');
select public.set_appointment_status(:'appt', 'completed');
select tests.ok((select quantity from public.inventory_products where id = :'product') = 950, 'completing again consumes once');
select public.record_payment(:'center', 4500, 'cash', :'appt');

-- Expenses and report.
insert into public.expenses(center_id, description, category, amount_cents, incurred_on) values (:'center', 'Alquiler', 'alquiler', 80000, :'day');
select tests.fails(format($q$insert into public.expenses(center_id, description, category, amount_cents) values (%L, 'X', 'inventada', 100)$q$, :'center'), 'expenses_category_check', 'expense categories are validated');
select public.business_report(:'center', :'day'::date - 1, :'day'::date + 1) as report \gset
select tests.ok((:'report'::jsonb ->> 'billed_cents')::int = 4500, 'report: billed revenue');
select tests.ok((:'report'::jsonb ->> 'material_cost_cents')::int = 250, 'report: material cost');
select tests.ok((:'report'::jsonb ->> 'commission_cents')::int = 450, 'report: commissions');
select tests.ok((:'report'::jsonb ->> 'expenses_cents')::int = 80000, 'report: expenses');
select tests.ok(jsonb_array_length(:'report'::jsonb -> 'by_service') = 1, 'report: profitability per service');
select tests.ok((:'report'::jsonb ->> 'capacity_minutes')::int > 0, 'report: capacity for occupancy');

-- Reception cannot see the money side.
select public.invite_member(:'center', 'biz.recepcion@test.dev', 'reception') as invite \gset
select tests.login('biz.recepcion@test.dev');
select public.accept_invitation(:'invite');
select tests.fails(format('select public.business_report(%L, current_date, current_date)', :'center'), 'forbidden', 'reception cannot open the report');
select tests.ok((select count(*) from public.expenses) = 0, 'reception cannot read expenses');
select tests.fails(format('select public.record_stock_movement(%L, %L, 1)', :'product', 'purchase'), 'forbidden', 'reception cannot move stock');
reset role;

\warn 'All business tests passed'
