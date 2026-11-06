import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BatchDetailManager, { type EnrolledParticipant } from "@/components/admin/BatchDetailManager";
import type { ClassSession, Course, Profile, Lesson, Feedback } from "@/types/database";

export const dynamic = "force-dynamic";

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBatchDetailPage({ params }: BatchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    batchRes,
    coursesRes,
    studentsRes,
    participantsRes,
    recordingsRes,
    feedbackRes,
  ] = await Promise.all([
    supabase
      .from("class_sessions")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase
      .from("enrollments")
      .select("*, profiles(*)")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("*")
      .eq("session_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("feedback")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const batch = batchRes.data as ClassSession | null;
  if (!batch) notFound();

  const courses = (coursesRes.data || []) as Course[];
  const allStudents = (studentsRes.data || []) as Profile[];
  const participants = (participantsRes.data || []) as unknown as EnrolledParticipant[];
  const recordings = (recordingsRes.data || []) as Lesson[];
  const feedbackList = (feedbackRes.data || []) as Feedback[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <BatchDetailManager
      batch={batch}
      courses={courses}
      allStudents={allStudents}
      participants={participants}
      recordings={recordings}
      feedbackList={feedbackList}
      siteUrl={siteUrl}
    />
  );
}
