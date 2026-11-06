"use client";

import { useState } from "react";
import RevealText from "@/components/animations/RevealText";
import type { FAQ } from "@/types/database";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FaqSectionProps {
  faqs?: FAQ[];
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "Do I need any sewing experience?",
    answer: "No, this master class is designed specially for complete beginners. We start from machine basics and guide you through every cut and seam.",
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "What will I make?",
    answer: "A complete, perfectly contoured 3-dart saree blouse that you finish stitching yourself in 2 days.",
    is_published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "Where is the class?",
    answer: "In-person classes are held at Middlefield Rd & McNicoll Ave, Scarborough, ON. A live online option is also available with class recordings accessible in your student portal.",
    is_published: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "What are the class times?",
    answer: "11:00 AM – 4:00 PM on both days (usually two Sundays a week apart). Check our upcoming master class section for the exact dates of the next intake.",
    is_published: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "How do I register?",
    answer: "Send a WhatsApp message directly to +1 647-501-9569 with your name and preferred format (in-person or online) to reserve your seat.",
    is_published: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
];

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Render this FAQ only when a verified answer exists (filter out unconfirmed TODO answers)
  const sourceFaqs = (faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS).filter(
    (f) => f.is_published && f.answer && !f.answer.toUpperCase().includes("TODO")
  );

  if (sourceFaqs.length === 0) return null;

  // FAQPage JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sourceFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-bg-light text-text-on-light relative scroll-mt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-text-light mb-2">
            <Sparkles className="w-4 h-4 text-gold-text-light" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Common Inquiries
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-light tracking-tight leading-tight"
          >
            Frequently Asked Questions
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-light font-light max-w-[62ch] mx-auto text-pretty">
            Everything you need to know before attending your first saree blouse master class.
          </p>
        </div>

        {/* Accordion List - White items on Cream with smooth height */}
        <div className="space-y-3.5">
          {sourceFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-sm border border-border-light overflow-hidden transition-all duration-300 shadow-sm hover:border-gold/50"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between space-x-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <HelpCircle className="w-4 h-4 text-gold-text-light shrink-0" />
                    <span className="font-serif text-lg sm:text-xl text-text-on-light font-medium leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-full bg-bg-light flex items-center justify-center text-text-on-light shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-gold text-bg-dark" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <div
                  id={`faq-answer-${idx}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-muted-on-light font-light leading-relaxed border-t border-border-light/60 pt-3.5">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
