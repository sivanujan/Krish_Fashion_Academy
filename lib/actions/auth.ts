"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export async function loginAction(data: unknown) {
  try {
    const validated = loginSchema.parse(data);
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error || !authData.user) {
      return { success: false, error: error?.message || "Invalid credentials" };
    }

    // Check profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", authData.user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return { success: false, error: "Your account has been deactivated. Please contact the academy administrator." };
    }

    const redirectPath = profile?.role === "admin" ? "/admin" : "/dashboard";
    return { success: true, redirectPath };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "An unexpected error occurred during sign in." };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(data: unknown) {
  try {
    const validated = forgotPasswordSchema.parse(data);
    const supabase = await createClient();

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to send reset link." };
  }
}

export async function resetPasswordAction(data: unknown) {
  try {
    const validated = resetPasswordSchema.parse(data);
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update password." };
  }
}

export async function updateProfileAction(fullName: string, phone?: string, newPassword?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  if (newPassword && newPassword.length >= 6) {
    const { error: passError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (passError) {
      return { success: false, error: passError.message };
    }
  }

  return { success: true };
}
