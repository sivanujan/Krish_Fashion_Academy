-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — SCHEMA UPDATE MIGRATION
-- Migration: 20261105010000_update_schema.sql
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. RENAME fee_lkr -> fee_cad IN COURSES TABLE (Idempotent)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'fee_lkr'
  ) then
    alter table public.courses rename column fee_lkr to fee_cad;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'fee_cad'
  ) then
    alter table public.courses add column fee_cad numeric(12, 2) not null default 0;
  end if;
end $$;

-- 2. CLASS SESSIONS (BATCHES / EVENTS) TABLE
create table if not exists public.class_sessions (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  batch_code text unique not null,
  title text not null,
  start_date date not null,
  second_date date null,
  class_dates date[] default array[]::date[],
  start_time time not null default '11:00:00',
  end_time time not null default '16:00:00',
  location text not null default 'Middlefield Rd & McNicoll Ave, Scarborough, ON',
  mode text not null check (mode in ('in_person', 'online', 'both')) default 'both',
  price_cad numeric(12, 2) null,
  discount_percent integer null,
  discount_label text null,
  seats_total integer not null default 12,
  seats_left integer not null default 12,
  online_join_url text null,
  feedback_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  feedback_open boolean not null default false,
  status text not null check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')) default 'upcoming',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for updated_at on class_sessions
drop trigger if exists tr_class_sessions_updated_at on public.class_sessions;
create trigger tr_class_sessions_updated_at
  before update on public.class_sessions
  for each row execute procedure public.handle_updated_at();

-- 3. ENROLLMENTS UPDATES (Link to Batches / Class Sessions)
do $$
begin
  -- session_id
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'session_id'
  ) then
    alter table public.enrollments add column session_id uuid references public.class_sessions(id) on delete cascade;
  end if;

  -- attendance_mode
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'attendance_mode'
  ) then
    alter table public.enrollments add column attendance_mode text check (attendance_mode in ('in_person', 'online')) default 'in_person';
  end if;

  -- payment_status
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'payment_status'
  ) then
    alter table public.enrollments add column payment_status text check (payment_status in ('unpaid', 'paid', 'waived', 'refunded')) default 'unpaid';
  end if;

  -- amount_paid_cad
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'amount_paid_cad'
  ) then
    alter table public.enrollments add column amount_paid_cad numeric(12, 2) null;
  end if;

  -- payment_note
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enrollments' and column_name = 'payment_note'
  ) then
    alter table public.enrollments add column payment_note text null;
  end if;
end $$;

-- Drop old unique(student_id, course_id) if restricting per-session enrollments
alter table public.enrollments drop constraint if exists enrollments_student_id_course_id_key;

-- Add unique constraint on (student_id, session_id) where session_id is not null
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'enrollments_student_session_unique'
  ) then
    alter table public.enrollments add constraint enrollments_student_session_unique unique (student_id, session_id);
  end if;
end $$;

-- 4. LESSONS UPDATES (Batch-Specific Recordings)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'session_id'
  ) then
    alter table public.lessons add column session_id uuid references public.class_sessions(id) on delete cascade null;
  end if;
end $$;

-- 5. FEEDBACK TABLE
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.class_sessions(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete set null null,
  name text not null,
  phone text null,
  rating_overall integer not null check (rating_overall >= 1 and rating_overall <= 5),
  rating_teaching integer not null check (rating_teaching >= 1 and rating_teaching <= 5),
  rating_content integer not null check (rating_content >= 1 and rating_content <= 5),
  liked text not null,
  improve text null,
  would_recommend boolean not null default true,
  consent_to_publish boolean not null default false,
  status text not null check (status in ('pending', 'approved', 'hidden')) default 'pending',
  admin_reply text null,
  created_at timestamptz not null default now()
);

-- 6. ENQUIRIES UPDATES
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enquiries' and column_name = 'status'
  ) then
    alter table public.enquiries add column status text check (status in ('new', 'contacted', 'registered', 'closed')) default 'new';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enquiries' and column_name = 'admin_note'
  ) then
    alter table public.enquiries add column admin_note text null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enquiries' and column_name = 'preferred_mode'
  ) then
    alter table public.enquiries add column preferred_mode text check (preferred_mode in ('in_person', 'online')) null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'enquiries' and column_name = 'interested_session_id'
  ) then
    alter table public.enquiries add column interested_session_id uuid references public.class_sessions(id) on delete set null null;
  end if;
