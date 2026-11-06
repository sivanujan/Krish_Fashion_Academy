import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BatchClassroomClient from "@/components/dashboard/BatchClassroomClient";
import type { ClassSession, Lesson, Feedback } from "@/types/database";

export const dynamic = "force-dynamic";

interface BatchPageProps {
  params: Promise<{ batch_code: string }>;
}

export default async function StudentBatchPage({ params }: BatchPageProps) {
  const { batch_code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch batch
  const { data: batch } = await supabase
    .from("class_sessions")
    .select("*")
    .eq("batch_code", batch_code)
    .single();

  if (!batch) notFound();

  // 2. Verify student's enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("session_id", batch.id)
    .maybeSingle();

  // Fallback: check course-level enrollment if session_id wasn't set
  let attendanceMode: "in_person" | "online" = "in_person";
  if (!enrollment) {
    const { data: courseEnrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", user.id)
      .eq("course_id", batch.course_id)
      .maybeSingle();

    if (!courseEnrollment) {
      redirect("/dashboard");
    }
    attendanceMode = courseEnrollment.attendance_mode || "in_person";
  } else {
    attendanceMode = enrollment.attendance_mode || "in_person";
  }

  // 3. Fetch recordings (batch-specific OR general course lessons)
  const { data: recordingsData } = await supabase
    .from("lessons")
    .select("*")
    .or(`session_id.eq.${batch.id},and(session_id.is.null,course_id.eq.${batch.course_id})`)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const recordings = (recordingsData || []) as Lesson[];

  // 4. Check existing feedback
  const { data: feedbackData } = await supabase
    .from("feedback")
    .select("*")
    .eq("session_id", batch.id)
    .eq("student_id", user.id)
    .maybeSingle();

  const existingFeedback = feedbackData as Feedback | null;

  return (
    <BatchClassroomClient
      batch={batch}
      recordings={recordings}
      existingFeedback={existingFeedback}
      attendanceMode={attendanceMode}
    />
  );
}
