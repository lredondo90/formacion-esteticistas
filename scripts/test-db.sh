#!/usr/bin/env bash
# Applies every migration to a throwaway local PostgreSQL database and runs the SQL acceptance tests.
# Needs PostgreSQL 15+ with btree_gist. Point PGHOST/PGPORT/PGUSER at a local server (never at Supabase).
set -euo pipefail
cd "$(dirname "$0")/.."
DB="aula_test_$$"
psql -v ON_ERROR_STOP=1 -q -d postgres -c "create database $DB" >/dev/null
trap 'psql -q -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
psql -v ON_ERROR_STOP=1 -q -d "$DB" -1 -f supabase/tests/local_stub.sql
for file in supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -1 -f "$file" >/dev/null
done
for file in supabase/tests/*.test.sql; do
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$file" 2>&1 >/dev/null | sed 's/^psql:[^ ]* NOTICE:  /  /'
done
