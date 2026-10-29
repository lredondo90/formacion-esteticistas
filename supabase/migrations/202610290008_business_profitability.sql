-- Aula Estética Business · Etapa 4: stock, escandallos, comisiones y rentabilidad.
-- Apply after 202610290007. Contains no destructive statements.

-- ───────────────────────── Stock ─────────────────────────
-- Stock only changes through record_stock_movement (or automatically when a treatment is
-- completed), so every unit in or out leaves a movement behind.
revoke insert, update, delete on public.inventory_movements from anon, authenticated;
revoke insert, update on public.inventory_products from anon, authenticated;
grant insert (center_id, name, sku, unit, low_stock_threshold, cost_per_unit_cents, active) on public.inventory_products to authenticated;
grant update (name, sku, unit, low_stock_threshold, cost_per_unit_cents, active, updated_at) on public.inventory_products to authenticated;
create trigger inventory_products_touch before update on public.inventory_products for each row execute function public.touch_updated_at();

alter table public.inventory_movements add column appointment_id uuid references public.appointments(id) on delete set null;
create index inventory_movements_appointment_idx on public.inventory_movements(appointment_id);

create or replace function public.record_stock_movement(
  p_product uuid, p_type text, p_quantity numeric, p_unit_cost_cents int default null, p_note text default null)
returns numeric language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_product public.inventory_products;
  v_delta numeric;
begin
  select * into v_product from public.inventory_products where id = p_product for update;
  if v_product.id is null then raise exception 'product_not_found' using errcode = 'P0001'; end if;
  if not public.has_center_role(v_product.center_id, array['owner', 'admin']::public.center_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_type not in ('purchase', 'use', 'adjustment', 'waste', 'return') or p_quantity is null or p_quantity = 0 then
    raise exception 'invalid_movement' using errcode = '22023';
  end if;
  -- purchase/return add stock, use/waste remove it, adjustment takes the sign given.
  v_delta := case when p_type in ('purchase', 'return') then abs(p_quantity)
                  when p_type in ('use', 'waste') then -abs(p_quantity)
                  else p_quantity end;
  if v_product.quantity + v_delta < 0 then raise exception 'insufficient_stock' using errcode = 'P0001'; end if;
  insert into public.inventory_movements(center_id, product_id, movement_type, quantity_delta, unit_cost_cents, notes, created_by)
  values (v_product.center_id, p_product, p_type, v_delta, p_unit_cost_cents, nullif(trim(p_note), ''), auth.uid());
  update public.inventory_products set
    quantity = quantity + v_delta,
    -- Purchases update the unit cost with a weighted average.
    cost_per_unit_cents = case
      when p_type = 'purchase' and p_unit_cost_cents is not null then
        round(((greatest(v_product.quantity, 0) * v_product.cost_per_unit_cents) + (abs(p_quantity) * p_unit_cost_cents))
              / nullif(greatest(v_product.quantity, 0) + abs(p_quantity), 0))::int
      else cost_per_unit_cents end
  where id = p_product;
  return v_product.quantity + v_delta;
end $$;

-- ───────────────────────── Escandallos (materials per treatment) ─────────────────────────
create table public.service_materials (
  center_id uuid not null,
  service_id uuid not null,
  product_id uuid not null,
  quantity numeric(12,3) not null check (quantity > 0),
  primary key (service_id, product_id),
  foreign key (center_id, service_id) references public.services(center_id, id) on delete cascade,
  foreign key (center_id, product_id) references public.inventory_products(center_id, id) on delete cascade
);
alter table public.service_materials enable row level security;
create policy service_materials_read on public.service_materials for select to authenticated using (public.is_center_member(center_id));
create policy service_materials_manage on public.service_materials for all to authenticated
  using (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]))
  with check (public.has_center_role(center_id, array['owner', 'admin']::public.center_role[]));
grant select, insert, update, delete on public.service_materials to authenticated;

-- ───────────────────────── Commissions ─────────────────────────
alter table public.staff add column commission_percent numeric(5,2) not null default 0 check (commission_percent between 0 and 100);

