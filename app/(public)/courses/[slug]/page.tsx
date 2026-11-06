import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCAD, getWhatsAppUrl } from "@/lib/utils";
import ContactEnquiryForm from "@/components/forms/ContactEnquiryForm";
import type { Course } from "@/types/database";
import { Clock, CheckCircle2, MessageCircle, Calendar, Award, ArrowLeft } from "lucide-react";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: course.title,
    description: course.short_description,
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [courseRes, settingsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    supabase.from("site_settings").select("*").single(),
  ]);

  const course: Course | null = courseRes.data;
  const settings = settingsRes.data;

  if (!course) {
    notFound();
  }

  const whatsappNumber = settings?.whatsapp_number || "+94771234567";
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    `Hello Krish Fashion Academy, I would like to enquire about joining the "${course.title}" course.`
  );

  return (
    <div className="pt-28 pb-24 bg-off-white min-h-screen text-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back */}
        <Link
          href="/courses"
          className="inline-flex items-center text-xs uppercase tracking-widest text-charcoal-light hover:text-gold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to All Courses</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Course Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header */}
            <div>
              <div className="inline-flex items-center space-x-2 text-gold-dark text-xs uppercase tracking-[0.25em] font-medium mb-3">
                <span>Accredited Masterclass</span>
                <span>✦</span>
                <span>Main Campus</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-light text-charcoal-darkest leading-tight">
                {course.title}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-charcoal-light font-light leading-relaxed">
                {course.short_description}
              </p>
            </div>

            {/* Cover Image */}
            {course.cover_image_url && (
              <div className="relative aspect-[16/9] rounded-sm overflow-hidden border border-gold/30 shadow-lg">
                <Image
                  src={course.cover_image_url}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Course Description */}
            <div className="bg-surface p-8 sm:p-10 rounded-sm border border-charcoal/10 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-charcoal-darkest">
                Curriculum Overview
              </h2>
              <div className="prose text-charcoal-light leading-relaxed text-sm sm:text-base space-y-4">
                <p className="whitespace-pre-line">{course.description}</p>
              </div>

              {/* What You Will Master */}
              <div className="pt-8 border-t border-charcoal/10">
                <h3 className="font-serif text-xl text-charcoal-darkest mb-4">
                  What You Will Master
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-charcoal">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Precise anatomical measurement & zero-gap fitting</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Industrial sewing machine operation & needle tensioning</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Dart manipulation & French curve pattern drafting</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Heirloom luxury lining and seam concealment</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Direct one-on-one master tailor guidance</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Academy certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Enquiry Form Embedded */}
            <div className="bg-surface p-8 rounded-sm border border-charcoal/10 shadow-sm">
              <h3 className="font-serif text-2xl text-charcoal-darkest mb-2">
                Enquire About This Course
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-light mb-6">
                Receive the complete syllabus brochure and next batch intake dates.
              </p>
              <ContactEnquiryForm initialCourse={course.title} />
            </div>
          </div>

          {/* Sticky Enrollment Card Sidebar */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-charcoal-darkest text-off-white p-8 rounded-sm border border-gold/40 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-light block">
                  Tuition Investment
                </span>
                <p className="font-serif text-3xl sm:text-4xl text-gold font-normal mt-1">
                  {formatCAD(course.fee_cad)}
                </p>
                <span className="text-[11px] text-off-white/60">
                  Includes drafting papers, practice muslin & toolkit
                </span>
              </div>

              <div className="space-y-4 border-y border-charcoal-light/30 py-6 text-xs tracking-wider">
                <div className="flex items-center space-x-3 text-off-white/90">
                  <Clock className="w-4 h-4 text-gold shrink-0" />
                  <span>
                    <strong>Duration:</strong> {course.duration}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-off-white/90">
                  <Calendar className="w-4 h-4 text-gold shrink-0" />
                  <span>
                    <strong>Schedules:</strong> Weekday & Weekend Batches
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-off-white/90">
                  <Award className="w-4 h-4 text-gold shrink-0" />
                  <span>
                    <strong>Credential:</strong> KFA Professional Certificate
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-sm uppercase tracking-widest text-xs font-semibold shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire / Join via WhatsApp</span>
              </a>

              <p className="text-center text-[10px] text-off-white/50 tracking-wider">
                Instant reply from our Admissions Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
