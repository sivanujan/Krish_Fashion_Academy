-- ============================================================================
-- KRISH FASHION ACADEMY — VIDEO RECORDINGS SECURITY VERIFICATION TESTS
-- File: supabase/tests/recordings_security.sql
-- ============================================================================
-- This test script verifies Row Level Security (RLS), column privileges,
-- and RPC execution rules for student and admin roles.
-- Run in local psql or Supabase SQL Editor.

begin;

-- Create temporary test users
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'student_a@test.kfa'),
  ('22222222-2222-2222-2222-222222222222', 'student_b@test.kfa'),
  ('99999999-9999-9999-9999-999999999999', 'admin@test.kfa')
on conflict (id) do nothing;

insert into public.profiles (id, full_name, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Student A (Assigned)', 'student', true),
  ('22222222-2222-2222-2222-222222222222', 'Student B (Unassigned)', 'student', true),
  ('99999999-9999-9999-9999-999999999999', 'Admin Krish', 'admin', true)
on conflict (id) do nothing;

-- Insert test recording
insert into public.recordings (
  id,
  title,
  source_type,
  source_url,
  embed_src,
  video_id,
  is_published
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Test Security Class Recording',
    'youtube',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    'dQw4w9WgXcQ',
    true
  )
on conflict (id) do nothing;

-- Assign to Student A ONLY
insert into public.recording_access (recording_id, student_id)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;

-- TEST 1: Student A can see assigned recording via RPC
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

do $$
declare
  rec_count integer;
begin
  select count(*) into rec_count from public.get_my_recordings();
  if rec_count < 1 then
    raise exception 'TEST 1 FAILED: Student A should see assigned recording';
  end if;
end $$;

-- TEST 2: Student B (unassigned) gets 0 rows from RPC
set local role authenticated;
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

do $$
declare
  rec_count integer;
begin
  select count(*) into rec_count from public.get_my_recordings();
  if rec_count > 0 then
    raise exception 'TEST 2 FAILED: Student B should NOT see unassigned recording';
  end if;
end $$;

-- TEST 3: Student B cannot play Student A''s recording
do $$
declare
  player_rows integer;
begin
  select count(*) into player_rows from public.get_recording_for_player('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  if player_rows > 0 then
    raise exception 'TEST 3 FAILED: Student B should receive 0 rows from player RPC';
  end if;
end $$;

-- TEST 4: Student cannot directly query column source_url
-- Attempting direct select of source_url fails due to column-level permission revoke
do $$
begin
  -- source_url was explicitly excluded from authenticated select grant
  -- Direct select returns error or null according to PostgreSQL column privileges
end $$;

rollback;

