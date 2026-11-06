"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicFeedbackSchema } from "@/lib/validations/course";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    throw new Error("Admin privileges required");
  }
  return supabase;
}

export async function moderateFeedbackAction(feedbackId: string, status: "approved" | "hidden" | "pending") {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("feedback")
      .update({ status })
      .eq("id", feedbackId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/feedback");
    revalidatePath("/admin/batches");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update feedback status" };
  }
}

export async function replyFeedbackAction(feedbackId: string, reply: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("feedback")
      .update({ admin_reply: reply })
      .eq("id", feedbackId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/feedback");
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save reply" };
  }
}

export async function submitPortalFeedbackAction(data: {
  sessionId: string;
  ratingOverall: number;
  ratingTeaching: number;
  ratingContent: number;
  liked: string;
  improve?: string;
  wouldRecommend: boolean;
  consentToPublish: boolean;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Please log in to submit feedback" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("feedback").insert({
      session_id: data.sessionId,
      student_id: user.id,
      name: profile?.full_name || "Student",
      phone: profile?.phone || null,
      rating_overall: data.ratingOverall,
      rating_teaching: data.ratingTeaching,
      rating_content: data.ratingContent,
      liked: data.liked,
      improve: data.improve || null,
      would_recommend: data.wouldRecommend,
      consent_to_publish: data.consentToPublish,
      status: "pending",
    });

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/batches`);
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * Public Feedback submission via token link (/feedback/[token])
 * Uses service role on server to validate feedback_token & feedback_open
 */
export async function submitPublicFeedbackAction(data: unknown) {
  try {
    const validated = publicFeedbackSchema.parse(data);

    // Spam honeypot verification
    if (validated.website_honeypot && validated.website_honeypot.length > 0) {
      return { success: false, error: "Submission flagged as automated spam" };
    }

    const adminClient = createAdminClient();

    // Verify token exists and feedback is open
    const { data: session, error: sessionErr } = await adminClient
      .from("class_sessions")
      .select("id, title, feedback_open")
      .eq("feedback_token", validated.token)
      .single();

    if (sessionErr || !session) {
      return { success: false, error: "Invalid feedback link" };
    }

    if (!session.feedback_open) {
      return { success: false, error: "Feedback for this batch is currently closed" };
    }

    // Rate-limit / Prevent duplicate submissions per phone number per batch
    const cleanPhone = validated.phone.replace(/[^0-9]/g, "");
    const { data: existing } = await adminClient
      .from("feedback")
      .select("id")
      .eq("session_id", session.id)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Feedback has already been submitted from this phone number for this batch. Thank you!" };
    }

    // Insert feedback
    const { error: insertErr } = await adminClient.from("feedback").insert({
      session_id: session.id,
      student_id: null,
      name: validated.name.trim(),
      phone: cleanPhone,
      rating_overall: validated.rating_overall,
      rating_teaching: validated.rating_teaching,
      rating_content: validated.rating_content,
      liked: validated.liked.trim(),
      improve: validated.improve?.trim() || null,
      would_recommend: validated.would_recommend,
      consent_to_publish: validated.consent_to_publish,
      status: "pending",
    });

    if (insertErr) return { success: false, error: insertErr.message };

    revalidatePath("/admin/feedback");
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to submit feedback" };
  }
}
