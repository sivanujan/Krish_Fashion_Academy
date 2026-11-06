import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatCAD, formatBatchDates, formatTime } from "@/lib/utils";
import type { ClassSession } from "@/types/database";
import { Plus, Calendar, Users, Eye, MessageSquareQuote } from "lucide-react";

export const dynamic = "force-dynamic";

interface SessionWithCourse extends ClassSession {
  courses?: { title?: string } | null;
}

export default async function AdminBatchesPage() {
  let batches: (ClassSession & { course_title?: string })[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("class_sessions")
      .select("*, courses(title)")
      .order("start_date", { ascending: false });

    if (data) {
      batches = (data as unknown as SessionWithCourse[]).map((b) => ({
        ...b,
        course_title: b.courses?.title || "Saree Blouse Master Class",
      }));
    }
  } catch (err) {
    console.error("Batches list fetch error:", err);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
            Batches &amp; Cohorts
          </h1>
          <p className="text-xs text-charcoal-light mt-1">
            Manage upcoming, ongoing, and completed masterclass sessions in Scarborough and online.
          </p>
        </div>

        <Link
          href="/admin/batches/new"
          className="inline-flex items-center space-x-2 bg-gold text-charcoal-darkest px-4 py-2.5 rounded-sm uppercase tracking-wider text-xs font-semibold hover:bg-gold-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </Link>
      </div>

      {/* Batches Table */}
      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm overflow-hidden">
        {batches.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm">
            No batches created yet. Click &quot;New Batch&quot; to set up your next intake.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                <tr>
                  <th className="py-3 px-4">Batch Code &amp; Title</th>
                  <th className="py-3 px-4">Dates &amp; Time</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Tuition</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {batches.map((batch) => {
                  const formattedDates = formatBatchDates(
                    batch.class_dates,
                    batch.start_date,
                    batch.second_date
                  );
                  const timeRange = `${formatTime(batch.start_time)} – ${formatTime(batch.end_time)}`;

                  return (
                    <tr key={batch.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/batches/${batch.id}`}
                          className="font-medium text-heading text-sm hover:text-gold transition-colors block"
                        >
                          {batch.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gold-dark bg-gold/10 px-1.5 py-0.5 rounded-sm">
                            {batch.batch_code}
                          </span>
                          <span className="text-[11px] text-charcoal-light">
                            {batch.course_title}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-charcoal">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                          <span>{formattedDates}</span>
                        </div>
                        <span className="text-[11px] text-charcoal-light block mt-0.5">
                          {timeRange}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-sm bg-charcoal/10 text-charcoal">
                          {batch.mode === "both"
                            ? "In-Person & Online"
                            : batch.mode === "in_person"
                            ? "In-Person"
                            : "Online"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-gold-dark">
                        {batch.price_cad ? formatCAD(batch.price_cad) : "—"}
                        {batch.discount_label && (
                          <span className="block text-[10px] text-emerald-600 font-sans font-bold">
                            {batch.discount_label}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1 text-xs">
                          <Users className="w-3.5 h-3.5 text-charcoal-light" />
                          <span className="font-medium">{batch.seats_left}</span>
                          <span className="text-charcoal-light">/ {batch.seats_total} left</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                            batch.feedback_open
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-charcoal/10 text-charcoal-light"
                          }`}
                        >
                          <MessageSquareQuote className="w-3 h-3" />
                          <span>{batch.feedback_open ? "Open" : "Closed"}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            batch.status === "completed"
                              ? "neutral"
                              : batch.status === "ongoing"
                              ? "gold"
                              : batch.status === "upcoming"
                              ? "success"
                              : "danger"
                          }
                        >
                          {batch.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/batches/${batch.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-gold transition-colors bg-subtle hover:bg-gold/15 px-3 py-1.5 rounded-sm border border-charcoal/10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
