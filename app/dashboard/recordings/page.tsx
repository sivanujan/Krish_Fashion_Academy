import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyRecordingsClient from "@/components/dashboard/MyRecordingsClient";
import type { MyRecording } from "@/types/database";

export const metadata: Metadata = {
  title: "Class Recordings | Krish Fashion Academy",
};

export const dynamic = "force-dynamic";

export default async function StudentRecordingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/recordings");
  }

  let recordings: MyRecording[] = [];

  try {
    // 1. Preferred: Secure Supabase RPC hiding source_url
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_recordings");

    if (!rpcError && rpcData) {
      recordings = rpcData as MyRecording[];
    } else {
      // 2. Direct RLS query fallback if the RPC has not been executed yet in the SQL editor
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
          sort_order,
          courses (title, slug),
          class_sessions (batch_code, title),
          recording_access!inner (student_id, granted_at, expires_at),
          recording_views (last_position_seconds, completed)
        `
        )
        .eq("recording_access.student_id", user.id)
        .eq("is_published", true)
        .order("class_date", { ascending: false });

      if (directData) {
        recordings = (directData as any[]).map((r) => {
          const course = Array.isArray(r.courses) ? r.courses[0] : r.courses;
          const session = Array.isArray(r.class_sessions) ? r.class_sessions[0] : r.class_sessions;
          const access = Array.isArray(r.recording_access) ? r.recording_access[0] : r.recording_access;
          const view = Array.isArray(r.recording_views) ? r.recording_views[0] : r.recording_views;

          return {
            id: r.id,
            title: r.title,
            description: r.description,
            course_id: r.course_id,
            course_title: course?.title || null,
            course_slug: course?.slug || null,
            session_id: r.session_id,
            batch_code: session?.batch_code || null,
            batch_title: session?.title || null,
            class_date: r.class_date,
            source_type: r.source_type,
            embed_src: r.embed_src,
            video_id: r.video_id,
            thumbnail_url: r.thumbnail_url,
            duration_minutes: r.duration_minutes,
            sort_order: r.sort_order,
            granted_at: access?.granted_at || "",
            expires_at: access?.expires_at || null,
            last_position_seconds: view?.last_position_seconds || 0,
            completed: view?.completed || false,
          };
        });
      }
    }
  } catch (err) {
    console.error("Error fetching student recordings:", err);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      <MyRecordingsClient initialRecordings={recordings} />
    </div>
  );
}
