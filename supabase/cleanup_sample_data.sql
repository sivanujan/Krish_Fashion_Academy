-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — CLEANUP SAMPLE DATA
-- Run this script in Supabase SQL Editor whenever you want to remove all SAMPLE entries.
-- ============================================================================

-- Remove sample feedback
delete from public.feedback
where id in (
  'd1111111-1111-1111-1111-111111111111',
  'd2222222-2222-2222-2222-222222222222',
  'd3333333-3333-3333-3333-333333333333'
) or name like '%(SAMPLE)%';

-- Remove sample recordings/lessons
delete from public.lessons
where id in (
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222'
) or title like '%(SAMPLE)%';

-- Remove sample enrollments
delete from public.enrollments
where session_id in (
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
);

-- Remove sample batches / class sessions
delete from public.class_sessions
where id in (
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
) or batch_code like '%-SAMPLE';

-- Notice: the flagship course '2-Day Saree Blouse Master Class' and real site_settings
-- are kept intact as they represent real business content.
