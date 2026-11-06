import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CourseForm from "@/components/forms/CourseForm";
import type { Course } from "@/types/database";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Course",
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Catalog Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Edit Course: {course.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Update course fees, duration, syllabus descriptions, or cover image.
        </p>
      </div>

      <div className="bg-surface rounded-sm border border-charcoal/15 p-6 sm:p-8 shadow-sm">
        <CourseForm initialCourse={course as Course} />
      </div>
    </div>
  );
}