end $$;

-- 7. FAQS TABLE (Managed via admin, rendered only when answered)
create table if not exists public.faqs (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 8. VIEWS

-- Public sessions view: exposes batch details to public without sensitive online_join_url or feedback_token
create or replace view public.public_sessions as
select
  cs.id,
  cs.course_id,
  cs.batch_code,
  cs.title,
  cs.start_date,
  cs.second_date,
  cs.class_dates,
  cs.start_time,
  cs.end_time,
  cs.location,
  cs.mode,
  cs.price_cad,
  cs.discount_percent,
  cs.discount_label,
  cs.seats_total,
  cs.seats_left,
  cs.status,
  cs.is_published,
  cs.created_at,
  cs.updated_at,
  c.title as course_title,
  c.slug as course_slug
from public.class_sessions cs
left join public.courses c on c.id = cs.course_id
where cs.is_published = true;

-- Public testimonials view: approved feedback with consent_to_publish
create or replace view public.public_testimonials as
select
  f.id,
  case
    when position(' ' in trim(f.name)) > 0 then
      split_part(trim(f.name), ' ', 1) || ' ' || left(split_part(trim(f.name), ' ', 2), 1) || '.'
    else trim(f.name)
  end as student_name,
  f.rating_overall,
  f.liked as message,
  coalesce(cs.title, c.title, 'Saree Blouse Master Class') as batch_title,
  f.created_at
from public.feedback f
left join public.class_sessions cs on cs.id = f.session_id
left join public.courses c on c.id = cs.course_id
where f.status = 'approved' and f.consent_to_publish = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.class_sessions enable row level security;
alter table public.feedback enable row level security;
alter table public.faqs enable row level security;

-- CLASS SESSIONS RLS
drop policy if exists "Public can view published class sessions" on public.class_sessions;
create policy "Public can view published class sessions" on public.class_sessions
  for select using (is_published = true);

drop policy if exists "Admins full access to class sessions" on public.class_sessions;
create policy "Admins full access to class sessions" on public.class_sessions
  for all using (public.is_admin());

-- LESSONS RLS (Participant batch-specific security)
drop policy if exists "Enrolled students can view published lessons" on public.lessons;
create policy "Enrolled students can view published lessons" on public.lessons
  for select using (
    is_published = true
    and (
      -- If lesson is tied to a specific session: student must be actively enrolled in THAT session
      (session_id is not null and exists (
        select 1 from public.enrollments e
        where e.student_id = auth.uid()
          and e.session_id = public.lessons.session_id
          and e.status = 'active'
          and (e.expires_at is null or e.expires_at > now())
      ))
      OR
      -- If general lesson: student is enrolled in the course
      (session_id is null and exists (
        select 1 from public.enrollments e
        where e.student_id = auth.uid()
          and e.course_id = public.lessons.course_id
          and e.status = 'active'
          and (e.expires_at is null or e.expires_at > now())
      ))
    )
  );

-- FEEDBACK RLS
drop policy if exists "Admins full access to feedback" on public.feedback;
create policy "Admins full access to feedback" on public.feedback
  for all using (public.is_admin());

drop policy if exists "Enrolled students can view own feedback" on public.feedback;
create policy "Enrolled students can view own feedback" on public.feedback
  for select using (auth.uid() = student_id);

drop policy if exists "Enrolled students can insert own feedback" on public.feedback;
create policy "Enrolled students can insert own feedback" on public.feedback
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.session_id = public.feedback.session_id
    )
  );

-- FAQS RLS
drop policy if exists "Public can view published faqs" on public.faqs;
create policy "Public can view published faqs" on public.faqs
  for select using (is_published = true);

drop policy if exists "Admins full access to faqs" on public.faqs;
create policy "Admins full access to faqs" on public.faqs
  for all using (public.is_admin());

-- PERMISSIONS FOR VIEWS
grant select on public.public_sessions to anon, authenticated;
grant select on public.public_testimonials to anon, authenticated;
