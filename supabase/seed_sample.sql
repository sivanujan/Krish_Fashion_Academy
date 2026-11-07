-- ============================================================================
-- DEV-ONLY SAMPLE FEEDBACK / TESTIMONIALS (DO NOT RUN IN PRODUCTION)
-- ============================================================================
-- This file contains non-production sample student feedback for local development UI testing.
-- To run locally: psql $DATABASE_URL -f supabase/seed_sample.sql

insert into public.feedback (
  id,
  session_id,
  student_id,
  name,
  phone,
  rating_overall,
  rating_teaching,
  rating_content,
  liked,
  improve,
  would_recommend,
  consent_to_publish,
  status
)
values
(
  'd1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  null,
  'Priya Shanmugam (SAMPLE)',
  '+1 647-555-0101',
  5,
  5,
  5,
  'I had zero sewing experience before this. In just 2 Sundays at the Scarborough studio, I finished stitching my own 3-dart blouse with a spotless fit. Krish is exceptionally patient and explains the pattern math so clearly!',
  'None, loved the hands-on pace.',
  true,
  true,
  'approved'
),
(
  'd2222222-2222-2222-2222-222222222222',
  'b1111111-1111-1111-1111-111111111111',
  null,
  'Ananya Raman (SAMPLE)',
  '+1 416-555-0199',
  5,
  5,
  5,
  'The paper pattern calculation formula is pure gold. Now I have the confidence to draft and cut saree blouses of any size for my mother and sisters. Truly worth every dollar.',
  'Would love an advanced collar/piping session in future.',
  true,
  true,
  'approved'
),
(
  'd3333333-3333-3333-3333-333333333333',
  'b1111111-1111-1111-1111-111111111111',
  null,
  'Shalini Vickneswaran (SAMPLE)',
  '+1 905-555-0144',
  5,
  5,
  5,
  'Joined online from Mississauga and followed along seamlessly. The portal recordings let me re-watch the dart-stitching technique during the week. Finished my blouse in 2 days!',
  'Keep up the small batch sizes!',
  true,
  true,
  'approved'
)
on conflict (id) do nothing;

-- ============================================================================
-- DEV-ONLY SAMPLE CLASS RECORDINGS (DO NOT RUN IN PRODUCTION)
-- ============================================================================
-- Guarded sample recordings for local UI testing
-- 2 recordings with public test YouTube links assigned to 1 sample student
insert into public.recordings (
  id,
  title,
  description,
  course_id,
  session_id,
  class_date,
  source_type,
  source_url,
  embed_src,
  video_id,
  thumbnail_url,
  duration_minutes,
  is_published,
  sort_order
)
values
(
  'e1111111-1111-1111-1111-111111111111',
  '[SAMPLE] Saree Blouse Armhole & Front Dart Calculation Masterclass',
  'Step-by-step drafting of the front bodice, apex point calculation, 3-dart placement, and armhole curve accuracy demonstration.',
  'a1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '2026-05-10',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
  'dQw4w9WgXcQ',
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  65,
  true,
  1
),
(
  'e2222222-2222-2222-2222-222222222222',
  '[SAMPLE] Neckline Piping, Bias Tape Cutting & Hook-Patti Finishing',
  'Detailed close-up camera angles showing 45-degree bias strip cutting, thread tension calibration, and clean concealed hook-patti stitching.',
  'a1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '2026-05-17',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
  'dQw4w9WgXcQ',
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  50,
  true,
  2
)
on conflict (id) do nothing;

-- Assign Recording 1 to sample student 1 ('c1111111-1111-1111-1111-111111111111')
-- Student 2 ('c2222222-2222-2222-2222-222222222222') is intentionally unassigned to test 404 security checks
insert into public.recording_access (
  recording_id,
  student_id,
  granted_at,
  expires_at
)
values
(
  'e1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  now(),
  null
)
on conflict (recording_id, student_id) do nothing;


