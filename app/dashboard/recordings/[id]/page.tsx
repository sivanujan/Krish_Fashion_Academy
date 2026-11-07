import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WatchRecordingClient from "@/components/dashboard/WatchRecordingClient";
import type { PlayerRecording, MyRecording } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

interface SingleRecordingRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  session_id: string | null;
  class_date: string | null;
  source_type: PlayerRecording["source_type"];
  embed_src: string | null;
  video_id: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  courses: { title?: string } | { title?: string }[] | null;
  class_sessions: { batch_code?: string; title?: string } | { batch_code?: string; title?: string }[] | null;
  recording_views: { last_position_seconds?: number; completed?: boolean }[] | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params;
  return {
    title: `Watch Lesson Recording | Krish Fashion Academy`,
  };
}

export default async function WatchRecordingPage({ params }: PageProps) {
  const { id: recordingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/recordings/${recordingId}`);
  }

  let recording: PlayerRecording | null = null;
  let siblings: MyRecording[] = [];

  try {
    // 1. Fetch recording securely via RPC (which verifies active student access & hides source_url)
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_recording_for_player", {
      p_recording_id: recordingId,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      recording = rpcData[0] as PlayerRecording;
    } else {
      // 2. Direct fallback query if RPC has not been executed yet in the SQL editor
      const { data: directData } = await supabase
        .from("recordings")
        .select(
          `
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
          courses (title),
          class_sessions (batch_code, title),
          recording_access!inner (student_id, expires_at),
          recording_views (last_position_seconds, completed)
        `
        )
        .eq("id", recordingId)
        .eq("recording_access.student_id", user.id)
        .eq("is_published", true)
        .single();

      if (directData) {
        const d = directData as unknown as SingleRecordingRow;
        const course = Array.isArray(d.courses) ? d.courses[0] : d.courses;
        const session = Array.isArray(d.class_sessions) ? d.class_sessions[0] : d.class_sessions;
        const view = Array.isArray(d.recording_views) ? d.recording_views[0] : d.recording_views;

        recording = {
          id: d.id,
          title: d.title,
          description: d.description,
          course_id: d.course_id,
          course_title: course?.title || null,
          session_id: d.session_id,
          batch_code: session?.batch_code || null,
          batch_title: session?.title || null,
          class_date: d.class_date,
          source_type: d.source_type,
          embed_src: d.embed_src,
          video_id: d.video_id,
          thumbnail_url: d.thumbnail_url,
          duration_minutes: d.duration_minutes,
          last_position_seconds: view?.last_position_seconds || 0,
          completed: view?.completed || false,
        };
      }
    }

    // If not found or user lacks access, return notFound() without revealing existence
    if (!recording) {
      notFound();
    }

    // Fetch sibling recordings for the same batch or course
    const { data: myRecs } = await supabase.rpc("get_my_recordings");
    if (myRecs) {
      siblings = (myRecs as MyRecording[]).filter((r) =>
        recording?.session_id
          ? r.session_id === recording.session_id
          : r.course_id === recording?.course_id
      );
    }
  } catch (err) {
    console.error("Watch recording page fetch error:", err);
    notFound();
  }

  return <WatchRecordingClient recording={recording} siblingRecordings={siblings} />;
}
