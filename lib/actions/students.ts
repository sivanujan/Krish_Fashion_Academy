"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { studentSchema } from "@/lib/validations/course";
import { revalidatePath } from "next/cache";

// Verify admin authorization
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
  return user;
}

export async function createStudentAction(data: unknown) {
  try {
    await ensureAdmin();
    const validated = studentSchema.parse(data);

    // Using service role client (Server Action only, never exposed to client)
    const adminSupabase = createAdminClient();

    // 1. Create auth user with pre-confirmed email
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.full_name,
        phone: validated.phone || null,
        role: "student",
      },
    });

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || "Failed to create user account" };
    }

    // Trigger on_auth_user_created automatically creates the row in public.profiles.
    // Explicitly update profile to make sure phone & full_name are synced
    await adminSupabase
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        full_name: validated.full_name,
        phone: validated.phone || null,
        role: "student",
        is_active: true,
      });

    revalidatePath("/admin/students");
    return { success: true, userId: authUser.user.id };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "An unexpected error occurred while creating the student." };
  }
}

export async function toggleStudentStatusAction(studentId: string, currentStatus: boolean) {
  try {
    await ensureAdmin();
    const adminSupabase = createAdminClient();

    const newStatus = !currentStatus;
    const { error } = await adminSupabase
      .from("profiles")
      .update({ is_active: newStatus })
      .eq("id", studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/students");
    return { success: true, newStatus };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update student status." };
  }
}
