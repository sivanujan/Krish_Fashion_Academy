import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import type { Testimonial } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Testimonials",
};

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  const testimonials: Testimonial[] = data || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Social Proof
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Testimonials & Reviews
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Manage student success stories and boutique owner recommendations.
        </p>
      </div>

      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}
