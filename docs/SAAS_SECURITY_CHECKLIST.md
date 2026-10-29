# Security and release checklist

- [ ] Authentication: confirmation, recovery, session expiry, MFA for privileged operators
- [ ] Tenant provisioning only via authorized backend function; atomic owner membership
- [ ] RLS tests for same-tenant and cross-tenant access per table/operation
- [ ] Role matrix verified: owner, admin, reception, professional
- [ ] Booking endpoint atomic; overlap, buffer, resource, leave, timezone and idempotency tests
- [ ] Audit events for appointment status and financial changes
- [ ] Payment provider webhook signature verification, idempotency and reconciliation
- [ ] Secrets kept server-side; least privilege and rotation procedure
- [ ] RGPD: notices, lawful basis, processor agreements, retention/deletion, data export, breach response
- [ ] AI/WhatsApp: approved templates, opt-in evidence, minimal context, retention, human escalation; no diagnosis or clinical decisions
- [ ] Monitoring, backups, restore drill, rate limiting, abuse protection and incident ownership
- [ ] CI build/lint/typecheck/tests and staging acceptance before merging/releasing
- [ ] Keep academy access entitlements server-verified; remove demo payment unlock route before live billing
