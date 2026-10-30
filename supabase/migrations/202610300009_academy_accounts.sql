-- Aula Estética Academy · student accounts
-- What each student has paid for (written only by the Stripe webhook with the service role) and
-- her course progress (written by the student herself, so she can continue on any device).

create table public.academy_entitlements (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 -- A premium course id (e.g. 'microblading'), 'all' (all-access pass) or 'monthly' / 'yearly' (Aula Pro).
 product text not null check (product ~ '^[a-z0-9-]{2,40}$'),
 active boolean not null default true,
 -- null = forever (single courses). The pass lasts a year; subscriptions follow the Stripe period.
 expires_at timestamptz,
 stripe_session_id text unique,
 stripe_subscription_id text unique,
 stripe_customer_id text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index academy_entitlements_user_idx on public.academy_entitlements(user_id);

alter table public.academy_entitlements enable row level security;
create policy academy_entitlements_select_own on public.academy_entitlements
 for select to authenticated using (user_id = (select auth.uid()));
-- No insert/update/delete policies: only the webhook (service role) grants access.
revoke insert, update, delete on public.academy_entitlements from anon, authenticated;
revoke all on public.academy_entitlements from anon;

create table public.academy_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 -- Same shape as the app's Progress: { points, courses: { [id]: { step, done } }, log: [...] }.
 progress jsonb not null default '{"points":0,"courses":{}}'::jsonb check (jsonb_typeof(progress) = 'object' and pg_column_size(progress) < 200000),
 certs jsonb not null default '[]'::jsonb check (jsonb_typeof(certs) = 'array' and pg_column_size(certs) < 50000),
 updated_at timestamptz not null default now()
);

alter table public.academy_progress enable row level security;
create policy academy_progress_select_own on public.academy_progress
 for select to authenticated using (user_id = (select auth.uid()));
create policy academy_progress_insert_own on public.academy_progress
 for insert to authenticated with check (user_id = (select auth.uid()));
create policy academy_progress_update_own on public.academy_progress
 for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.academy_progress from anon;
revoke delete on public.academy_progress from authenticated;
