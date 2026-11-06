import { createClient } from "@/lib/supabase/server";
import FeedbackModeratorClient from "@/components/admin/FeedbackModeratorClient";
import type { Feedback } from "@/types/database";

export const dynamic = "force-dynamic";

interface FeedbackWithSession extends Feedback {
  class_sessions?: { title?: string; batch_code?: string } | null;
}

export default async function AdminFeedbackPage() {
  let feedbackList: (Feedback & { batch_title?: string; batch_code?: string })[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("feedback")
      .select("*, class_sessions(title, batch_code)")
      .order("created_at", { ascending: false });

    if (data) {
      feedbackList = (data as unknown as FeedbackWithSession[]).map((f) => ({
        ...f,
        batch_title: f.class_sessions?.title || "Master Class",
        batch_code: f.class_sessions?.batch_code || "",
      }));
    }
  } catch (err) {
    console.error("Feedback list fetch error:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Global Student Feedback
        </h1>
        <p className="text-xs text-charcoal-light mt-1">
          Moderate verified student reviews across all cohorts. Approved reviews with student consent automatically appear in the website testimonials.
        </p>
      </div>

      <FeedbackModeratorClient initialFeedback={feedbackList} />
    </div>
  );
}