-- Real cost and commission are frozen on the appointment when it is completed.
alter table public.appointments
  add column material_cost_cents int,
  add column commission_cents int;

create or replace function public.appointment_completion()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_item record;
  v_cost int := 0;
  v_take numeric;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    for v_item in
      select sm.product_id, sm.quantity, p.quantity as stock, p.cost_per_unit_cents
        from public.service_materials sm join public.inventory_products p on p.id = sm.product_id
       where sm.service_id = new.service_id
         for update of p
    loop
      v_cost := v_cost + round(v_item.quantity * v_item.cost_per_unit_cents)::int;
      -- Never block the appointment: consume what is in stock and note any shortfall.
      v_take := least(v_item.quantity, greatest(v_item.stock, 0));
      if v_take > 0 then
        insert into public.inventory_movements(center_id, product_id, movement_type, quantity_delta, unit_cost_cents, notes, appointment_id, created_by)
        values (new.center_id, v_item.product_id, 'use', -v_take, v_item.cost_per_unit_cents,
                case when v_take < v_item.quantity then 'Consumo de tratamiento (stock insuficiente)' else 'Consumo de tratamiento' end,
                new.id, auth.uid());
        update public.inventory_products set quantity = quantity - v_take where id = v_item.product_id;
      end if;
    end loop;
    update public.appointments set
      material_cost_cents = v_cost,
      commission_cents = round(new.price_snapshot_cents * coalesce((select commission_percent from public.staff where id = new.staff_id), 0) / 100)::int
    where id = new.id;
  elsif old.status = 'completed' and new.status is distinct from 'completed' then
    -- Marked as completed by mistake: give the materials back.
    for v_item in
      select product_id, sum(quantity_delta) as net from public.inventory_movements
       where appointment_id = new.id group by product_id having sum(quantity_delta) < 0
    loop
      insert into public.inventory_movements(center_id, product_id, movement_type, quantity_delta, notes, appointment_id, created_by)
      values (new.center_id, v_item.product_id, 'return', -v_item.net, 'Devolución: la cita no se realizó', new.id, auth.uid());
      update public.inventory_products set quantity = quantity - v_item.net where id = v_item.product_id;
    end loop;
    update public.appointments set material_cost_cents = null, commission_cents = null where id = new.id;
  end if;
  return null;
end $$;
create trigger appointments_completion after update of status on public.appointments
  for each row execute function public.appointment_completion();

-- ───────────────────────── Expenses ─────────────────────────
alter table public.expenses add constraint expenses_category_check
  check (category in ('alquiler', 'personal', 'producto', 'suministros', 'marketing', 'software', 'impuestos', 'formacion', 'otros'));
create trigger expenses_touch before update on public.expenses for each row execute function public.touch_updated_at();
create trigger expenses_audit after insert or update or delete on public.expenses for each row execute function public.audit_row();

