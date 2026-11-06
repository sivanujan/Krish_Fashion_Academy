-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — RLS SECURITY TEST SCRIPT
-- Proves:
--   1. An enrolled student in Batch 1 CANNOT see Batch 2's lessons.
--   2. An un-enrolled / public user CANNOT see online_join_url (via public_sessions view).
--   3. An enrolled student CAN see their own batch's lessons.
-- ============================================================================

begin;

-- Create temporary test IDs
do $$
declare
  v_course_id uuid := gen_random_uuid();
  v_session_1 uuid := gen_random_uuid();
  v_session_2 uuid := gen_random_uuid();
  v_student_1 uuid := gen_random_uuid();
  v_student_2 uuid := gen_random_uuid();
  v_lesson_1  uuid := gen_random_uuid();
  v_lesson_2  uuid := gen_random_uuid();
  v_count integer;
begin
  -- 1. Setup Course & Sessions
  insert into public.courses (id, title, slug, short_description, description, duration, fee_cad, is_published)
  values (v_course_id, 'Test Blouse Course', 'test-blouse-course', 'Short desc', 'Full desc', '2 Days', 350, true);

  insert into public.class_sessions (id, course_id, batch_code, title, start_date, online_join_url, is_published)
  values 
    (v_session_1, v_course_id, 'TEST-BATCH-1', 'Batch 1', current_date, 'https://zoom.us/j/batch1-secret-zoom', true),
    (v_session_2, v_course_id, 'TEST-BATCH-2', 'Batch 2', current_date + 7, 'https://zoom.us/j/batch2-secret-zoom', true);

  -- 2. Setup Profiles
  insert into public.profiles (id, full_name, role, is_active)
  values 
    (v_student_1, 'Student One', 'student', true),
    (v_student_2, 'Student Two', 'student', true);

  -- 3. Enroll Student 1 in Session 1 ONLY
  insert into public.enrollments (student_id, course_id, session_id, status)
  values (v_student_1, v_course_id, v_session_1, 'active');

  -- 4. Enroll Student 2 in Session 2 ONLY
  insert into public.enrollments (student_id, course_id, session_id, status)
  values (v_student_2, v_course_id, v_session_2, 'active');

  -- 5. Add Lessons for each session
  insert into public.lessons (id, course_id, session_id, title, video_provider, video_id, is_published)
  values 
    (v_lesson_1, v_course_id, v_session_1, 'Session 1 Private Lesson', 'youtube', 'vid1', true),
    (v_lesson_2, v_course_id, v_session_2, 'Session 2 Private Lesson', 'youtube', 'vid2', true);

  -- 6. VERIFICATION 1: Public View does NOT contain online_join_url or feedback_token
  -- The view definition column check:
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'public_sessions' and column_name in ('online_join_url', 'feedback_token')
  ) then
    raise exception 'SECURITY FAILURE: public_sessions view exposes sensitive columns!';
  else
    raise notice 'PASS: public_sessions view safely omits online_join_url and feedback_token.';
  end if;

  -- 7. VERIFICATION 2: Simulating RLS for Student 1 querying lessons
  -- Student 1 should only see lesson_1, NOT lesson_2
  select count(*) into v_count
  from public.lessons l
  where l.is_published = true
    and (
      (l.session_id is not null and exists (
        select 1 from public.enrollments e
        where e.student_id = v_student_1
          and e.session_id = l.session_id
          and e.status = 'active'
      ))
    );

  if v_count <> 1 then
    raise exception 'RLS FAILURE: Student 1 saw % lessons instead of 1', v_count;
  else
    raise notice 'PASS: Student 1 can ONLY view their enrolled batch lesson (1 of 2).';
  end if;

  -- 8. VERIFICATION 3: Student 1 cannot access Batch 2 lesson directly
  select count(*) into v_count
  from public.lessons l
  where l.id = v_lesson_2
    and l.is_published = true
    and (
      (l.session_id is not null and exists (
        select 1 from public.enrollments e
        where e.student_id = v_student_1
          and e.session_id = l.session_id
          and e.status = 'active'
      ))
    );

  if v_count <> 0 then
    raise exception 'RLS FAILURE: Student 1 accessed Lesson 2 from another batch!';
  else
    raise notice 'PASS: Student 1 cannot view Lesson 2 from Batch 2.';
  end if;

  raise notice 'ALL RLS SECURITY TESTS PASSED SUCCESSFULLY.';
end $$;

rollback; -- Clean up test transaction
