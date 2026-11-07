"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasServiceRoleKey =
      Boolean(serviceRoleKey) &&
      !serviceRoleKey?.includes("placeholder") &&
      (serviceRoleKey?.startsWith("sb_secret_") || serviceRoleKey?.startsWith("eyJ"));

    let createdUserId: string | null = null;

    if (hasServiceRoleKey) {
      // 1. Preferred: Using service role client with pre-confirmed email
      const adminSupabase = createAdminClient();
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

      createdUserId = authUser.user.id;

      // Ensure profile has phone and name synced
      await adminSupabase.from("profiles").upsert({
        id: createdUserId,
        full_name: validated.full_name,
        phone: validated.phone || null,
        role: "student",
        is_active: true,
      });
    } else {
      // 2. Direct fallback: Create student account via standard Auth signup
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const signupClient = createSupabaseClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: signUpData, error: signUpError } = await signupClient.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: validated.full_name,
            phone: validated.phone || null,
            role: "student",
          },
        },
      });

      if (signUpError || !signUpData.user) {
        return {
          success: false,
          error: signUpError?.message || "Failed to register student account",
        };
      }

      createdUserId = signUpData.user.id;
    }

    revalidatePath("/admin/students");
    return { success: true, userId: createdUserId };
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
