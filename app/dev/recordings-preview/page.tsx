"use client";

import { useState } from "react";
import RecordingsManager from "@/components/admin/RecordingsManager";
import MyRecordingsClient from "@/components/dashboard/MyRecordingsClient";
import WatchRecordingClient from "@/components/dashboard/WatchRecordingClient";
import type {
  Course,
  ClassSession,
  Profile,
  Enrollment,
  RecordingAccess,
  Recording,
  MyRecording,
  PlayerRecording,
} from "@/types/database";

const sampleCourses: Course[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    title: "2-Day Saree Blouse Master Class",
    slug: "saree-blouse-master-class",
    short_description: "From body measurements and pattern drafting to armhole accuracy and finished blouse.",
    description: "Comprehensive 2-day hands-on atelier workshop in Scarborough, Toronto.",
    duration: "2 Days (10 Hours Total)",
    fee_cad: 350,
    cover_image_url: "/courses/saree-blouse-cover.webp",
    is_published: true,
    sort_order: 1,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
  },
];

const sampleSessions: ClassSession[] = [
  {
    id: "b1111111-1111-1111-1111-111111111111",
    course_id: "a1111111-1111-1111-1111-111111111111",
    batch_code: "SBM-2026-05",
    title: "May Weekend Intensive Cohort",
    start_date: "2026-05-10",
    second_date: "2026-05-17",
    class_dates: ["2026-05-10", "2026-05-17"],
    start_time: "11:00:00",
    end_time: "16:00:00",
    location: "Middlefield Rd & McNicoll Ave, Scarborough, ON",
    mode: "both",
    price_cad: 350,
    discount_percent: 0,
    discount_label: null,
    seats_total: 12,
    seats_left: 3,
    online_join_url: "https://zoom.us/j/sample",
    feedback_open: true,
    feedback_token: "fb-sample-token",
    status: "ongoing",
    is_published: true,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
  },
];

const sampleStudents: Profile[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    full_name: "Priya Shanmugam",
    phone: "+1 647-555-0101",
    role: "student",
    is_active: true,
    created_at: "2026-05-02T00:00:00Z",
    updated_at: "2026-05-02T00:00:00Z",
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    full_name: "Ananya Raman",
    phone: "+1 416-555-0199",
    role: "student",
    is_active: true,
    created_at: "2026-05-03T00:00:00Z",
    updated_at: "2026-05-03T00:00:00Z",
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    full_name: "Shalini Vickneswaran",
    phone: "+1 905-555-0144",
    role: "student",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
    updated_at: "2026-05-04T00:00:00Z",
  },
];

const sampleEnrollments: Enrollment[] = [
  {
    id: "en-1",
    student_id: "c1111111-1111-1111-1111-111111111111",
    course_id: "a1111111-1111-1111-1111-111111111111",
    session_id: "b1111111-1111-1111-1111-111111111111",
    attendance_mode: "in_person",
    payment_status: "paid",
    amount_paid_cad: 350,
    payment_note: null,
    expires_at: null,
    status: "active",
    created_at: "2026-05-02T00:00:00Z",
    updated_at: "2026-05-02T00:00:00Z",
  },
  {
    id: "en-2",
    student_id: "c2222222-2222-2222-2222-222222222222",
    course_id: "a1111111-1111-1111-1111-111111111111",
    session_id: "b1111111-1111-1111-1111-111111111111",
    attendance_mode: "online",
    payment_status: "paid",
    amount_paid_cad: 350,
    payment_note: null,
    expires_at: null,
    status: "active",
    created_at: "2026-05-03T00:00:00Z",
    updated_at: "2026-05-03T00:00:00Z",
  },
];

