import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RecordingsManager from "@/components/admin/RecordingsManager";
import type { Course, ClassSession, Profile, Enrollment, RecordingAccess, Recording } from "@/types/database";

export const metadata: Metadata = {
  title: "Class Video Recordings & Student Access | Krish Fashion Academy",
};

export const dynamic = "force-dynamic";

export default async function AdminRecordingsPage() {
  const supabase = await createClient();

  const [recordingsRes, coursesRes, sessionsRes, studentsRes, enrollmentsRes, accessRes] =
    await Promise.all([
      supabase
        .from("recordings")
        .select("*, courses(id, title), class_sessions(id, batch_code, title)")
        .order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("sort_order", { ascending: true }),
      supabase.from("class_sessions").select("*").order("start_date", { ascending: false }),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name", { ascending: true }),
      supabase.from("enrollments").select("*"),
      supabase.from("recording_access").select("*"),
    ]);

  const recordings: (Recording & {
    courses?: { id: string; title: string } | null;
    class_sessions?: { id: string; batch_code: string; title: string } | null;
  })[] = (recordingsRes.data as unknown as (Recording & {
    courses?: { id: string; title: string } | null;
    class_sessions?: { id: string; batch_code: string; title: string } | null;
  })[]) || [];

  const courses: Course[] = coursesRes.data || [];
  const sessions: ClassSession[] = sessionsRes.data || [];
  const students: Profile[] = studentsRes.data || [];
  const enrollments: Enrollment[] = enrollmentsRes.data || [];
  const accessList: RecordingAccess[] = accessRes.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Video Library &amp; Granular Permissions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Class Video Recordings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Add class lecture videos from YouTube, Vimeo, Google Drive, Bunny Stream, or Zoom, and
          control specifically which students can watch them.
        </p>
      </div>

      <RecordingsManager
        initialRecordings={recordings}
        courses={courses}
        sessions={sessions}
        students={students}
        enrollments={enrollments}
        initialAccessList={accessList}
      />
    </div>
  );
}

