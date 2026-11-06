import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicFeedbackForm from "@/components/feedback/PublicFeedbackForm";
import { formatBatchDates } from "@/lib/utils";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit Master Class Feedback | Krish Fashion Academy",
  robots: {
    index: false,
    follow: false,
  },
};

interface PublicFeedbackPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicFeedbackPage({ params }: PublicFeedbackPageProps) {
  const { token } = await params;
  const adminClient = createAdminClient();

  const { data: batch } = await adminClient
    .from("class_sessions")
    .select("id, title, batch_code, start_date, second_date, class_dates, feedback_open")
    .eq("feedback_token", token)
    .single();

  const isClosed = !batch || !batch.feedback_open;

  const formattedDates = batch
    ? formatBatchDates(batch.class_dates, batch.start_date, batch.second_date)
    : "";

  return (
    <div className="min-h-screen bg-off-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Brand Top Header */}
      <div className="max-w-2xl mx-auto w-full text-center mb-8">
        <Link href="/" className="inline-block">
          <div className="relative w-48 h-12 mx-auto">
            <Image
              src="/brand/KFA_logo_horizontal.png"
              alt="Krish Fashion Academy"
              width={192}
              height={48}
              priority
              className="object-contain"
            />
          </div>
        </Link>
        <span className="block text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium mt-2">
          Scarborough Atelier · Participant Voice
        </span>
      </div>

      {/* Main Feedback Form or Closed State */}
      <div className="max-w-2xl mx-auto w-full flex-1">
        {isClosed ? (
          <div className="bg-surface rounded-sm border border-charcoal/15 p-10 sm:p-14 text-center shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-full bg-charcoal/5 border border-charcoal/20 flex items-center justify-center text-charcoal-light mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <h1 className="font-serif text-3xl text-charcoal-darkest">
              Feedback for this batch is closed
            </h1>

            <p className="text-xs sm:text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
              The submission window for this cohort has concluded. If you have questions or would like to share feedback directly, please message Krish on WhatsApp at +1 647-501-9569.
            </p>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center text-xs uppercase tracking-widest text-gold-dark hover:text-gold font-semibold"
              >
                Visit Academy Home
              </Link>
            </div>
          </div>
        ) : (
          <PublicFeedbackForm
            token={token}
            batchTitle={batch.title}
            batchDates={formattedDates}
          />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto w-full text-center mt-12 text-[11px] text-charcoal-light">
        <p>© {new Date().getFullYear()} Krish Fashion Academy · Scarborough, Toronto, ON, Canada</p>
      </div>
    </div>
  );
}
