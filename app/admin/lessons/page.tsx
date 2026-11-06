import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LessonsManager from "@/components/admin/LessonsManager";
import type { Course, Lesson } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Course Lessons",
};

export default async function AdminLessonsPage() {
  const supabase = await createClient();

  const [coursesRes, lessonsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const courses: Course[] = coursesRes.data || [];
  const lessons: Lesson[] = lessonsRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Syllabus Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Class Lessons & Syllabus Records
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Structure weekly lectures, practical exercise descriptions, and manage video references.
        </p>
      </div>

      <LessonsManager courses={courses} initialLessons={lessons} />
    </div>
  );
}
