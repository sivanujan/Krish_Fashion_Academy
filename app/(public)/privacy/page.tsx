import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Krish Fashion Academy",
  description: "Privacy policy and data protection standards for Krish Fashion Academy in Scarborough, Toronto.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-on-dark mb-10">
          Last Updated: November 2026 · Krish Fashion Academy (Scarborough, ON)
        </p>

        <div className="space-y-6 text-sm text-muted-on-dark font-light leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">1. Information We Collect</h2>
            <p>
              When you register for a class or contact us via WhatsApp or our inquiry forms, we collect basic details such as your name, phone number, and format preference (in-person or online) to manage admissions and class scheduling.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">2. How We Use Your Information</h2>
            <p>
              Your contact details are used strictly to coordinate your class schedule, confirm attendance, share class preparations, and provide portal access. We do not sell or share your personal information with third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">3. Feedback &amp; Student Work</h2>
            <p>
              Student feedback and photographs of finished garments are only shared or displayed with explicit prior consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-text-on-dark">4. Contact Us</h2>
            <p>
              For any questions regarding your data, contact Krish Fashion Academy directly at +1 647-501-9569 or visit us at Middlefield Rd &amp; McNicoll Ave, Scarborough, ON.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

