import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EnquiriesInbox, { type BatchOption } from "@/components/admin/EnquiriesInbox";
import type { Enquiry } from "@/types/database";

export const metadata: Metadata = {
  title: "Enquiries & Admissions Inbox",
};

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();

  const [enquiriesRes, batchesRes] = await Promise.all([
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("class_sessions")
      .select("id, batch_code, title, course_id, start_date")
      .order("start_date", { ascending: true }),
  ]);

  const enquiries: Enquiry[] = (enquiriesRes.data || []) as Enquiry[];
  const availableBatches: BatchOption[] = (batchesRes.data || []) as BatchOption[];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Admissions Pipeline
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Course & Atelier Enquiries
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Review prospective student leads, reply instantly on WhatsApp, take private notes, and convert directly into enrolled batch participants.
        </p>
      </div>

      <EnquiriesInbox
        initialEnquiries={enquiries}
        availableBatches={availableBatches}
      />
    </div>
  );
}
