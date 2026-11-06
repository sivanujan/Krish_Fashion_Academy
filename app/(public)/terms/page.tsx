import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Krish Fashion Academy",
  description: "Terms of service and registration policies for Krish Fashion Academy in Scarborough, Toronto.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-dark text-text-on-dark pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-xs uppercase tracking-widest text-gold-light hover:text-gold mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          <span>Back to Home</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-5xl font-light text-text-on-dark mb-4">
          Terms of Service
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-on-dark mb-10">
          Last Updated: November 2026 · Krish Fashion Academy (Scarborough, ON)
        </p>

        <div className="space-y-6 text-sm text-muted-on-dark font-light leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">1. Class Enrollment &amp; Attendance</h2>
            <p>
              Class seats are reserved upon confirmation via our admissions team. Because cohorts maintain small, hands-on batch sizes, please notify us in advance if you need to reschedule your attendance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">2. Studio Etiquette &amp; Safety</h2>
            <p>
              For in-person classes at Middlefield &amp; McNicoll in Scarborough, students are guided on the safe and proper operation of sewing machines and cutting tools. Please follow all instructor guidance during practical sessions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">3. Intellectual Property</h2>
            <p>
              Course paper pattern techniques, calculations slopers, and portal recordings provided to students are for personal learning and individual tailoring practice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">4. Inquiries</h2>
            <p>
              For assistance, connect with our team on WhatsApp at +1 647-501-9569.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

