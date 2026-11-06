import { Metadata } from "next";
import CourseForm from "@/components/forms/CourseForm";

export const metadata: Metadata = {
  title: "Add New Course",
};

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Catalog Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Create New Masterclass
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Set up titles, syllabus overview, pricing in LKR, and upload cover image.
        </p>
      </div>

      <div className="bg-surface rounded-sm border border-charcoal/15 p-6 sm:p-8 shadow-sm">
        <CourseForm />
      </div>
    </div>
  );
}
