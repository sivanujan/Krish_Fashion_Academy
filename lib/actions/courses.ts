"use server";

import { createClient } from "@/lib/supabase/server";
import { courseSchema, lessonSchema } from "@/lib/validations/course";
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

export async function upsertCourseAction(courseId: string | null, data: unknown) {
  try {
    const supabase = await ensureAdmin();
    const validated = courseSchema.parse(data);

    if (courseId) {
      const { error } = await supabase
        .from("courses")
        .update({
          title: validated.title,
          slug: validated.slug,
          short_description: validated.short_description,
          description: validated.description,
          duration: validated.duration,
          fee_cad: validated.fee_cad,
          cover_image_url: validated.cover_image_url || null,
          is_published: validated.is_published,
          sort_order: validated.sort_order,
        })
        .eq("id", courseId);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("courses")
        .insert({
          title: validated.title,
          slug: validated.slug,
          short_description: validated.short_description,
          description: validated.description,
          duration: validated.duration,
          fee_cad: validated.fee_cad,
          cover_image_url: validated.cover_image_url || null,
          is_published: validated.is_published,
          sort_order: validated.sort_order,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save course" };
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete course" };
  }
}

export async function upsertLessonAction(lessonId: string | null, data: unknown) {
  try {
    const supabase = await ensureAdmin();
    const validated = lessonSchema.parse(data);

    if (lessonId) {
      const { error } = await supabase
        .from("lessons")
        .update({
          course_id: validated.course_id,
          session_id: validated.session_id || null,
          title: validated.title,
          description: validated.description || null,
          class_date: validated.class_date || null,
          sort_order: validated.sort_order,
          video_provider: validated.video_provider || null,
          video_id: validated.video_id || null,
          is_published: validated.is_published,
        })
        .eq("id", lessonId);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("lessons")
        .insert({
          course_id: validated.course_id,
          session_id: validated.session_id || null,
          title: validated.title,
          description: validated.description || null,
          class_date: validated.class_date || null,
          sort_order: validated.sort_order,
          video_provider: validated.video_provider || null,
          video_id: validated.video_id || null,
          is_published: validated.is_published,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save lesson" };
  }
}

export async function deleteLessonAction(lessonId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete lesson" };
  }
}
