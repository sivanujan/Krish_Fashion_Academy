-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — SEED DATA (SCARBOROUGH, TORONTO, ON, CANADA)
-- ============================================================================

-- 1. UPDATE SITE SETTINGS (CANADIAN LOCATION & CONTACT)
insert into public.site_settings (
  id,
  phone,
  whatsapp_number,
  email,
  address,
  map_embed_url,
  facebook_url,
  instagram_url,
  tiktok_url,
  youtube_url,
  counter_students,
  counter_years,
  counter_courses
)
values (
  '00000000-0000-0000-0000-000000000001',
  '+1 647-501-9569',
  '16475019569',
  'info@krishfashionacademy.com',
  'Middlefield Rd & McNicoll Ave, Scarborough, ON',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6b63897d833%3A0x6fdf94f1c7dcf9a!2sMiddlefield%20Rd%20%26%20McNicoll%20Ave%2C%20Toronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca',
  null,
  'https://instagram.com/krishfashionacademy',
  null,
  null,
  0,
  0,
  1
)
on conflict (id) do update set
  phone = excluded.phone,
  whatsapp_number = excluded.whatsapp_number,
  email = excluded.email,
  address = excluded.address,
  map_embed_url = excluded.map_embed_url,
  instagram_url = excluded.instagram_url,
  counter_students = excluded.counter_students,
  counter_years = excluded.counter_years,
  counter_courses = excluded.counter_courses,
  updated_at = now();

