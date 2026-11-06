"use server";

import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validations/course";
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

export async function assignEnrollmentAction(data: unknown) {
  try {
    const supabase = await ensureAdmin();
    const validated = enrollmentSchema.parse(data);

    const { error } = await supabase
      .from("enrollments")
      .upsert(
        {
          student_id: validated.student_id,
          course_id: validated.course_id,
          status: validated.status,
          expires_at: validated.expires_at || null,
        },
        { onConflict: "student_id,course_id" }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to assign enrollment" };
  }
}

export async function deleteEnrollmentAction(enrollmentId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to remove enrollment" };
  }
}