const sampleRecordings: (Recording & {
  courses?: { id: string; title: string } | null;
  class_sessions?: { id: string; batch_code: string; title: string } | null;
})[] = [
  {
    id: "e1111111-1111-1111-1111-111111111111",
    title: "Lesson 1: Precision Body Measurement & Paper Pattern Drafting Formula",
    description: "Detailed walkthrough of taking 14 upper-body measurements, bust cup calculation, and apex point positioning.",
    course_id: "a1111111-1111-1111-1111-111111111111",
    session_id: "b1111111-1111-1111-1111-111111111111",
    class_date: "2026-05-10",
    source_type: "youtube",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embed_src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    video_id: "dQw4w9WgXcQ",
    thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration_minutes: 65,
    is_published: true,
    sort_order: 1,
    created_by: null,
    created_at: "2026-05-10T18:00:00Z",
    updated_at: "2026-05-10T18:00:00Z",
    courses: { id: "a1111111-1111-1111-1111-111111111111", title: "2-Day Saree Blouse Master Class" },
    class_sessions: { id: "b1111111-1111-1111-1111-111111111111", batch_code: "SBM-2026-05", title: "May Weekend Intensive Cohort" },
  },
  {
    id: "e2222222-2222-2222-2222-222222222222",
    title: "Lesson 2: Armhole Curve Fitting & 3-Dart Bodice Stitching Technique",
    description: "Hands-on tutorial on preventing armhole creasing, shoulder slope adjustments, and pressing darts.",
    course_id: "a1111111-1111-1111-1111-111111111111",
    session_id: "b1111111-1111-1111-1111-111111111111",
    class_date: "2026-05-17",
    source_type: "vimeo",
    source_url: "https://vimeo.com/76979871",
    embed_src: "https://player.vimeo.com/video/76979871",
    video_id: "76979871",
    thumbnail_url: null,
    duration_minutes: 55,
    is_published: true,
    sort_order: 2,
    created_by: null,
    created_at: "2026-05-17T18:00:00Z",
    updated_at: "2026-05-17T18:00:00Z",
    courses: { id: "a1111111-1111-1111-1111-111111111111", title: "2-Day Saree Blouse Master Class" },
    class_sessions: { id: "b1111111-1111-1111-1111-111111111111", batch_code: "SBM-2026-05", title: "May Weekend Intensive Cohort" },
  },
];

const sampleAccessList: RecordingAccess[] = [
  {
    recording_id: "e1111111-1111-1111-1111-111111111111",
    student_id: "c1111111-1111-1111-1111-111111111111",
    granted_by: null,
    granted_at: "2026-05-10T18:00:00Z",
    expires_at: null,
  },
  {
    recording_id: "e1111111-1111-1111-1111-111111111111",
    student_id: "c2222222-2222-2222-2222-222222222222",
    granted_by: null,
    granted_at: "2026-05-10T18:00:00Z",
    expires_at: null,
  },
  {
    recording_id: "e2222222-2222-2222-2222-222222222222",
    student_id: "c1111111-1111-1111-1111-111111111111",
    granted_by: null,
    granted_at: "2026-05-17T18:00:00Z",
    expires_at: null,
  },
];

const studentMyRecordings: MyRecording[] = [
  {
    id: "e1111111-1111-1111-1111-111111111111",
    title: "Lesson 1: Precision Body Measurement & Paper Pattern Drafting Formula",
    description: "Detailed walkthrough of taking 14 upper-body measurements, bust cup calculation, and apex point positioning.",
    course_id: "a1111111-1111-1111-1111-111111111111",
    course_title: "2-Day Saree Blouse Master Class",
    course_slug: "saree-blouse-master-class",
    session_id: "b1111111-1111-1111-1111-111111111111",
    batch_code: "SBM-2026-05",
    batch_title: "May Weekend Intensive Cohort",
    class_date: "2026-05-10",
    source_type: "youtube",
    embed_src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    video_id: "dQw4w9WgXcQ",
    thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration_minutes: 65,
    sort_order: 1,
    granted_at: "2026-05-10T18:00:00Z",
    expires_at: null,
    last_position_seconds: 1240,
    completed: true,
  },
  {
    id: "e2222222-2222-2222-2222-222222222222",
    title: "Lesson 2: Armhole Curve Fitting & 3-Dart Bodice Stitching Technique",
    description: "Hands-on tutorial on preventing armhole creasing, shoulder slope adjustments, and pressing darts.",
    course_id: "a1111111-1111-1111-1111-111111111111",
    course_title: "2-Day Saree Blouse Master Class",
    course_slug: "saree-blouse-master-class",
    session_id: "b1111111-1111-1111-1111-111111111111",
    batch_code: "SBM-2026-05",
    batch_title: "May Weekend Intensive Cohort",
    class_date: "2026-05-17",
    source_type: "vimeo",
    embed_src: "https://player.vimeo.com/video/76979871",
    video_id: "76979871",
    thumbnail_url: null,
    duration_minutes: 55,
    sort_order: 2,
    granted_at: "2026-05-17T18:00:00Z",
    expires_at: null,
    last_position_seconds: 450,
    completed: false,
  },
];

