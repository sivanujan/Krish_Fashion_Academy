import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContactEnquiryForm from "@/components/forms/ContactEnquiryForm";
import FaqSection from "@/components/sections/FaqSection";
import LocationSection from "@/components/sections/LocationSection";
import RevealText from "@/components/animations/RevealText";
import { formatCAD, formatBatchDates, formatTime, getWhatsAppUrl } from "@/lib/utils";
import type { PublicSession, Course, FAQ, SiteSettings } from "@/types/database";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 60;

interface BatchPageProps {
  params: Promise<{ batch_code: string }>;
}

export async function generateMetadata({ params }: BatchPageProps): Promise<Metadata> {
  const { batch_code } = await params;
  return {
    title: `Batch ${batch_code} - 2-Day Saree Blouse Master Class | Krish Fashion Academy`,
    description: `Enroll in Batch ${batch_code} of our 2-Day Saree Blouse Master Class in Scarborough, Toronto. Beginner-friendly tailoring, calculations, paper patterns, and stitching.`,
  };
}

export default async function BatchPublicDetailPage({ params }: BatchPageProps) {
  const { batch_code } = await params;
  const supabase = await createClient();

  const [sessionRes, faqsRes, settingsRes] = await Promise.all([
    supabase
      .from("public_sessions")
      .select("*")
      .eq("batch_code", batch_code)
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("*").single(),
  ]);

  let session = sessionRes.data as PublicSession | null;

  // Fallback sample batch if database not yet migrated
  if (!session && (batch_code.startsWith("SBM-") || batch_code === "saree-blouse-master-class")) {
    session = {
      id: "sample-batch",
      course_id: "a1111111-1111-1111-1111-111111111111",
      batch_code: batch_code,
      title: "2-Day Saree Blouse Master Class",
      start_date: "2026-11-22",
      second_date: "2026-11-29",
      class_dates: ["2026-11-22", "2026-11-29"],
      start_time: "11:00:00",
      end_time: "16:00:00",
      location: "Middlefield Rd & McNicoll Ave, Scarborough, ON",
      mode: "both",
      price_cad: 350,
      discount_percent: 30,
      discount_label: "30% OFF",
      seats_total: 12,
      seats_left: 4,
      status: "upcoming",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course_title: "2-Day Saree Blouse Master Class",
      course_slug: "saree-blouse-master-class",
    };
  }

  if (!session) notFound();

  const faqs = (faqsRes.data || []) as FAQ[];
  const settings = settingsRes.data as SiteSettings | null;

  const formattedDates = formatBatchDates(session.class_dates, session.start_date, session.second_date);
  const timeRange = `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`;
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp_number || "16475019569",
    `Hi! I'd like to register for ${session.title} (${formattedDates}).`
  );

  return (
    <div className="pt-28 bg-off-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-charcoal-darkest text-off-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="text-[11px] font-mono uppercase bg-gold/15 text-gold-light border border-gold/40 px-2.5 py-1 rounded-sm">
                Batch Code: {session.batch_code}
              </span>
              <span className="text-xs uppercase font-bold text-charcoal-darkest bg-gold px-2.5 py-1 rounded-sm">
                {session.mode === "both" ? "In-Person & Online" : session.mode}
              </span>
              {session.discount_label && (
                <span className="text-xs uppercase font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-sm">
                  {session.discount_label}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-off-white tracking-tight leading-tight">
              {session.title}
            </h1>

            <p className="mt-4 text-xs sm:text-base text-off-white/80 font-light leading-relaxed">
              Beginner-friendly 3-dart saree blouse masterclass in Scarborough, Toronto. Learn taking measurements, exact calculation formulas, paper sloper drafting, fabric cutting, and stitching. Finish your blouse in 2 days.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gold text-charcoal-darkest px-8 py-3.5 rounded-sm font-semibold tracking-wider uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_20px_rgba(201,162,74,0.35)]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Register on WhatsApp</span>
              </a>

              <a
                href="#enquiry-form"
                className="inline-flex items-center space-x-1.5 border border-gold/50 text-gold-light hover:bg-charcoal px-6 py-3.5 rounded-sm font-medium tracking-wider uppercase text-xs transition-colors"
              >
                <span>Ask a Question</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-12">
            {/* Batch Schedule Card */}
            <div className="bg-surface p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-charcoal-darkest border-b border-charcoal/10 pb-3">
                Class Schedule &amp; Format
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-charcoal">
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-light">
                    Class Dates
                  </span>
                  <div className="flex items-center space-x-2 font-medium text-heading text-sm">
                    <Calendar className="w-4 h-4 text-gold-dark shrink-0" />
                    <span>{formattedDates}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-light">Two sessions a week apart</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-light">
                    Class Hours
                  </span>
                  <div className="flex items-center space-x-2 font-medium text-heading text-sm">
                    <Clock className="w-4 h-4 text-gold-dark shrink-0" />
                    <span>{timeRange}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-light">5 hours hands-on per day</span>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-charcoal-light">
                    Studio Location
                  </span>
                  <div className="flex items-center space-x-2 font-medium text-heading text-sm">
                    <MapPin className="w-4 h-4 text-gold-dark shrink-0" />
                    <span>{session.location}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-light">
                    Scarborough, ON (Middlefield Rd &amp; McNicoll Ave)
                  </span>
                </div>
              </div>
            </div>

            {/* What You'll Learn in this Cohort */}
            <div className="bg-surface p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-charcoal-darkest border-b border-charcoal/10 pb-3">
                5-Step Hands-On Curriculum
              </h2>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Body Measurements", desc: "Taking accurate anatomical measurements with ease allowances for a contour fit." },
                  { step: "2", title: "Calculations", desc: "Formula derivation for bust apex, armhole depth, and zero-gap back necklines." },
                  { step: "3", title: "Paper Pattern", desc: "Drafting a complete 3-dart master paper sloper that can be graded to any size." },
                  { step: "4", title: "Cutting", desc: "Grainline placement, fabric pinning, and precise scissors cutting with seam allowances." },
                  { step: "5", title: "Stitching", desc: "Machine practice, dart pinching, piping, and assembling your finished blouse." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <span className="w-7 h-7 rounded-full bg-gold/15 border border-gold flex items-center justify-center font-serif text-gold-dark font-bold text-xs shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-serif text-base text-charcoal-darkest font-medium">
                        {item.title}
                      </h4>
                      <p className="text-xs text-charcoal-light mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <FaqSection faqs={faqs} />
          </div>

          {/* Right Column: Reservation & Enquiry */}
          <div className="lg:col-span-5 space-y-8 sticky top-28">
            {/* Pricing & Seat Status Card */}
            <div className="bg-surface p-8 rounded-sm border-2 border-gold/40 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-light font-medium block mb-1">
                  Tuition Fee (CAD $)
                </span>
                <div className="flex items-baseline space-x-3">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-dark tabular-nums lining-nums">
                    {session.price_cad ? formatCAD(session.price_cad) : "Contact us for fees"}
                  </span>
                  {session.price_cad && <span className="text-xs text-charcoal-light">CAD per student</span>}
                </div>
              </div>

              <div className="p-3.5 bg-subtle/80 rounded-sm border border-charcoal/10 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-charcoal">
                  <Users className="w-4 h-4 text-gold-dark" />
                  <span>
                    Seats Left: <strong className="text-heading">{session.seats_left}</strong> / {session.seats_total}
                  </span>
                </div>
                <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                  Intake Open
                </span>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center bg-gold text-charcoal-darkest px-6 py-4 rounded-sm font-semibold tracking-wider uppercase text-xs hover:bg-gold-light transition-all shadow-md text-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Reserve Seat via WhatsApp</span>
              </a>

              <div className="space-y-2 text-[11px] text-charcoal-light">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>No experience required · Machines provided in studio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>Online option includes portal recording access</span>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Form pre-selecting this batch */}
            <div id="enquiry-form" className="bg-surface p-8 rounded-sm border border-charcoal/15 shadow-sm space-y-4">
              <h3 className="font-serif text-xl text-charcoal-darkest border-b border-charcoal/10 pb-2">
                Have a Question about Batch {session.batch_code}?
              </h3>
              <p className="text-xs text-charcoal-light">
                Fill out the quick form below or message Krish on WhatsApp at +1 647-501-9569.
              </p>
              <ContactEnquiryForm
                initialCourse={session.title}
                initialBatchId={session.id}
                availableBatches={[{ id: session.id, batch_code: session.batch_code, title: session.title }]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <LocationSection />
    </div>
  );
}