-- ───────────────────────── Report ─────────────────────────
-- Everything the "Informes" screen shows for a period, computed in one place (owner/admin only).
create or replace function public.business_report(p_center uuid, p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_tz text;
  v_from timestamptz;
  v_to timestamptz;
  v_open_minutes numeric := 0;
  v_staff int;
  v_d date;
  v_result jsonb;
begin
  if not public.has_center_role(p_center, array['owner', 'admin']::public.center_role[]) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_to < p_from or p_to - p_from > 400 then raise exception 'invalid_period' using errcode = '22023'; end if;
  select timezone into v_tz from public.centers where id = p_center;
  v_from := p_from::timestamp at time zone v_tz;
  v_to := (p_to + 1)::timestamp at time zone v_tz;

  -- Capacity: opening minutes in the period (minus closures) × bookable team.
  for v_d in select generate_series(p_from, p_to, interval '1 day')::date loop
    if not exists (select 1 from public.center_closures where center_id = p_center and v_d between starts_on and ends_on) then
      v_open_minutes := v_open_minutes + coalesce((select sum(extract(epoch from closes_at - opens_at) / 60) from public.center_opening_hours
                                                   where center_id = p_center and weekday = extract(dow from v_d)::int), 0);
    end if;
  end loop;
  select count(*) into v_staff from public.staff where center_id = p_center and active and bookable;

  with appts as (
    select a.*, extract(dow from a.starts_at at time zone v_tz)::int as dow, extract(hour from a.starts_at at time zone v_tz)::int as hour
      from public.appointments a
     where a.center_id = p_center and a.starts_at >= v_from and a.starts_at < v_to
  ), done as (
    select * from appts where status = 'completed'
  ), pays as (
    select coalesce(sum(case when kind = 'refund' then -amount_cents else amount_cents end), 0) as net,
           coalesce(sum(amount_cents) filter (where kind = 'refund'), 0) as refunds
      from public.payments where center_id = p_center and created_at >= v_from and created_at < v_to
  ), exp as (
    select category, sum(amount_cents) as total from public.expenses
     where center_id = p_center and incurred_on between p_from and p_to group by category
  )
  select jsonb_build_object(
    'from', p_from, 'to', p_to,
    'collected_cents', (select net from pays),
    'refunds_cents', (select refunds from pays),
    'billed_cents', (select coalesce(sum(price_snapshot_cents), 0) from done),
    'material_cost_cents', (select coalesce(sum(material_cost_cents), 0) from done),
    'commission_cents', (select coalesce(sum(commission_cents), 0) from done),
    'expenses_cents', (select coalesce(sum(total), 0) from exp),
    'expenses_by_category', (select coalesce(jsonb_object_agg(category, total), '{}'::jsonb) from exp),
    'appointments', jsonb_build_object(
      'completed', (select count(*) from done),
      'cancelled', (select count(*) from appts where status in ('cancelled', 'rejected', 'expired')),
      'no_show', (select count(*) from appts where status = 'no_show'),
      'upcoming', (select count(*) from appts where status in ('pending', 'confirmed')),
      'online', (select count(*) from appts where source = 'online')),
    'capacity_minutes', round(v_open_minutes * v_staff)::int,
    'booked_minutes', (select coalesce(sum(duration_snapshot_minutes), 0) from appts where status in ('completed', 'confirmed', 'pending')),
    'by_service', (select coalesce(jsonb_agg(x order by x.revenue desc), '[]'::jsonb) from (
        select service_id, max(service_name_snapshot) as name, count(*) as count, sum(price_snapshot_cents) as revenue,
               sum(coalesce(material_cost_cents, 0)) as materials, sum(coalesce(commission_cents, 0)) as commissions,
               sum(duration_snapshot_minutes) as minutes
          from done group by service_id) x),
    'by_staff', (select coalesce(jsonb_agg(x order by x.revenue desc), '[]'::jsonb) from (
        select s.id as staff_id, s.display_name as name, count(d.id) as count, coalesce(sum(d.price_snapshot_cents), 0) as revenue,
               coalesce(sum(d.commission_cents), 0) as commissions, coalesce(sum(d.duration_snapshot_minutes), 0) as minutes,
               (select count(*) from appts a where a.staff_id = s.id and a.status = 'no_show') as no_show
          from public.staff s left join done d on d.staff_id = s.id
         where s.center_id = p_center and (s.active or d.id is not null)
         group by s.id, s.display_name) x),
    'heatmap', (select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'hour', hour, 'minutes', minutes)), '[]'::jsonb) from (
        select dow, hour, sum(duration_snapshot_minutes) as minutes from appts
         where status in ('completed', 'confirmed', 'pending') group by dow, hour) h),
    'low_stock', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'quantity', quantity, 'unit', unit, 'threshold', low_stock_threshold)), '[]'::jsonb)
        from public.inventory_products where center_id = p_center and active and quantity <= low_stock_threshold)
  ) into v_result;
  return v_result;
end $$;

-- ───────────────────────── Permissions ─────────────────────────
revoke all on function public.record_stock_movement(uuid, text, numeric, int, text), public.business_report(uuid, date, date),
  public.appointment_completion() from public, anon;
revoke execute on function public.appointment_completion() from authenticated;
grant execute on function public.record_stock_movement(uuid, text, numeric, int, text), public.business_report(uuid, date, date) to authenticated;
