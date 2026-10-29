-- Aula Estética Manager · business operations
-- Adds operational tables. Apply after 202610290002_manager_auth_tenant.sql.
-- Test in a disposable Supabase project before production.

create table public.staff_working_hours (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  staff_id uuid not null,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (center_id, staff_id) references public.staff(center_id, id) on delete cascade
);
create index staff_hours_lookup_idx on public.staff_working_hours(center_id, staff_id, weekday) where active;

create table public.staff_time_off (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  staff_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (center_id, staff_id) references public.staff(center_id, id) on delete cascade
);
create index staff_time_off_lookup_idx on public.staff_time_off(center_id, staff_id, starts_at, ends_at);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  description text not null check (length(trim(description)) between 2 and 180),
  category text not null,
  amount_cents integer not null check (amount_cents > 0),
  incurred_on date not null default current_date,
  recurring boolean not null default false,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index expenses_center_date_idx on public.expenses(center_id, incurred_on desc);

create table public.inventory_products (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 140),
  sku text,
  unit text not null default 'unidad',
  quantity numeric(12,3) not null default 0 check (quantity >= 0),
  low_stock_threshold numeric(12,3) not null default 0 check (low_stock_threshold >= 0),
  cost_per_unit_cents integer not null default 0 check (cost_per_unit_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(center_id, sku),
  unique(center_id, id)
);
create index inventory_center_name_idx on public.inventory_products(center_id, name);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  product_id uuid not null,
  movement_type text not null check (movement_type in ('purchase','use','adjustment','waste','return')),
  quantity_delta numeric(12,3) not null check (quantity_delta <> 0),
  unit_cost_cents integer check (unit_cost_cents is null or unit_cost_cents >= 0),
  reference text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (center_id, product_id) references public.inventory_products(center_id, id) on delete cascade
);
create index inventory_movements_product_idx on public.inventory_movements(center_id, product_id, created_at desc);

alter table public.staff_working_hours enable row level security;
alter table public.staff_time_off enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory_products enable row level security;
alter table public.inventory_movements enable row level security;

create policy staff_hours_read on public.staff_working_hours for select to authenticated
using (public.is_center_member(center_id));
create policy staff_hours_manage on public.staff_working_hours for all to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]))
with check (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));

create policy staff_time_off_read on public.staff_time_off for select to authenticated
using (public.has_center_role(center_id, array['owner','admin','reception']::public.center_role[])
  or exists (select 1 from public.staff s where s.id = staff_id and s.user_id = auth.uid()));
create policy staff_time_off_manage on public.staff_time_off for all to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]))
with check (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));

create policy expenses_read on public.expenses for select to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));
create policy expenses_manage on public.expenses for all to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]))
with check (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));

create policy inventory_read on public.inventory_products for select to authenticated
using (public.is_center_member(center_id));
create policy inventory_manage on public.inventory_products for all to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]))
with check (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));

create policy inventory_movements_read on public.inventory_movements for select to authenticated
using (public.is_center_member(center_id));
create policy inventory_movements_manage on public.inventory_movements for all to authenticated
using (public.has_center_role(center_id, array['owner','admin']::public.center_role[]))
with check (public.has_center_role(center_id, array['owner','admin']::public.center_role[]));

grant select, insert, update, delete on public.staff_working_hours, public.staff_time_off,
  public.expenses, public.inventory_products, public.inventory_movements to authenticated;

-- Stock must be changed transactionally by a server/RPC that inserts a movement and updates
-- inventory_products.quantity together. Do not let the browser calculate authoritative stock.
