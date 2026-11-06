"use server";

import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validations/course";
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

export async function updateSiteSettingsAction(data: unknown) {
  try {
    const supabase = await ensureAdmin();
    const validated = siteSettingsSchema.parse(data);

    const { error } = await supabase
      .from("site_settings")
      .update({
        phone: validated.phone,
        whatsapp_number: validated.whatsapp_number,
        email: validated.email,
        address: validated.address,
        map_embed_url: validated.map_embed_url || null,
        facebook_url: validated.facebook_url || null,
        instagram_url: validated.instagram_url || null,
        tiktok_url: validated.tiktok_url || null,
        youtube_url: validated.youtube_url || null,
        counter_students: validated.counter_students,
        counter_years: validated.counter_years,
        counter_courses: validated.counter_courses,
      })
      .eq("id", "00000000-0000-0000-0000-000000000001");

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update site settings" };
  }
}

export async function markEnquiryReadAction(enquiryId: string, isRead: boolean) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("enquiries")
      .update({ is_read: isRead })
      .eq("id", enquiryId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/enquiries");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update enquiry status" };
  }
}

export async function deleteEnquiryAction(enquiryId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("enquiries").delete().eq("id", enquiryId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/enquiries");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete enquiry" };
  }
}

export async function upsertGalleryItemAction(id: string | null, imageUrl: string, caption: string, category: string, sortOrder: number) {
  try {
    const supabase = await ensureAdmin();
    if (id) {
      const { error } = await supabase.from("gallery_items").update({
        image_url: imageUrl,
        caption: caption || null,
        category,
        sort_order: sortOrder,
      }).eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("gallery_items").insert({
        image_url: imageUrl,
        caption: caption || null,
        category,
        sort_order: sortOrder,
      });
      if (error) return { success: false, error: error.message };
    }
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save gallery item" };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete gallery item" };
  }
}

export async function upsertServiceAction(id: string | null, title: string, description: string, imageUrl: string | null, sortOrder: number) {
  try {
    const supabase = await ensureAdmin();
    if (id) {
      const { error } = await supabase.from("services").update({
        title,
        description,
        image_url: imageUrl || null,
        sort_order: sortOrder,
      }).eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("services").insert({
        title,
        description,
        image_url: imageUrl || null,
        sort_order: sortOrder,
      });
      if (error) return { success: false, error: error.message };
    }
    revalidatePath("/admin/services");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save service" };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/services");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete service" };
  }
}

export async function upsertTestimonialAction(id: string | null, name: string, role: string, message: string, rating: number, photoUrl: string | null, isPublished: boolean, sortOrder: number) {
  try {
    const supabase = await ensureAdmin();
    if (id) {
      const { error } = await supabase.from("testimonials").update({
        name,
        role,
        message,
        rating,
        photo_url: photoUrl || null,
        is_published: isPublished,
        sort_order: sortOrder,
      }).eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("testimonials").insert({
        name,
        role,
        message,
        rating,
        photo_url: photoUrl || null,
        is_published: isPublished,
        sort_order: sortOrder,
      });
      if (error) return { success: false, error: error.message };
    }
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save testimonial" };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete testimonial" };
  }
}
