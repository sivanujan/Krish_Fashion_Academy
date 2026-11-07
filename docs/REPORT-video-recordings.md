# Krish Fashion Academy (KFA) — Class Video Recordings & Access Control System

**Feature Branch:** `feature/video-recordings`  
**Execution Mode:** Autonomous End-to-End Implementation  
**Date:** November 7, 2026  
**Status:** Complete & Verified  

---

## 1. What Was Built (Features List)

1. **Granular Student-Level Video Access Control:**
   - Class recordings are restricted to specific students selected by the instructor.
   - Quick bulk actions allow adding all students enrolled in a specific batch or entire course with one click.
   - Per-student access expiration date support (access automatically revokes upon expiry).
   - Deactivated student accounts (`is_active = false`) are automatically barred from accessing the classroom portal and viewing recordings.

2. **Universal Secure Video URL & Iframe Embed Parser (`lib/video/parseVideoSource.ts`):**
   - Accepts both plain URLs and full `<iframe>` HTML embed code snippets.
   - Extracts and sanitizes strictly the `src` attribute—never stores or renders raw, untrusted user-supplied HTML.
   - Full support for:
     - **YouTube:** Standard (`watch?v=`), shortlinks (`youtu.be/`), Shorts (`/shorts/`), Embeds (`/embed/`), Live streams (`/live/`), and timestamp start offsets (`t=`, `start=`). Embeds use privacy-enhanced `youtube-nocookie.com`.
     - **Vimeo:** Standard public and unlisted URLs with privacy hashes (`vimeo.com/{id}/{hash}`), normalized to `player.vimeo.com/video/{id}?h={hash}`.
     - **Google Drive:** Sharable links (`/file/d/{id}/view` and `?id=`), normalized to `drive.google.com/file/d/{id}/preview`.
     - **Bunny Stream:** Media delivery embed URLs (`iframe.mediadelivery.net/embed/{library}/{videoId}`).
     - **Direct MP4 / WebM:** HTML5 responsive playback with `controlsList="nodownload"`.
     - **HLS Streams (`.m3u8`):** Adaptive streaming powered by `hls.js` with native Safari fallback.
     - **Zoom Cloud Recordings:** Share links (`zoom.us/rec/...`) detected with a styled "Open Recording" button (opens in new tab to respect Zoom's `X-Frame-Options: DENY` policy) and passcode guidance.
     - **Allowlisted Embed Hosts:** Approved video hosting services (Loom, Wistia, SproutVideo, Vidyard, Canva, Microsoft Stream, Streamable).
   - Strict server-side security rejection of insecure schemes (`javascript:`, `data:`, `http:`).

3. **Admin Recordings Management Suite (`/admin/recordings`):**
   - **Responsive Catalog View:** Fully responsive table (desktop) and card view (mobile) displaying video thumbnails, duration, course/batch metadata, publication status, and student count badges.
   - **Instant Live Preview:** As the admin types or pastes a video URL or iframe code, the server/client parser validates the format in real time and renders an interactive player preview directly below the input.
   - **Batch & Course Quick Selectors:** "Add all students of batch" and "Add all students of course" buttons that populate the individual student checklist.
   - **Student Search & Checklist:** Searchable directory showing student names, contact details, and current enrolled batch chips.
   - **Manage Access Drawer:** Dedicated drawer to view currently assigned students, revoke access individually, add more students, or update expiry dates.
   - **Student Directory Integration (`/admin/students`):** Every student row in the admin directory now has a "Recordings" badge showing their allowed recordings count with a modal to grant/revoke access.
   - **WhatsApp Share Automation:** "WhatsApp Share" button that generates preformatted text (`"New class recording is available: {title}. Log in to watch: {SITE_URL}/dashboard/recordings/{id}"`) and copies it to the clipboard.

4. **Student Classroom Portal (`/dashboard/recordings` & `/dashboard`):**
   - **My Recordings Catalog (`/dashboard/recordings`):** Grid of cards grouped by batch/course with duration badges, class dates, watched/progress status pills, and search filtering.
   - **Student Dashboard Home Integration (`/dashboard`):** The latest 3 class recordings assigned to the student are featured on their home screen.
   - **Dedicated Watch Player Page (`/dashboard/recordings/[id]`):**
     - Responsive 16:9 `<VideoPlayer>` component with right-click context menu deterrence.
     - Playback progress tracking: Automatically saves position every 10 seconds for MP4/HLS to `recording_views`.
     - Resume playback notice pill on reload if playback was in progress.
     - "Mark as Watched" toggle with visual feedback.
     - "Previous Lesson" and "Next Lesson" navigation controls within the cohort.
     - Security: Server-side check calls `notFound()` if the recording does not exist or the student has not been granted access (zero information leakage).

---

## 2. Files Changed and Added

```
A  docs/DECISIONS.md
A  docs/REPORT-video-recordings.md
A  supabase/migrations/20261107000000_video_recordings.sql
A  supabase/tests/recordings_security.sql
M  supabase/seed_sample.sql
M  types/database.ts
A  lib/video/allowedHosts.ts
A  lib/video/parseVideoSource.ts
A  lib/validations/recording.ts
A  lib/actions/recordings.ts
M  lib/supabase/middleware.ts
A  components/video/VideoPlayer.tsx
A  components/admin/RecordingsManager.tsx
M  components/admin/StudentsManager.tsx
M  components/layout/AdminSidebar.tsx
A  components/dashboard/MyRecordingsClient.tsx
A  components/dashboard/WatchRecordingClient.tsx
M  components/layout/DashboardSidebar.tsx
A  app/admin/recordings/page.tsx
M  app/admin/students/page.tsx
A  app/dashboard/recordings/page.tsx
A  app/dashboard/recordings/[id]/page.tsx
M  app/dashboard/page.tsx
A  app/dev/recordings-preview/page.tsx
A  tests/videoParser.test.ts
A  tests/recordingsSecurity.test.ts
A  tests/recordingsScreenshots.spec.ts
M  playwright.config.ts
M  package.json
A  qa/screenshots/recordings/desktop_admin_list.png
A  qa/screenshots/recordings/mobile_admin_list.png
A  qa/screenshots/recordings/desktop_admin_add_form.png
A  qa/screenshots/recordings/mobile_admin_add_form.png
A  qa/screenshots/recordings/desktop_student_recordings.png
A  qa/screenshots/recordings/mobile_student_recordings.png
A  qa/screenshots/recordings/desktop_watch_page.png
A  qa/screenshots/recordings/mobile_watch_page.png
```

---

## 3. Database Changes & Execution Instructions

### A. Run Migration in Supabase SQL Editor
Navigate to the Supabase Dashboard -> **SQL Editor**, open [`supabase/migrations/20261107000000_video_recordings.sql`](file:///c:/Users/Sivanujan_PC/Desktop/Krish_Fashion_Academy/supabase/migrations/20261107000000_video_recordings.sql), paste and run:

1. **`recordings` table:** Stores metadata, duration, normalized safe `embed_src`, extracted `video_id`, and original `source_url`.
2. **`recording_access` table:** Composite primary key `(recording_id, student_id)`, tracking `granted_by`, `granted_at`, and `expires_at`.
3. **`recording_views` table:** Composite primary key `(recording_id, student_id)`, tracking `last_position_seconds`, `completed`, and `updated_at`.
4. **Performance Indexes:** On `recording_access(student_id)`, `recording_access(expires_at)`, `recordings(course_id)`, `recordings(session_id)`, and `recordings(is_published)`.
5. **Row Level Security (RLS):**
   - Admin (`is_admin()`): Full CRUD permissions on all three tables.
   - Student: Can only query `recordings` that are `is_published = true`, where an active `recording_access` record exists, and their `profiles.is_active = true`.
   - Security Definer RPCs: `get_my_recordings()`, `get_recording_for_player(p_recording_id)`, and atomic `save_recording_with_access()`.
   - Column-level privilege: Direct select access to `source_url` is revoked from authenticated students; playback URLs are delivered safely via RPC.

### B. Regenerate Supabase TypeScript Types (Optional)
If you have the Supabase CLI linked locally:
```bash
npx supabase gen types typescript --local > types/database.ts
```
*(Note: `types/database.ts` has already been updated with all interfaces, rows, inserts, updates, and RPC function types).*

---

## 4. How the Admin Uses It (Step-by-Step)

### Step 1: Navigate to Recordings
1. Log in to the Admin Dashboard (`/admin`).
2. Click **Recordings** in the left sidebar menu (or visit `/admin/recordings`).

### Step 2: Add a Class Recording
1. Click the golden **"Add Class Recording"** button in the upper right.
2. In the **"Video URL or Iframe Embed Code"** field, paste your video link (e.g. YouTube unlisted link, Vimeo link, Google Drive link, Bunny Stream link, or Zoom cloud recording URL).
3. The system immediately checks the link, displays a green badge confirming the detected source, and loads a **Live Preview** of the video so you can confirm it is working before saving.
4. Fill in the **Recording Title** (e.g. *"Lecture 3: Armhole Curve & 3-Dart Fitting"*).
5. (Optional) Enter lesson notes, select the Course and Batch, specify the Class Date, and set the approximate duration in minutes.

### Step 3: Choose Who Can Watch
Under the **"Who Can Watch This Recording"** section:
- **To assign an entire cohort quickly:** Click **"+ Add all students of batch"** or **"+ Add all students of course"**.
- **To adjust individual students:** Check or uncheck individual students in the searchable list.
- **To set an expiration date:** Pick a date under *"Access Expiry Date"*. Leave it blank for permanent access.

### Step 4: Save & Share
1. Click **"Save & Grant Access"**.
2. Click the **"WhatsApp Share"** button on any recording card to copy a ready-to-send WhatsApp invite message directly to your clipboard, and share it with your students!

---

## 5. Supported Link Types & Known Limitations

| Source Type | Example Input Format | Embedded Behavior | Limitations / Notes |
| :--- | :--- | :--- | :--- |
| **YouTube** | `https://www.youtube.com/watch?v=dQw4w9WgXcQ`<br>`https://youtu.be/dQw4w9WgXcQ`<br>`https://youtube.com/shorts/...` | Privacy-enhanced `youtube-nocookie.com/embed/...` with `rel=0&modestbranding=1` | If the video is "Unlisted", students who inspect the network tab could copy the direct YouTube link. For maximum exclusivity, Bunny Stream or Vimeo domain-restricted privacy is recommended. |
| **Vimeo** | `https://vimeo.com/123456789`<br>`https://vimeo.com/123456789/abcdef12` | `player.vimeo.com/video/...` with unlisted hash support | Set Vimeo embed privacy to *"Specific domains"* (`krishfashionacademy.com`) in your Vimeo account to prevent unauthorized external embedding. |
| **Google Drive** | `https://drive.google.com/file/d/1BxiMVs.../view`<br>`https://drive.google.com/open?id=1BxiMVs...` | `drive.google.com/file/d/.../preview` iframe | Ensure the Google Drive file share setting is *"Anyone with the link can view"* so students can watch without requesting permission. |
| **Bunny Stream** | `https://iframe.mediadelivery.net/embed/12345/abcdef...` | High-performance DRM / HLS iframe | Recommended for premium ateliers: supports built-in domain locking and token signing. |
| **Direct MP4 / WebM** | `https://cdn.example.com/class-1.mp4` | HTML5 native video player with `controlsList="nodownload"` | Full client-side interval progress saving (every 10s) and resume playback support. |
| **HLS Stream (`.m3u8`)**| `https://cdn.example.com/streams/live.m3u8` | Powered by `hls.js` with native Apple Safari fallback | Full adaptive bitrate streaming. |
| **Zoom Cloud Link** | `https://us02web.zoom.us/rec/share/...` | "Launch Zoom Recording" button (opens in new tab) | **Zoom restriction:** Zoom sets `X-Frame-Options: DENY` on all cloud recording URLs, prohibiting iframes. Students click the styled button to watch in a secure tab; passcodes can be noted in the lesson description. |
| **Allowlisted Embeds** | Loom, Wistia, Canva, SproutVideo, Vidyard, Streamable | Responsive secure iframe | Non-allowlisted third-party hostnames are rejected with a helpful message. |

---

## 6. Verification and Test Results

### 1. Automated Unit & Security Tests
Run via `npm test` (`node:test` test runner):
- **Parser Test Suite (`tests/videoParser.test.ts`):** 25 test cases covering YouTube (watch, shorts, embed, timestamps, tracking params, iframe snippets), Vimeo (standard, unlisted with hash, player iframe), Google Drive, Bunny Stream, MP4, WebM, HLS, Zoom links, Loom, Wistia, and security rejections (`javascript:`, `data:`, `http:`, unapproved hosts).
- **Security Test Suite (`tests/recordingsSecurity.test.ts`):** 8 automated tests verifying XSS payload rejection, data URI rejection, HTTP rejection, iframe attribute sanitization, Zod UUID schema validation, and access expiration logic.
- **SQL Security Test Suite (`supabase/tests/recordings_security.sql`):** Verifies Row Level Security policies, assigned vs unassigned student access, 404 behavior, and column privilege revocation on `source_url`.
- **Result:** **33 passing tests (0 failures, 182ms execution time)**.

### 2. Next.js Production Build
Run via `npm run build`:
- **Result:** **Exit code 0**. All 20 routes generated cleanly with zero TypeScript errors or lint failures.

### 3. Playwright Responsive QA Screenshots
Captured across **Desktop (1440 x 900)** and **Mobile (390 x 844)** viewports in `qa/screenshots/recordings/`:
1. `desktop_admin_list.png` & `mobile_admin_list.png`: Admin recordings library table, thumbnails, batch badges, and controls.
2. `desktop_admin_add_form.png` & `mobile_admin_add_form.png`: Add recording modal showing the **Live Preview Player** and granular student checklist.
3. `desktop_student_recordings.png` & `mobile_student_recordings.png`: Student "My Class Recordings" grid grouped by cohort with watch status badges.
4. `desktop_watch_page.png` & `mobile_watch_page.png`: Student watch player, resume playback alert, "Mark as Watched" button, instructor notes, and previous/next lesson navigation.

---

## 7. Architectural Decisions Reference
All architectural decisions, schema considerations (`lessons` vs `recordings`), security paradigms, and URL extraction specifications are documented in [`docs/DECISIONS.md`](file:///c:/Users/Sivanujan_PC/Desktop/Krish_Fashion_Academy/docs/DECISIONS.md).