-- 2. FLAGSHIP COURSE
-- Real business facts: 2-Day Saree Blouse Master Class (3-dart saree blouse class for beginners)
insert into public.courses (
  id,
  title,
  slug,
  short_description,
  description,
  duration,
  fee_cad,
  cover_image_url,
  is_published,
  sort_order
)
values (
  'a1111111-1111-1111-1111-111111111111',
  '2-Day Saree Blouse Master Class',
  'saree-blouse-master-class',
  'Beginner-friendly master class – learn measurements, paper patterns, cutting and stitching, and finish your own 3-dart saree blouse in just 2 days.',
  'Krish Fashion Academy teaches tailoring, mainly saree blouse making, to beginners. In this hands-on 2-Day Saree Blouse Master Class, no previous sewing experience is required. Students learn taking body measurements, exact calculations, drafting paper patterns, fabric cutting, and hands-on stitching. Students practise in class and finish stitching their own 3-dart blouse in 2 days. You will gain the confidence to cut and stitch blouses of any size.',
  '2 Days (11:00 AM – 4:00 PM)',
  350.00,
  '/images/home/masterclass-blouse.webp',
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  duration = excluded.duration,
  fee_cad = excluded.fee_cad,
  is_published = true;

-- 3. CLASS SESSIONS (BATCHES) — SAMPLE DATA
-- 3a. SAMPLE COMPLETED BATCH (April Batch)
insert into public.class_sessions (
  id,
  course_id,
  batch_code,
  title,
  start_date,
  second_date,
  class_dates,
  start_time,
  end_time,
  location,
  mode,
  price_cad,
  discount_percent,
  discount_label,
  seats_total,
  seats_left,
  online_join_url,
  feedback_token,
  feedback_open,
  status,
  is_published
)
values (
  'b1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'SBM-2026-04-SAMPLE',
  '2-Day Saree Blouse Master Class (April Completed Batch - SAMPLE)',
  '2026-04-12',
  '2026-04-19',
  array['2026-04-12'::date, '2026-04-19'::date],
  '11:00:00',
  '16:00:00',
  'Middlefield Rd & McNicoll Ave, Scarborough, ON',
  'both',
  350.00,
  null,
  null,
  10,
  0,
  'https://zoom.us/j/samplecompletedbatch',
  'sample-token-batch-04',
  true,
  'completed',
  true
)
on conflict (id) do nothing;

-- 3b. SAMPLE UPCOMING BATCH (Next Month - e.g. 2 Sundays)
insert into public.class_sessions (
  id,
  course_id,
  batch_code,
  title,
  start_date,
  second_date,
  class_dates,
  start_time,
  end_time,
  location,
  mode,
  price_cad,
  discount_percent,
  discount_label,
  seats_total,
  seats_left,
  online_join_url,
  feedback_token,
  feedback_open,
  status,
  is_published
)
values (
  'b2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  'SBM-2026-11-SAMPLE',
  '2-Day Saree Blouse Master Class (Upcoming Batch - SAMPLE)',
  '2026-11-22',
  '2026-11-29',
  array['2026-11-22'::date, '2026-11-29'::date],
  '11:00:00',
  '16:00:00',
  'Middlefield Rd & McNicoll Ave, Scarborough, ON',
  'both',
  350.00,
  30,
  '30% OFF',
  12,
  4,
  'https://zoom.us/j/sampleupcomingbatch',
  'sample-token-batch-11',
  false,
  'upcoming',
  true
)
on conflict (id) do nothing;

-- 4. LESSONS / RECORDINGS (Attached to completed batch b1111111-1111-1111-1111-111111111111)
insert into public.lessons (
  id,
  course_id,
  session_id,
  title,
  description,
  class_date,
  sort_order,
  video_provider,
  video_id,
  is_published
)
values
(
  'c1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'Day 1 Recording: Measurements, Calculations & Paper Pattern (SAMPLE)',
  'Complete walkthrough of taking 12 body measurements, ease calculations, and drafting the standard 3-dart pattern block.',
  '2026-04-12',
  1,
  'youtube',
  'dQw4w9WgXcQ',
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'Day 2 Recording: Fabric Cutting, Assembly & Finished Stitching (SAMPLE)',
  'Hands-on fabric cutting with grain alignment, dart pinching, neckline piping, and side seam finishing.',
  '2026-04-19',
  2,
  'youtube',
  'dQw4w9WgXcQ',
  true
)
on conflict (id) do nothing;

-- 5. STUDENT FEEDBACK & TESTIMONIALS
-- NOTE: In production, the public site displays ONLY real student feedback approved by the admin.
-- For local dev/demo testing with mock feedback, see: supabase/seed_sample.sql

-- 6. FAQS (Source of truth FAQs for the 2-Day Saree Blouse Master Class)
insert into public.faqs (id, question, answer, is_published, sort_order)
values
(
  'f1111111-1111-1111-1111-111111111111',
  'Do I need any sewing experience?',
  'No, this class is specially designed for complete beginners. No previous tailoring or sewing machine experience is required.',
  true,
  1
),
(
  'f2222222-2222-2222-2222-222222222222',
  'What will I make?',
  'You will make a complete 3-dart saree blouse with custom neckline and sleeves that you finish stitching yourself in 2 days.',
  true,
  2
),
(
  'f3333333-3333-3333-3333-333333333333',
  'Where is the class?',
  'In-person classes are held at Middlefield Rd & McNicoll Ave, Scarborough, ON. A live online option is also available with class recordings accessible in the student portal.',
  true,
  3
),
(
  'f4444444-4444-4444-4444-444444444444',
  'What are the class times?',
  '11:00 AM – 4:00 PM on both days (usually two Sundays a week apart). Check our upcoming master class section for the exact dates.',
  true,
  4
),
(
  'f5555555-5555-5555-5555-555555555555',
  'How do I register?',
  'Send a WhatsApp message directly to +1 647-501-9569 with your name and preferred format (in-person or online) to reserve your seat.',
  true,
  5
),
(
  'f6666666-6666-6666-6666-666666666666',
  'Do I need my own sewing machine?',
  'TODO: confirm with client (for in-person, sewing machines are provided in studio; for online, home machine required).',
  false, -- Keep unpublished until client confirms
  6
),
(
  'f7777777-7777-7777-7777-777777777777',
  'What should I bring?',
  'TODO: confirm with client (basic fabric, thread, measuring tape).',
  false, -- Keep unpublished until client confirms
  7
)
on conflict (id) do nothing;
