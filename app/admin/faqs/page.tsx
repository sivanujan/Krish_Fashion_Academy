import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import FaqsManagerClient from "@/components/admin/FaqsManagerClient";
import type { FAQ } from "@/types/database";

export const metadata: Metadata = {
  title: "FAQs Management",
};

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  // Default fallback if database table not yet populated
  const defaultFaqs: FAQ[] = [
    {
      id: "faq-1",
      question: "Do I need any sewing experience?",
      answer: "No, this master class is designed specifically for complete beginners with zero previous experience.",
      sort_order: 1,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-2",
      question: "What will I make during the 2-day class?",
      answer: "You will make and complete a 3-dart saree blouse tailored to your own body measurements that you finish stitching in class.",
      sort_order: 2,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-3",
      question: "Where is the class held?",
      answer: "At our studio near Middlefield Rd & McNicoll Ave in Scarborough, Toronto, ON. A live online option with portal recordings is also available.",
      sort_order: 3,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-4",
      question: "What are the class timings?",
      answer: "11:00 AM – 4:00 PM on both scheduled days. Check the upcoming master class section for exact calendar dates.",
      sort_order: 4,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-5",
      question: "How do I register?",
      answer: "Send a WhatsApp message to +1 647-501-9569 or fill out the enquiry form on our site to confirm your seat and preferred format.",
      sort_order: 5,
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-6",
      question: "Do I need my own sewing machine?",
      answer: "TODO: confirm with client (whether studio machines are provided for all in-person students, or if students bring their own machine).",
      sort_order: 6,
      is_published: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "faq-7",
      question: "What should I bring to class?",
      answer: "TODO: confirm with client (fabric, lining, threads, measuring tape, notebook).",
      sort_order: 7,
      is_published: false,
      created_at: new Date().toISOString(),
    },
  ];

  const faqs: FAQ[] = (data && data.length > 0) ? (data as FAQ[]) : defaultFaqs;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Content Administration
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          FAQ &amp; Knowledge Base
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Manage questions and answers displayed on the public home page. Pending items marked with TODO are hidden until verified.
        </p>
      </div>

      <FaqsManagerClient initialFaqs={faqs} />
    </div>
  );
}
