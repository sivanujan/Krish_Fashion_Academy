import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatBatchDates, formatTime } from "@/lib/utils";
import { Calendar, MapPin, ArrowRight, BookOpen, Video, Play, CheckCircle2 } from "lucide-react";
import type { MyRecording } from "@/types/database";

export const metadata: Metadata = {
  title: "My Batches & Classroom",
};

export const dynamic = "force-dynamic";

interface EnrollmentItem {
  id: string;
  attendance_mode: "in_person" | "online" | null;
  payment_status: "unpaid" | "paid" | "waived" | "refunded" | null;
  amount_paid_cad: number | null;
  status: string;
  created_at: string;
  class_sessions: {
    id: string;
    batch_code: string;
    title: string;
    start_date: string | null;
    second_date: string | null;
    class_dates: string[] | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    status: string;
    online_join_url: string | null;
  } | null;
  courses: {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    cover_image_url: string | null;
  } | null;
}

interface RawQueryRecordingRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  session_id: string | null;
  class_date: string | null;
  source_type: MyRecording["source_type"];
  embed_src: string | null;
  video_id: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  courses: { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
  class_sessions: { batch_code?: string; title?: string } | { batch_code?: string; title?: string }[] | null;
  recording_access: { granted_at?: string; expires_at?: string | null }[] | null;
  recording_views: { last_position_seconds?: number; completed?: boolean }[] | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      attendance_mode,
      payment_status,
      amount_paid_cad,
      status,
      created_at,
      class_sessions (
        id,
        batch_code,
        title,
        start_date,
        second_date,
        class_dates,
        start_time,
        end_time,
        location,
        mode,
        status,
        online_join_url
      ),
      courses (
        id,
        title,
        slug,
        short_description,
        cover_image_url
      )
    `)
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (enrollments || []) as unknown as EnrollmentItem[];

  // Fetch recent class recordings assigned to the student
  let recentRecordings: MyRecording[] = [];
  try {
    const { data: recData, error: recErr } = await supabase.rpc("get_my_recordings");
    if (!recErr && recData) {
      recentRecordings = (recData as MyRecording[]).slice(0, 3);
    } else {
      const { data: directRecs } = await supabase
        .from("recordings")
        .select(`
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
        `)
        .eq("recording_access.student_id", user!.id)
        .eq("is_published", true)
        .order("class_date", { ascending: false })
        .limit(3);

      if (directRecs) {
        recentRecordings = (directRecs as unknown as RawQueryRecordingRow[]).map((r) => {
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
    console.error("Dashboard recordings fetch error:", err);
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Student Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          My Batches &amp; Classroom
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Access your masterclass schedules, live online Zoom coordinates, class recordings, and batch feedback.
        </p>
      </div>

      {/* Latest Assigned Class Recordings Section */}
      {recentRecordings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-gold-dark" />
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal-darkest">
                Latest Class Recordings
              </h2>
            </div>
            <Link
              href="/dashboard/recordings"
              className="text-xs font-semibold uppercase tracking-wider text-gold-dark hover:underline flex items-center space-x-1"
            >
              <span>View All Recordings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentRecordings.map((recording) => (
              <Link
                key={recording.id}
                href={`/dashboard/recordings/${recording.id}`}
                className="group bg-surface border border-charcoal/15 hover:border-gold/60 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-charcoal-darkest overflow-hidden flex items-center justify-center">
                    {recording.thumbnail_url ? (
                      <Image
                        src={recording.thumbnail_url}
                        alt={recording.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="text-center p-4 text-off-white/70">
                        <Video className="w-8 h-8 mx-auto text-gold-light mb-1" />
                        <span className="text-[9px] uppercase font-mono tracking-widest text-off-white/50">
                          {recording.source_type}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-charcoal-darkest/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-gold text-charcoal-darkest flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2">
                      {recording.completed ? (
                        <span className="bg-emerald-600/95 text-off-white text-[9px] px-1.5 py-0.5 rounded-sm font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Watched</span>
                        </span>
                      ) : recording.last_position_seconds > 0 ? (
                        <span className="bg-charcoal-darkest/90 text-gold-light text-[9px] px-1.5 py-0.5 rounded-sm font-medium">
                          In Progress
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 bg-charcoal-darkest/90 text-off-white text-[9px] px-1.5 py-0.5 rounded-sm font-mono">
                      {recording.duration_minutes
                        ? `${recording.duration_minutes}m`
                        : recording.source_type.replace("_", " ")}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    {recording.batch_code && (
                      <span className="font-mono text-[10px] bg-charcoal/10 text-charcoal px-1.5 py-0.5 rounded-sm">
                        {recording.batch_code}
                      </span>
                    )}
                    <h3 className="font-serif text-base text-charcoal-darkest group-hover:text-gold-dark transition-colors line-clamp-2 leading-snug">
                      {recording.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark flex items-center justify-between border-t border-charcoal/10 pt-2.5">
                    <span>Watch Lesson</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-surface border border-charcoal/15 rounded-sm p-12 text-center max-w-xl mx-auto shadow-sm">
          <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            No Active Batches Assigned
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-charcoal-light leading-relaxed">
            You do not currently have any active masterclass batches assigned to your account.
          </p>
          <p className="mt-3 text-xs text-charcoal-light">
            Once you register on WhatsApp (+1 647-501-9569), Krish will activate your batch access here.
          </p>
          <div className="mt-6">
            <Link
              href="/classes"
              className="inline-flex items-center text-xs uppercase tracking-widest text-gold-dark hover:text-gold font-medium"
            >
              <span>Explore Upcoming Batches</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const batch = item.class_sessions;
            const course = item.courses;
            const batchCode = batch?.batch_code || course?.slug || "batch";

            const formattedDates = batch
              ? formatBatchDates(batch.class_dates, batch.start_date, batch.second_date)
              : "Weekend Schedule";

            const timeRange = batch
              ? `${formatTime(batch.start_time)} – ${formatTime(batch.end_time)}`
              : "11:00 AM – 4:00 PM";

            return (
              <Card
                key={item.id}
                className="bg-surface border-charcoal/15 flex flex-col justify-between group overflow-hidden shadow-sm hover:border-gold/60 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-charcoal/5">
                    {course?.cover_image_url ? (
                      <Image
                        src={course.cover_image_url}
                        alt={batch?.title || course?.title || "Master Class"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold/40 bg-charcoal-darkest font-serif text-lg">
                        KFA Atelier
                      </div>
                    )}

                    {/* Status & Payment Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-charcoal-darkest/90 text-gold-light px-2.5 py-1 rounded-sm border border-gold/40">
                        {batch?.batch_code || "BATCH"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                      <Badge
                        variant={
                          item.payment_status === "paid"
                            ? "success"
                            : item.payment_status === "unpaid"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        Payment: {item.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="font-serif text-xl sm:text-2xl text-charcoal-darkest group-hover:text-gold-dark transition-colors leading-snug">
                      {batch?.title || course?.title}
                    </h2>

                    <div className="mt-4 space-y-2 text-xs text-charcoal">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gold-dark shrink-0" />
                        <span className="font-medium">{formattedDates}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gold-dark shrink-0" />
                        <span>
                          {batch?.location || "Middlefield & McNicoll, Scarborough, ON"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-charcoal-light pt-1">
                        <span className="uppercase font-semibold px-2 py-0.5 rounded-sm bg-subtle border border-charcoal/10">
                          {item.attendance_mode === "in_person" ? "In-Person Attendance" : "Live Online Attendance"}
                        </span>
                        <span>· {timeRange}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/dashboard/batches/${batchCode}`}
                    className="w-full inline-flex items-center justify-center bg-charcoal text-off-white hover:bg-gold hover:text-charcoal-darkest py-3 px-4 rounded-sm text-xs uppercase tracking-widest font-semibold transition-all duration-300"
                  >
                    <span>Open Batch Classroom &amp; Recordings</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