const samplePlayerRecording: PlayerRecording = {
  id: "e1111111-1111-1111-1111-111111111111",
  title: "Lesson 1: Precision Body Measurement & Paper Pattern Drafting Formula",
  description: "Detailed walkthrough of taking 14 upper-body measurements, bust cup calculation, and apex point positioning.\n\nKey takeaways:\n• Check high-bust vs full-bust difference for dart depth\n• Standard 0.5-inch seam allowance along armhole curve\n• Iron darts toward center front for a spotless atelier finish.",
  course_id: "a1111111-1111-1111-1111-111111111111",
  course_title: "2-Day Saree Blouse Master Class",
  session_id: "b1111111-1111-1111-1111-111111111111",
  batch_code: "SBM-2026-05",
  batch_title: "May Weekend Intensive Cohort",
  class_date: "2026-05-10",
  source_type: "youtube",
  embed_src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
  video_id: "dQw4w9WgXcQ",
  thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  duration_minutes: 65,
  last_position_seconds: 320,
  completed: true,
};

export default function RecordingsPreviewDevPage() {
  const [activeTab, setActiveTab] = useState<"admin-list" | "student-list" | "watch-page">(
    "admin-list"
  );

  return (
    <div className="min-h-screen bg-[#F7F3EC] p-4 sm:p-8 space-y-6">
      {/* Dev Switcher */}
      <div className="bg-charcoal-darkest text-off-white p-3 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-mono text-gold-light tracking-wider font-semibold">
          QA / RECORDINGS PREVIEW DECK
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("admin-list")}
            data-testid="tab-admin-list"
            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
              activeTab === "admin-list" ? "bg-gold text-charcoal-darkest" : "hover:bg-charcoal text-off-white/80"
            }`}
          >
            1. Admin Recordings &amp; Form
          </button>
          <button
            onClick={() => setActiveTab("student-list")}
            data-testid="tab-student-list"
            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
              activeTab === "student-list" ? "bg-gold text-charcoal-darkest" : "hover:bg-charcoal text-off-white/80"
            }`}
          >
            2. Student Recordings Page
          </button>
          <button
            onClick={() => setActiveTab("watch-page")}
            data-testid="tab-watch-page"
            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
              activeTab === "watch-page" ? "bg-gold text-charcoal-darkest" : "hover:bg-charcoal text-off-white/80"
            }`}
          >
            3. Student Watch Page
          </button>
        </div>
      </div>

      {/* Render selected view */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "admin-list" && (
          <div data-testid="admin-view">
            <RecordingsManager
              initialRecordings={sampleRecordings}
              courses={sampleCourses}
              sessions={sampleSessions}
              students={sampleStudents}
              enrollments={sampleEnrollments}
              initialAccessList={sampleAccessList}
            />
          </div>
        )}

        {activeTab === "student-list" && (
          <div data-testid="student-view" className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
                Atelier Masterclasses
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
                My Class Recordings
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
                Watch high-definition video walkthroughs and lectures assigned to your batch. Revisit intricate cutting, sewing, and fitting steps at your own pace.
              </p>
            </div>
            <MyRecordingsClient initialRecordings={studentMyRecordings} />
          </div>
        )}

        {activeTab === "watch-page" && (
          <div data-testid="watch-view">
            <WatchRecordingClient
              recording={samplePlayerRecording}
              siblingRecordings={studentMyRecordings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
