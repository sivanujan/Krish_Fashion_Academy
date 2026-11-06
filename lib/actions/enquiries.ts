"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { enquirySchema, type EnquiryInput } from "@/lib/validations/enquiry";
import { revalidatePath } from "next/cache";

// Simple in-memory IP rate limiter: max 3 per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function submitEnquiry(data: EnquiryInput) {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return {
        success: false,
        error: "Too many messages sent. Please message us on WhatsApp directly at +1 647-501-9569.",
      };
    }

    const validated = enquirySchema.parse(data);

    // Spam honeypot detection
    if (validated.bot_trap && validated.bot_trap.length > 0) {
      return { success: true };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("enquiries").insert({
      name: validated.name.trim(),
      phone: validated.phone.trim(),
      email: validated.email ? validated.email.trim() : null,
      course_interest: validated.course_interest || null,
      preferred_mode: validated.preferred_mode || null,
      interested_session_id: validated.interested_session_id || null,
      message: validated.message.trim(),
      status: "new",
      is_read: false,
    });

    if (error) {
      console.error("Enquiry submission error:", error);
      return { success: false, error: "Failed to submit enquiry. Please try again." };
    }

    // Optional email notification if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Krish Fashion Academy <notifications@krishfashionacademy.com>",
            to: [process.env.ADMIN_EMAIL || "notifications@krishfashionacademy.com"],
            subject: `New Master Class Enquiry from ${validated.name}`,
            text: `Name: ${validated.name}\nPhone: ${validated.phone}\nEmail: ${validated.email || "N/A"}\nMode: ${validated.preferred_mode || "N/A"}\nMessage: ${validated.message}`,
          }),
        });
      } catch (emailErr) {
        // Silently skip if email failed
        console.warn("Resend notification skipped:", emailErr);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Enquiry validation error:", err);
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: "new" | "contacted" | "registered" | "closed",
  adminNote?: string | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("enquiries")
      .update({
        status,
        admin_note: adminNote || null,
        is_read: true,
      })
      .eq("id", enquiryId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to update enquiry" };
  }
}

export async function deleteEnquiryAction(enquiryId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").delete().eq("id", enquiryId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete enquiry" };
  }
}
