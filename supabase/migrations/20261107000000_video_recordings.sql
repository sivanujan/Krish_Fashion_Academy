-- ============================================================================
-- KRISH FASHION ACADEMY (KFA) — VIDEO RECORDINGS & ACCESS CONTROL MIGRATION
-- Migration: 20261107000000_video_recordings.sql
-- ============================================================================

-- 1. RECORDINGS TABLE
create table if not exists public.recordings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text null,
  course_id uuid references public.courses(id) on delete set null null,
  session_id uuid references public.class_sessions(id) on delete set null null,
  class_date date null,
  source_type text not null check (
    source_type in (
      'youtube',
      'vimeo',
      'google_drive',
      'bunny',
      'mp4',
      'hls',
      'zoom_link',
      'other_embed'
    )
  ),
  source_url text not null,        -- Original admin URL (admin only)
  embed_src text null,             -- Normalized safe embed / stream URL
  video_id text null,              -- Extracted ID for standard providers
  thumbnail_url text null,
  duration_minutes integer null check (duration_minutes is null or duration_minutes >= 0),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. RECORDING ACCESS TABLE (Granular student-level permissions)
create table if not exists public.recording_access (
  recording_id uuid references public.recordings(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  granted_by uuid references public.profiles(id) on delete set null null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz null,
  primary key (recording_id, student_id)
);

-- 3. RECORDING VIEWS TABLE (Watch history & resume playback)
create table if not exists public.recording_views (
  recording_id uuid references public.recordings(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  last_position_seconds integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (recording_id, student_id)
);

-- 4. PERFORMANCE INDEXES
create index if not exists idx_recordings_course_id on public.recordings(course_id);
create index if not exists idx_recordings_session_id on public.recordings(session_id);
create index if not exists idx_recordings_published on public.recordings(is_published);
create index if not exists idx_recordings_class_date on public.recordings(class_date);
create index if not exists idx_recording_access_student_id on public.recording_access(student_id);
create index if not exists idx_recording_access_expires_at on public.recording_access(expires_at);
create index if not exists idx_recording_views_student on public.recording_views(student_id);

-- 5. UPDATED_AT TRIGGER
drop trigger if exists tr_recordings_updated_at on public.recordings;
create trigger tr_recordings_updated_at
  before update on public.recordings
  for each row execute procedure public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.recordings enable row level security;
alter table public.recording_access enable row level security;
alter table public.recording_views enable row level security;

-- RECORDINGS POLICIES
drop policy if exists "Admins full access to recordings" on public.recordings;
create policy "Admins full access to recordings" on public.recordings
  for all using (public.is_admin());

drop policy if exists "Students can view assigned published recordings" on public.recordings;
create policy "Students can view assigned published recordings" on public.recordings
  for select using (
    is_published = true
    and exists (
      select 1
      from public.recording_access ra
      join public.profiles p on p.id = ra.student_id
      where ra.recording_id = public.recordings.id
        and ra.student_id = auth.uid()
        and (ra.expires_at is null or ra.expires_at > now())
        and p.is_active = true
    )
  );

-- RECORDING_ACCESS POLICIES
drop policy if exists "Admins full access to recording_access" on public.recording_access;
create policy "Admins full access to recording_access" on public.recording_access
  for all using (public.is_admin());

drop policy if exists "Students can view own recording_access" on public.recording_access;
create policy "Students can view own recording_access" on public.recording_access
  for select using (student_id = auth.uid());

-- RECORDING_VIEWS POLICIES
drop policy if exists "Admins full access to recording_views" on public.recording_views;
create policy "Admins full access to recording_views" on public.recording_views
  for all using (public.is_admin());

drop policy if exists "Students can manage own recording_views" on public.recording_views;
create policy "Students can manage own recording_views" on public.recording_views
  for all using (
    student_id = auth.uid()
    and exists (
      select 1
      from public.recording_access ra
      join public.recordings r on r.id = ra.recording_id
      where ra.recording_id = public.recording_views.recording_id
        and ra.student_id = auth.uid()
        and r.is_published = true
        and (ra.expires_at is null or ra.expires_at > now())
    )
  );

-- 7. COLUMN LEVEL PRIVILEGES
-- Revoke direct selection of source_url from student roles
revoke select on public.recordings from anon, authenticated;
grant select (
  id,
  title,
  description,
  course_id,
  session_id,
  class_date,
  source_type,
  embed_src,
  video_id,
  thumbnail_url,
  duration_minutes,
  is_published,
  sort_order,
  created_by,
  created_at,
  updated_at
) on public.recordings to authenticated;

-- Service role and admin functions have full access
grant all on public.recordings to service_role;
grant all on public.recording_access to service_role, authenticated;
grant all on public.recording_views to service_role, authenticated;

-- 8. SECURE RPC: get_my_recordings()
-- Fetches assigned recordings for the authenticated student without exposing source_url
create or replace function public.get_my_recordings()
returns table (
  id uuid,
  title text,
  description text,
  course_id uuid,
  course_title text,
  course_slug text,
  session_id uuid,
  batch_code text,
  batch_title text,
  class_date date,
  source_type text,
  embed_src text,
  video_id text,
  thumbnail_url text,
  duration_minutes integer,
  sort_order integer,
  granted_at timestamptz,
  expires_at timestamptz,
  last_position_seconds integer,
  completed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  curr_user_id uuid := auth.uid();
begin
  if curr_user_id is null then
    return;
  end if;

  -- Ensure student is active
  if not exists (select 1 from public.profiles where id = curr_user_id and is_active = true) then
    return;
  end if;

  return query
  select
    r.id,
    r.title,
    r.description,
    r.course_id,
    c.title as course_title,
    c.slug as course_slug,
    r.session_id,
    s.batch_code,
    s.title as batch_title,
    r.class_date,
    r.source_type,
    r.embed_src,
    r.video_id,
    r.thumbnail_url,
    r.duration_minutes,
    r.sort_order,
    ra.granted_at,
    ra.expires_at,
    coalesce(rv.last_position_seconds, 0) as last_position_seconds,
    coalesce(rv.completed, false) as completed
  from public.recordings r
  join public.recording_access ra on ra.recording_id = r.id
  left join public.courses c on c.id = r.course_id
  left join public.class_sessions s on s.id = r.session_id
  left join public.recording_views rv on rv.recording_id = r.id and rv.student_id = curr_user_id
  where ra.student_id = curr_user_id
    and r.is_published = true
    and (ra.expires_at is null or ra.expires_at > now())
  order by
    coalesce(r.class_date, r.created_at::date) desc,
    r.sort_order asc,
    r.created_at desc;
end;
$$;

-- 9. SECURE RPC: get_recording_for_player(p_recording_id uuid)
create or replace function public.get_recording_for_player(p_recording_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  course_id uuid,
  course_title text,
  session_id uuid,
  batch_code text,
  batch_title text,
  class_date date,
  source_type text,
  embed_src text,
  video_id text,
  thumbnail_url text,
  duration_minutes integer,
  last_position_seconds integer,
  completed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  curr_user_id uuid := auth.uid();
  is_admin_user boolean := false;
begin
  if curr_user_id is null then
    return;
  end if;

  select public.is_admin() into is_admin_user;

  -- If not admin, verify access and active profile
  if not is_admin_user then
    if not exists (
      select 1
      from public.recording_access ra
      join public.recordings r on r.id = ra.recording_id
      join public.profiles p on p.id = ra.student_id
      where ra.recording_id = p_recording_id
        and ra.student_id = curr_user_id
        and r.is_published = true
        and (ra.expires_at is null or ra.expires_at > now())
        and p.is_active = true
    ) then
      return;
    end if;
  end if;

  return query
  select
    r.id,
    r.title,
    r.description,
    r.course_id,
    c.title as course_title,
    r.session_id,
    s.batch_code,
    s.title as batch_title,
    r.class_date,
    r.source_type,
    r.embed_src,
    r.video_id,
    r.thumbnail_url,
    r.duration_minutes,
    coalesce(rv.last_position_seconds, 0) as last_position_seconds,
    coalesce(rv.completed, false) as completed
  from public.recordings r
  left join public.courses c on c.id = r.course_id
  left join public.class_sessions s on s.id = r.session_id
  left join public.recording_views rv on rv.recording_id = r.id and rv.student_id = curr_user_id
  where r.id = p_recording_id
  limit 1;
end;
$$;

-- 10. ATOMIC RPC: save_recording_with_access
create or replace function public.save_recording_with_access(
  p_recording jsonb,
  p_student_ids uuid[],
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recording_id uuid;
  v_student_id uuid;
  v_caller_id uuid := auth.uid();
begin
  -- Only admins can call this function
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin privileges required';
  end if;

  -- Extract or generate recording ID
  if p_recording->>'id' is not null and (p_recording->>'id') <> '' then
    v_recording_id := (p_recording->>'id')::uuid;
  else
    v_recording_id := gen_random_uuid();
  end if;

  -- Upsert recording
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
    sort_order,
    created_by
  )
  values (
    v_recording_id,
    p_recording->>'title',
    p_recording->>'description',
    nullif(p_recording->>'course_id', '')::uuid,
    nullif(p_recording->>'session_id', '')::uuid,
    nullif(p_recording->>'class_date', '')::date,
    p_recording->>'source_type',
    p_recording->>'source_url',
    p_recording->>'embed_src',
    p_recording->>'video_id',
    p_recording->>'thumbnail_url',
    nullif(p_recording->>'duration_minutes', '')::integer,
    coalesce((p_recording->>'is_published')::boolean, true),
    coalesce((p_recording->>'sort_order')::integer, 0),
    v_caller_id
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    course_id = excluded.course_id,
    session_id = excluded.session_id,
    class_date = excluded.class_date,
    source_type = excluded.source_type,
    source_url = excluded.source_url,
    embed_src = excluded.embed_src,
    video_id = excluded.video_id,
    thumbnail_url = excluded.thumbnail_url,
    duration_minutes = excluded.duration_minutes,
    is_published = excluded.is_published,
    sort_order = excluded.sort_order,
    updated_at = now();

  -- Replace access rows atomically
  -- Delete access rows not in the new student list
  delete from public.recording_access
  where recording_id = v_recording_id
    and (p_student_ids is null or student_id != all(p_student_ids));

  -- Insert/update access rows for selected students
  if p_student_ids is not null and array_length(p_student_ids, 1) > 0 then
    foreach v_student_id in array p_student_ids
    loop
      insert into public.recording_access (recording_id, student_id, granted_by, granted_at, expires_at)
      values (v_recording_id, v_student_id, v_caller_id, now(), p_expires_at)
      on conflict (recording_id, student_id) do update set
        expires_at = excluded.expires_at,
        granted_at = now();
    end loop;
  end if;

  return v_recording_id;
end;
$$;

