"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

export async function upsertFaqAction(params: {
  id?: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_published?: boolean;
}) {
  try {
    const supabase = await ensureAdmin();

    const payload = {
      question: params.question.trim(),
      answer: params.answer.trim(),
      sort_order: params.sort_order ?? 0,
      is_published: params.is_published ?? true,
    };

    if (params.id) {
      const { error } = await supabase
        .from("faqs")
        .update(payload)
        .eq("id", params.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("faqs").insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to save FAQ" };
  }
}

export async function toggleFaqPublishAction(faqId: string, isPublished: boolean) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase
      .from("faqs")
      .update({ is_published: isPublished })
      .eq("id", faqId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update FAQ status" };
  }
}

export async function deleteFaqAction(faqId: string) {
  try {
    const supabase = await ensureAdmin();
    const { error } = await supabase.from("faqs").delete().eq("id", faqId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete FAQ" };
  }
}
