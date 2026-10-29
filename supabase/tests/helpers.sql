-- Test helpers shared by the *.test.sql files (see scripts/test-db.sh).
create schema tests;
grant usage on schema tests to anon, authenticated, service_role;

create function tests.login(p_email text) returns void language plpgsql as $$
declare v_id uuid;
begin
  reset role;
  select id into v_id from auth.users where email = p_email;
  perform set_config('request.jwt.claims', json_build_object('sub', v_id, 'email', p_email, 'role', 'authenticated')::text, false);
  set role authenticated;
end $$;
create function tests.anon() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', false);
  set role anon;
end $$;
create function tests.ok(p_condition boolean, p_label text) returns void language plpgsql as $$
begin
  if not coalesce(p_condition, false) then raise exception 'FAILED: %', p_label; end if;
  raise notice 'ok - %', p_label;
end $$;
-- Runs p_sql and expects it to fail with a message containing p_expected.
create function tests.fails(p_sql text, p_expected text, p_label text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if position(p_expected in sqlerrm) > 0 then raise notice 'ok - %', p_label; return; end if;
    raise exception 'FAILED: % (expected "%", got "%")', p_label, p_expected, sqlerrm;
  end;
  raise exception 'FAILED: % (no error raised)', p_label;
end $$;
grant execute on all functions in schema tests to anon, authenticated, service_role;

