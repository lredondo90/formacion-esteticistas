-- Tightens function permissions flagged by the Supabase security advisor.
-- Trigger functions run from their triggers and never need to be callable through the API.
revoke execute on function public.handle_new_user(), public.log_appointment_event(),
  public.appointment_notifications(), public.audit_row() from authenticated;
revoke execute on function public._can_manage_appointments(uuid, uuid) from authenticated;
-- RLS helpers only make sense for signed-in users.
revoke execute on function public.is_center_member(uuid), public.has_center_role(uuid, public.center_role[]) from anon;
alter function public.slugify(text) set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;
