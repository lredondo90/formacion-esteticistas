# Supabase setup · Manager foundation

## Apply only to a non-production project
1. Create a Supabase development project.
2. Review the SQL migration with a qualified security reviewer before applying.
3. Apply `supabase/migrations/202610290002_manager_auth_tenant.sql`.
4. Apply `supabase/migrations/202610290003_business_operations.sql` for staff hours, leave, expenses, and inventory.
5. Apply `supabase/migrations/202610290004_center_onboarding.sql` for the authenticated first-center creation RPC.
6. Keep using a public publishable key only in client-side environment variables.
7. Enable email confirmation and configure redirect URLs for local development and preview deployments.
8. Do not expose service-role keys in Vite variables. Only public anon/publishable key belongs client-side.

## Important blockers before production
- The migration intentionally does not provide center signup, invitation acceptance, staff provisioning, or owner-transfer workflows. Implement those with a server-side Edge Function/RPC using trusted authorization.
- RLS is an initial perimeter, not a completed authorization audit. Verify all policies and role semantics, including whether reception can see payments and whether staff can edit appointments.
- Exclusion constraint prevents concurrent overlapping reservations per staff identity, but does not handle buffers, resources, opening hours, leave, duration calculations, location timezone, booking idempotency, or cancellation audit by itself.
- Use a transactional server booking endpoint; never trust browser checks for collision protection.
- Payment ledger needs provider webhooks, reconciliation, refund semantics, and idempotency.
- Add privacy notice, processing basis, retention and deletion workflows, consent evidence where applicable, DPA/subprocessor review, and avoid clinical/sensitive data in free text.
- Existing academy purchase/plan unlock flow has a client-side demo success path. Disable that behavior for live commerce until server-verified provider webhook entitlements exist.

## Current client status
The Manager route now uses Supabase Auth for signup, login, email confirmation, password recovery, and first-center onboarding. Its client directory reads and writes `public.clients` using the authenticated center id and RLS. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in local development or a Vercel Preview environment, and allow that environment's redirect URL in Supabase Auth. No secret/service-role key belongs in browser variables.

Appointments and services remain demonstrations and are not stored in Supabase. Do not enter real appointment or payment data until the transactional booking and authorization work is complete. Review and verify the RLS policies and tenant separation before production use.

