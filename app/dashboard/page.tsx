import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatBatchDates, formatTime } from "@/lib/utils";
import { Calendar, MapPin, ArrowRight, BookOpen } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Student Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          My Batches
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Access your masterclass schedules, live online Zoom coordinates, class recordings, and batch feedback.
        </p>
      </div>

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
