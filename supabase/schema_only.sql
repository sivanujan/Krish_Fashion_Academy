-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — PURE SCHEMA (TABLES & POLICIES ONLY)
-- Copy and run this in Supabase SQL Editor
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
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
  fee_lkr numeric(12, 2) not null default 0,
  cover_image_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. LESSONS TABLE
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
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

-- 4. ENROLLMENTS TABLE
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text not null check (status in ('active', 'expired')) default 'active',
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- 5. GALLERY ITEMS TABLE
create table if not exists public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  image_url text,
  caption text,
  category text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. SERVICES TABLE
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. TESTIMONIALS TABLE
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  message text not null,
  rating integer not null check (rating >= 1 and rating <= 5) default 5,
  photo_url text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 8. ENQUIRIES TABLE
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  course_interest text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. SITE SETTINGS TABLE
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  phone text not null default '+94 77 123 4567',
  whatsapp_number text not null default '+94771234567',
  email text not null default 'info@krishfashionacademy.com',
  address text not null default '123 Galle Road, Colombo 03, Sri Lanka',
  map_embed_url text default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.81536310862!2d79.82118590623694!3d6.921837367800164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk',
  facebook_url text default 'https://facebook.com',
  instagram_url text default 'https://instagram.com',
  tiktok_url text default 'https://tiktok.com',
  youtube_url text default 'https://youtube.com',
  counter_students integer not null default 1250,
  counter_years integer not null default 12,
  counter_courses integer not null default 15,
  updated_at timestamptz not null default now()
);

-- Default settings row
insert into public.site_settings (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

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

drop trigger if exists tr_lessons_updated_at on public.lessons;
create trigger tr_lessons_updated_at before update on public.lessons for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_enrollments_updated_at on public.enrollments;
create trigger tr_enrollments_updated_at before update on public.enrollments for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_settings_updated_at on public.site_settings;
create trigger tr_site_settings_updated_at before update on public.site_settings for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.gallery_items enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

-- PROFILES
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile except role" on public.profiles;
create policy "Users can update own profile except role" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins full access to profiles" on public.profiles;
create policy "Admins full access to profiles" on public.profiles for all using (public.is_admin());

-- COURSES
drop policy if exists "Public can view published courses" on public.courses;
create policy "Public can view published courses" on public.courses for select using (is_published = true);

drop policy if exists "Admins full access to courses" on public.courses;
create policy "Admins full access to courses" on public.courses for all using (public.is_admin());

-- LESSONS
drop policy if exists "Enrolled students can view published lessons" on public.lessons;
create policy "Enrolled students can view published lessons" on public.lessons for select using (
  is_published = true
  and exists (
    select 1 from public.enrollments e
    where e.student_id = auth.uid()
      and e.course_id = public.lessons.course_id
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  )
);

drop policy if exists "Admins full access to lessons" on public.lessons;
create policy "Admins full access to lessons" on public.lessons for all using (public.is_admin());

-- ENROLLMENTS
drop policy if exists "Students can view own enrollments" on public.enrollments;
create policy "Students can view own enrollments" on public.enrollments for select using (auth.uid() = student_id);

drop policy if exists "Admins full access to enrollments" on public.enrollments;
create policy "Admins full access to enrollments" on public.enrollments for all using (public.is_admin());

-- GALLERY ITEMS
drop policy if exists "Public can view gallery items" on public.gallery_items;
create policy "Public can view gallery items" on public.gallery_items for select using (true);

drop policy if exists "Admins full access to gallery items" on public.gallery_items;
create policy "Admins full access to gallery items" on public.gallery_items for all using (public.is_admin());

-- SERVICES
drop policy if exists "Public can view services" on public.services;
create policy "Public can view services" on public.services for select using (true);

drop policy if exists "Admins full access to services" on public.services;
create policy "Admins full access to services" on public.services for all using (public.is_admin());

-- TESTIMONIALS
drop policy if exists "Public can view published testimonials" on public.testimonials;
create policy "Public can view published testimonials" on public.testimonials for select using (is_published = true);

drop policy if exists "Admins full access to testimonials" on public.testimonials;
create policy "Admins full access to testimonials" on public.testimonials for all using (public.is_admin());

-- ENQUIRIES
drop policy if exists "Public can insert enquiries" on public.enquiries;
create policy "Public can insert enquiries" on public.enquiries for insert with check (true);

drop policy if exists "Admins full access to enquiries" on public.enquiries;
create policy "Admins full access to enquiries" on public.enquiries for all using (public.is_admin());

-- SITE SETTINGS
drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings" on public.site_settings for select using (true);

drop policy if exists "Admins full access to site settings" on public.site_settings;
create policy "Admins full access to site settings" on public.site_settings for all using (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

drop policy if exists "Public image access" on storage.objects;
create policy "Public image access" on storage.objects for select using (bucket_id = 'public-images');

drop policy if exists "Admin upload image access" on storage.objects;
create policy "Admin upload image access" on storage.objects for insert with check (bucket_id = 'public-images' and public.is_admin());

drop policy if exists "Admin update image access" on storage.objects;
create policy "Admin update image access" on storage.objects for update using (bucket_id = 'public-images' and public.is_admin());

drop policy if exists "Admin delete image access" on storage.objects;
create policy "Admin delete image access" on storage.objects for delete using (bucket_id = 'public-images' and public.is_admin());
