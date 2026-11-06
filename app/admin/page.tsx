import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import NextBatchCountdownCard from "@/components/admin/NextBatchCountdownCard";
import { formatDate } from "@/lib/utils";
import type { ClassSession, Enquiry } from "@/types/database";
import {
  Users,
  CreditCard,
  Inbox,
  MessageSquare,
  Star,
  ArrowRight,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Krish Fashion Academy",
};

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  // Parallel queries for all requested dashboard metrics
  const [
    nextBatchRes,
    enrolledCountRes,
    unpaidCountRes,
    newEnquiriesRes,
    pendingFeedbackRes,
    lastCompletedBatchRes,
    recentEnquiriesRes,
  ] = await Promise.all([
    // 1. Next upcoming batch
    supabase
      .from("class_sessions")
      .select("*, courses(title)")
      .gte("start_date", today)
      .eq("is_published", true)
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle(),

    // 2. Total enrolled participants count
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    // 3. Unpaid participants count
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "unpaid"),

    // 4. New enquiries count (status = 'new')
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .or("status.eq.new,is_read.eq.false"),

    // 5. Pending feedback moderation count
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    // 6. Last completed batch
    supabase
      .from("class_sessions")
      .select("id, batch_code, title")
      .eq("status", "completed")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Recent 5 enquiries for the preview table
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Fallback for next batch if DB empty
  let nextBatch: (ClassSession & { courses?: { title: string } }) | null =
    nextBatchRes.data as (ClassSession & { courses?: { title: string } }) | null;

  if (!nextBatch) {
    // If no upcoming batch found with gte today, check any upcoming batch
    const anyBatchRes = await supabase
      .from("class_sessions")
      .select("*, courses(title)")
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (anyBatchRes.data) {
      nextBatch = anyBatchRes.data as (ClassSession & { courses?: { title: string } });
    }
  }

  // Calculate average rating of last completed batch
  let avgRating = 5.0;
  let completedBatchCode = "Completed Cohort";
  if (lastCompletedBatchRes.data?.id) {
    completedBatchCode = lastCompletedBatchRes.data.batch_code;
    const { data: feedbackData } = await supabase
      .from("feedback")
      .select("rating_overall")
      .eq("session_id", lastCompletedBatchRes.data.id);

    if (feedbackData && feedbackData.length > 0) {
      const sum = feedbackData.reduce((acc, f) => acc + (f.rating_overall || 5), 0);
      avgRating = Number((sum / feedbackData.length).toFixed(1));
    }
  } else {
    // Check across all feedback
    const { data: allFeedback } = await supabase
      .from("feedback")
      .select("rating_overall")
      .limit(20);
    if (allFeedback && allFeedback.length > 0) {
      const sum = allFeedback.reduce((acc, f) => acc + (f.rating_overall || 5), 0);
      avgRating = Number((sum / allFeedback.length).toFixed(1));
    }
  }

  const enrolledCount = enrolledCountRes.count ?? 0;
  const unpaidCount = unpaidCountRes.count ?? 0;
  const newEnquiriesCount = newEnquiriesRes.count ?? 0;
  const pendingFeedbackCount = pendingFeedbackRes.count ?? 0;
  const recentEnquiries = (recentEnquiriesRes.data || []) as Enquiry[];

  const statCards = [
    {
      title: "Enrolled Participants",
      value: enrolledCount,
      icon: Users,
      href: "/admin/batches",
      description: "Active students across cohorts",
      highlight: false,
    },
    {
      title: "Unpaid Tuitions",
      value: unpaidCount,
      icon: CreditCard,
      href: "/admin/batches",
      description: "Awaiting Interac or Cash",
      highlight: unpaidCount > 0,
    },
    {
      title: "New Enquiries",
      value: newEnquiriesCount,
      icon: Inbox,
      href: "/admin/enquiries",
      description: "Leads waiting for WhatsApp reply",
      highlight: newEnquiriesCount > 0,
    },
    {
      title: "Pending Feedback",
      value: pendingFeedbackCount,
      icon: MessageSquare,
      href: "/admin/feedback",
      description: "Student reviews to approve",
      highlight: pendingFeedbackCount > 0,
    },
    {
      title: "Completed Cohort Rating",
      value: `${avgRating} ★`,
      icon: Star,
      href: "/admin/feedback",
      description: `Average for ${completedBatchCode}`,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
            Academy Administration · Scarborough, ON
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
            Academy Operations Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
            Monitor admissions, upcoming cohorts, fee collections, and student feedback.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/batches/new"
            className="inline-flex items-center space-x-2 bg-charcoal hover:bg-charcoal-light text-off-white px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors"
          >
            <Calendar className="w-4 h-4 text-gold" />
            <span>Schedule Batch</span>
          </Link>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-light text-charcoal-darkest px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span>Admissions Inbox</span>
          </Link>
        </div>
      </div>

      {/* Hero Widget: Next Batch with Seats Left & Live Countdown */}
      <NextBatchCountdownCard batch={nextBatch} />

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card
                className={`p-5 bg-surface border-charcoal/15 transition-all hover:border-gold/50 ${
                  card.highlight
                    ? "border-gold/60 shadow-[0_4px_20px_rgba(201,162,74,0.15)] bg-gold/5"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-charcoal-light">
                    {card.title}
                  </span>
                  <div className="p-1.5 rounded-full bg-gold/15 text-gold-dark">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-3 font-serif text-3xl text-charcoal-darkest font-normal">
                  {card.value}
                </p>
                <p className="mt-1 text-[10px] text-charcoal-light line-clamp-1">
                  {card.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Admissions Inbox Table Preview */}
      <div className="bg-surface rounded-sm border border-charcoal/15 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-charcoal-darkest">
              Recent Admissions & WhatsApp Leads
            </h2>
            <p className="text-xs text-charcoal-light mt-0.5">
              Prospective students waiting for class details or confirmation
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-gold-dark hover:text-gold font-medium"
          >
            <span>Open Enquiries Inbox</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="text-center py-10 text-xs sm:text-sm text-charcoal-light">
            No inquiries received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-charcoal font-medium uppercase tracking-wider border-b border-charcoal/10">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Course / Mode</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {recentEnquiries.map((enq) => {
                  const status = enq.status || (enq.is_read ? "contacted" : "new");
                  return (
                    <tr key={enq.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            status === "new"
                              ? "gold"
                              : status === "registered"
                              ? "gold"
                              : "neutral"
                          }
                        >
                          {status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-heading">
                        {enq.name}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-light">
                        {enq.phone}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-light">
                        {enq.course_interest || "Saree Blouse Master Class"}
                        {enq.preferred_mode && (
                          <span className="ml-1 text-[10px] text-gold-dark capitalize">
                            ({enq.preferred_mode})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-light">
                        {formatDate(enq.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/admin/enquiries"
                          className="text-xs text-gold-dark hover:underline font-medium"
                        >
                          Review & Reply
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
