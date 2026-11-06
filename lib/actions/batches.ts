"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sessionSchema } from "@/lib/validations/course";
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

export async function upsertBatchAction(batchId: string | null, data: unknown) {
  try {
    const supabase = await ensureAdmin();
    const validated = sessionSchema.parse(data);

    const rowData = {
      course_id: validated.course_id,
      batch_code: validated.batch_code.trim(),
      title: validated.title.trim(),
      start_date: validated.start_date,
      second_date: validated.second_date || null,
      class_dates: validated.class_dates && validated.class_dates.length > 0
        ? validated.class_dates
        : [validated.start_date, ...(validated.second_date ? [validated.second_date] : [])],
      start_time: validated.start_time || "11:00:00",
      end_time: validated.end_time || "16:00:00",
      location: validated.location || "Middlefield Rd & McNicoll Ave, Scarborough, ON",
      mode: validated.mode,
      price_cad: validated.price_cad ?? null,
      discount_percent: validated.discount_percent ?? null,
      discount_label: validated.discount_label || null,
      seats_total: validated.seats_total,
      seats_left: validated.seats_left,
      online_join_url: validated.online_join_url || null,
      feedback_open: validated.feedback_open,
      status: validated.status,
      is_published: validated.is_published,
    };

    if (batchId) {
      const { error } = await supabase
        .from("class_sessions")
        .update(rowData)
        .eq("id", batchId);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("class_sessions")
        .insert(rowData);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/batches");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save batch" };
  }
}

export async function deleteBatchAction(batchId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("class_sessions")
      .delete()
      .eq("id", batchId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/batches");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete batch" };
  }
}

export async function toggleBatchPublishAction(batchId: string, isPublished: boolean) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("class_sessions")
      .update({ is_published: isPublished })
      .eq("id", batchId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${batchId}`);
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function toggleFeedbackOpenAction(batchId: string, isOpen: boolean) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("class_sessions")
      .update({ feedback_open: isOpen })
      .eq("id", batchId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${batchId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to toggle feedback" };
  }
}

export async function enrollParticipantAction(params: {
  sessionId: string;
  courseId: string;
  studentId?: string;
  newStudent?: {
    fullName: string;
    email: string;
    phone?: string;
    tempPassword?: string;
  };
  attendanceMode: "in_person" | "online";
  paymentStatus: "unpaid" | "paid" | "waived" | "refunded";
  amountPaidCad?: number;
  paymentNote?: string;
}) {
  try {
    await ensureAdmin();

    let targetStudentId = params.studentId;

    // If provisioning a brand-new student account
    if (!targetStudentId && params.newStudent) {
      const adminClient = createAdminClient();
      const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
        email: params.newStudent.email.trim(),
        password: params.newStudent.tempPassword || "KFA2026!",
        email_confirm: true,
        user_metadata: {
          full_name: params.newStudent.fullName.trim(),
          phone: params.newStudent.phone?.trim() || null,
          role: "student",
        },
      });

      if (authError || !newUser?.user) {
        return { success: false, error: authError?.message || "Failed to create student user" };
      }

      targetStudentId = newUser.user.id;

      // Ensure profile row exists
      await adminClient.from("profiles").upsert({
        id: targetStudentId,
        full_name: params.newStudent.fullName.trim(),
        phone: params.newStudent.phone?.trim() || null,
        role: "student",
        is_active: true,
      });
    }

    if (!targetStudentId) {
      return { success: false, error: "No student ID selected or provided" };
    }

    const supabase = await createClient();

    const { error: enrollError } = await supabase.from("enrollments").upsert({
      student_id: targetStudentId,
      course_id: params.courseId,
      session_id: params.sessionId,
      attendance_mode: params.attendanceMode,
      payment_status: params.paymentStatus,
      amount_paid_cad: params.amountPaidCad || null,
      payment_note: params.paymentNote || null,
      status: "active",
    }, {
      onConflict: "student_id,session_id",
    });

    if (enrollError) return { success: false, error: enrollError.message };

    // Decrement seats_left on batch if possible
    const { data: currentSession } = await supabase
      .from("class_sessions")
      .select("seats_left")
      .eq("id", params.sessionId)
      .single();

    if (currentSession && typeof currentSession.seats_left === "number" && currentSession.seats_left > 0) {
      await supabase
        .from("class_sessions")
        .update({ seats_left: currentSession.seats_left - 1 })
        .eq("id", params.sessionId);
    }

    revalidatePath(`/admin/batches/${params.sessionId}`);
    revalidatePath("/admin/batches");
    revalidatePath("/admin/enrollments");
    revalidatePath("/classes");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to enroll participant" };
  }
}

export async function removeParticipantAction(enrollmentId: string, sessionId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/batches/${sessionId}`);
    revalidatePath("/admin/batches");
    revalidatePath("/admin/enrollments");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to remove participant" };
  }
}

export async function updatePaymentAction(
  enrollmentId: string,
  sessionId: string,
  paymentStatus: "unpaid" | "paid" | "waived" | "refunded",
  amountPaidCad: number | null,
  paymentNote: string | null
) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("enrollments")
      .update({
        payment_status: paymentStatus,
        amount_paid_cad: amountPaidCad,
        payment_note: paymentNote,
      })
      .eq("id", enrollmentId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/batches/${sessionId}`);
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update payment" };
  }
}
