# Architectural & Implementation Decisions

## Feature: Video Recordings with Granular Access Control
**Date:** 2026-11-07  
**Branch:** `feature/video-recordings`

---

### Decision 1: Dedicated `recordings` vs Extending `lessons`
- **Context:** The database previously contained a basic `lessons` table designed for general course syllabus and YouTube video IDs. The new requirement introduces rich video sources (`youtube`, `vimeo`, `google_drive`, `bunny`, `mp4`, `hls`, `zoom_link`, `other_embed`), secure server-computed `embed_src`, administrative `source_url` isolation, and individual student access assignment (`recording_access`).
- **Decision:** Create dedicated, cleanly architected `recordings`, `recording_access`, and `recording_views` tables in migration `20261107000000_video_recordings.sql`.
- **Rationale:**
  1. Preserves existing migrations and schema integrity without touching existing foreign keys or course curriculum definitions.
  2. Granular student access (`recording_access`) with optional expiration dates (`expires_at`) cleanly maps to `recording_id`.
  3. Safe student access RPCs (`get_my_recordings()`, `get_recording_for_player(p_recording_id)`) can be strictly typed and secured to expose `embed_src` and `video_id` while revoking access to `source_url`.
  4. Keeps `/admin/recordings` focused on recording management and updates `AdminSidebar` navigation. For backwards compatibility, `/admin/lessons` redirects or links to `/admin/recordings`.

---

### Decision 2: Security & Hiding `source_url` from Students
- **Context:** Raw URLs (like unlisted YouTube URLs, Google Drive links, or direct MP4 files) must not be exposed to students via client queries.
- **Decision:**
  1. Revoke direct `SELECT (source_url)` on `public.recordings` from the `authenticated` role (only `service_role` and admins have column-level access).
  2. Provide two PostgreSQL functions / RPCs:
     - `get_my_recordings()`: Returns assigned recordings for `auth.uid()`, including metadata, duration, thumbnails, progress, and `embed_src`, omitting `source_url`.
     - `get_recording_for_player(p_recording_id uuid)`: Returns a single recording player payload (including `embed_src`, `source_type`, and player flags) only if `auth.uid()` has valid access. If not found or expired, returns empty / 404.
  3. Use Server Actions for all mutations with strict `ensureAdmin()` checks.

---

### Decision 3: Atomic Saving with Access Rows
- **Context:** When the admin adds or edits a recording, they specify metadata, an optional course/batch, and a list of student IDs who can watch it.
- **Decision:** Create an atomic database function `save_recording_with_access(p_recording jsonb, p_student_ids uuid[], p_expires_at timestamptz)` that upserts the recording and updates the `recording_access` table in a single transaction.

---

### Decision 4: Video Parsing Architecture
- **Context:** Need both live client-side preview in the admin UI and guaranteed server-side validation during action execution.
- **Decision:**
  - Implement `lib/video/parseVideoSource.ts` as a pure TypeScript parser without DOM dependencies so it runs identically in Node.js (Server Actions) and in the browser (Admin Live Preview).
  - Create `lib/video/allowedHosts.ts` to strictly maintain the allowlist for `other_embed` iframes.
  - Reject `javascript:`, `data:`, `vbscript:`, and insecure `http:` URLs.

---

### Decision 5: Deactivated Students Security in Middleware
- **Context:** Deactivated students (`is_active = false`) must not be able to browse the dashboard or stream assigned recordings.
- **Decision:** In `lib/supabase/middleware.ts`, verify `is_active` for `/dashboard` routes. If deactivated, sign the session out immediately and redirect to `/login?error=deactivated`.
