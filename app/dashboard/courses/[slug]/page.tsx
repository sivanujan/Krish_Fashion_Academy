import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Course, Lesson } from "@/types/database";
import {
  ArrowLeft,
  Calendar,
  PlayCircle,
  FileText,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";

interface DashboardCourseProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DashboardCourseProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: course ? `Classroom: ${course.title}` : "Classroom",
  };
}

export default async function DashboardCourseLessonsPage({
  params,
}: DashboardCourseProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) {
    notFound();
  }

  // Verify enrollment (RLS enforces this on database, but let's check for UX message)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status, expires_at")
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .single();

  // If user is not admin and not actively enrolled
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin && (!enrollment || enrollment.status !== "active")) {
    return (
      <div className="bg-surface border border-rose-200 rounded-sm p-10 text-center max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-serif text-2xl text-rose-950 font-medium">
          Access Restricted
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-charcoal-light leading-relaxed">
          You do not have an active enrollment for &quot;{course.title}&quot;. Please contact administration to verify your enrollment.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-gold-dark hover:underline font-medium"
          >
            ← Return to My Courses
          </Link>
        </div>
      </div>
    );
  }

  // Fetch lessons for this course
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const lessons: Lesson[] = lessonsData || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs uppercase tracking-widest text-charcoal-light hover:text-gold mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to My Courses</span>
        </Link>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Active Classroom Session
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          {course.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light max-w-3xl">
          {course.short_description}
        </p>
      </div>

      {/* Video Player Architecture Placeholder (Ready for Phase 2) */}
      <div className="relative aspect-[16/9] w-full bg-charcoal-darkest rounded-sm border border-gold/30 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle decorative atelier watermark */}
        <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-[10px] uppercase tracking-widest text-gold-light/60">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>KFA Studio Stream</span>
        </div>

        <div className="relative z-10 max-w-md flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gold/50 bg-charcoal-darker flex items-center justify-center text-gold mb-4 shadow-[0_0_24px_rgba(201,162,74,0.25)]">
            <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.2]" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-off-white font-light">
            Class Recording Coming Soon
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-off-white/70 font-light leading-relaxed">
            High-definition atelier camera recordings and step-by-step drafting video walkthroughs will be streamed directly in this secure player during Phase 2.
          </p>

          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-gold/15 text-gold-light border border-gold/30 rounded-full">
            In-Person & Live Attendance Active
          </span>
        </div>
      </div>

      {/* Course Lessons & Class Schedule */}
      <div className="bg-surface rounded-sm border border-charcoal/15 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-charcoal-darkest">
              Course Syllabus & Class Log
            </h2>
            <p className="text-xs text-charcoal-light mt-0.5">
              Review syllabus topics, practical exercises, and class dates.
            </p>
          </div>
          <span className="text-xs uppercase tracking-wider text-charcoal-light bg-charcoal/5 px-3 py-1 rounded-sm">
            {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-10 text-xs sm:text-sm text-charcoal-light">
            No published lessons found for this course yet. Lessons are published as your cohort progresses.
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="p-5 border border-charcoal/10 rounded-sm hover:border-gold/50 bg-subtle/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <span className="w-7 h-7 rounded-full bg-gold/15 text-gold-dark font-serif text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {lesson.sort_order || idx + 1}
                    </span>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl text-charcoal-darkest font-medium">
                        {lesson.title}
                      </h4>
                      {lesson.class_date && (
                        <div className="flex items-center space-x-1.5 text-xs text-charcoal-light mt-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                          <span>Class Date: {formatDate(lesson.class_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider text-gold-dark">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Curriculum Module</span>
                  </div>
                </div>

                {lesson.description && (
                  <p className="mt-3 text-xs sm:text-sm text-charcoal-light leading-relaxed pl-10 border-t border-charcoal/5 pt-2">
                    {lesson.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
