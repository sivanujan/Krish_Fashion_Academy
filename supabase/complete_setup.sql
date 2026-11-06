-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — COMPLETE ONE-CLICK SETUP
-- Run this entire script in Supabase SQL Editor
-- Location: Middlefield Rd & McNicoll Ave, Scarborough, ON, Canada
-- Currency: CAD ($)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE (linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null check (role in ('admin', 'student')) default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. COURSES TABLE
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  short_description text not null,
  description text not null,
  duration text not null,
  fee_cad numeric(12, 2) not null default 0,
  cover_image_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CLASS SESSIONS (BATCHES) TABLE
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

-- 4. LESSONS / RECORDINGS TABLE
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  session_id uuid references public.class_sessions(id) on delete cascade null,
  title text not null,
  description text,
  class_date date,
  sort_order integer not null default 0,
  video_provider text check (video_provider in ('youtube', 'bunny')) null,
  video_id text null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. ENROLLMENTS TABLE (Linked to Batches)
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  session_id uuid references public.class_sessions(id) on delete cascade null,
  attendance_mode text check (attendance_mode in ('in_person', 'online')) default 'in_person',
  payment_status text check (payment_status in ('unpaid', 'paid', 'waived', 'refunded')) default 'unpaid',
  amount_paid_cad numeric(12, 2) null,
  payment_note text null,
  status text not null check (status in ('active', 'expired')) default 'active',
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, session_id)
);

-- 6. FEEDBACK TABLE
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

-- 7. GALLERY ITEMS TABLE
create table if not exists public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  image_url text,
  caption text,
  category text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 8. SERVICES TABLE
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 9. ENQUIRIES TABLE
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  course_interest text,
  message text not null,
  status text check (status in ('new', 'contacted', 'registered', 'closed')) default 'new',
  admin_note text,
  preferred_mode text check (preferred_mode in ('in_person', 'online')),
  interested_session_id uuid references public.class_sessions(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. FAQS TABLE
create table if not exists public.faqs (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 11. SITE SETTINGS TABLE
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  phone text not null default '+1 647-501-9569',
  whatsapp_number text not null default '16475019569',
  email text not null default 'info@krishfashionacademy.com',
  address text not null default 'Middlefield Rd & McNicoll Ave, Scarborough, ON',
  map_embed_url text default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6b63897d833%3A0x6fdf94f1c7dcf9a!2sMiddlefield%20Rd%20%26%20McNicoll%20Ave%2C%20Toronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca',
  facebook_url text null,
  instagram_url text default 'https://instagram.com/krishfashionacademy',
  tiktok_url text null,
  youtube_url text null,
  counter_students integer not null default 0,
  counter_years integer not null default 0,
  counter_courses integer not null default 1,
  updated_at timestamptz not null default now()
);

-- Insert singleton row if not exists
insert into public.site_settings (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- 12. VIEWS
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

-- 13. HELPER FUNCTIONS & TRIGGERS
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student User'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_profiles_updated_at on public.profiles;
create trigger tr_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_courses_updated_at on public.courses;
create trigger tr_courses_updated_at before update on public.courses for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_class_sessions_updated_at on public.class_sessions;
create trigger tr_class_sessions_updated_at before update on public.class_sessions for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_lessons_updated_at on public.lessons;
create trigger tr_lessons_updated_at before update on public.lessons for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_enrollments_updated_at on public.enrollments;
create trigger tr_enrollments_updated_at before update on public.enrollments for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_settings_updated_at on public.site_settings;
create trigger tr_site_settings_updated_at before update on public.site_settings for each row execute procedure public.handle_updated_at();

-- 14. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.class_sessions enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.feedback enable row level security;
alter table public.gallery_items enable row level security;
alter table public.services enable row level security;
alter table public.enquiries enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

-- PROFILES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile except role" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "Admins full access to profiles" on public.profiles for all using (public.is_admin());

-- COURSES
create policy "Public can view published courses" on public.courses for select using (is_published = true);
create policy "Admins full access to courses" on public.courses for all using (public.is_admin());

-- CLASS SESSIONS
create policy "Public can view published class sessions" on public.class_sessions for select using (is_published = true);
create policy "Admins full access to class sessions" on public.class_sessions for all using (public.is_admin());

-- LESSONS
create policy "Enrolled students can view published lessons" on public.lessons for select using (
  is_published = true
  and (
    (session_id is not null and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.session_id = public.lessons.session_id
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    ))
    OR
    (session_id is null and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.course_id = public.lessons.course_id
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    ))
  )
);
create policy "Admins full access to lessons" on public.lessons for all using (public.is_admin());

-- ENROLLMENTS
create policy "Students can view own enrollments" on public.enrollments for select using (auth.uid() = student_id);
create policy "Admins full access to enrollments" on public.enrollments for all using (public.is_admin());

-- FEEDBACK
create policy "Admins full access to feedback" on public.feedback for all using (public.is_admin());
create policy "Enrolled students can view own feedback" on public.feedback for select using (auth.uid() = student_id);
create policy "Enrolled students can insert own feedback" on public.feedback for insert with check (
  auth.uid() = student_id
  and exists (
    select 1 from public.enrollments e
    where e.student_id = auth.uid()
      and e.session_id = public.feedback.session_id
  )
);

-- GALLERY ITEMS
create policy "Public can view gallery items" on public.gallery_items for select using (true);
create policy "Admins full access to gallery items" on public.gallery_items for all using (public.is_admin());

-- SERVICES
create policy "Public can view services" on public.services for select using (true);
create policy "Admins full access to services" on public.services for all using (public.is_admin());

-- ENQUIRIES
create policy "Public can insert enquiries" on public.enquiries for insert with check (true);
create policy "Admins full access to enquiries" on public.enquiries for all using (public.is_admin());

-- FAQS
create policy "Public can view published faqs" on public.faqs for select using (is_published = true);
create policy "Admins full access to faqs" on public.faqs for all using (public.is_admin());

-- SITE SETTINGS
create policy "Public can view site settings" on public.site_settings for select using (true);
create policy "Admins full access to site settings" on public.site_settings for all using (public.is_admin());

grant select on public.public_sessions to anon, authenticated;
grant select on public.public_testimonials to anon, authenticated;
