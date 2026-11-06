import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EnrollmentsManager from "@/components/admin/EnrollmentsManager";
import type { Profile, Course } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Enrollments",
};

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase
      .from("courses")
      .select("*")
      .order("title", { ascending: true }),
    supabase
      .from("enrollments")
      .select(`
        id,
        status,
        expires_at,
        created_at,
        profiles (
          id,
          full_name,
          phone
        ),
        courses (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false }),
  ]);

  const students: Profile[] = studentsRes.data || [];
  const courses: Course[] = coursesRes.data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEnrollments = (enrollmentsRes.data || []) as any[];
  const enrollments = rawEnrollments.map((enr) => ({
    id: enr.id,
    status: enr.status,
    expires_at: enr.expires_at,
    created_at: enr.created_at,
    profiles: Array.isArray(enr.profiles) ? enr.profiles[0] : enr.profiles,
    courses: Array.isArray(enr.courses) ? enr.courses[0] : enr.courses,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Access Control
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Student Course Enrollments
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Assign students to specific batches, track validity dates, and grant classroom access.
        </p>
      </div>

      <EnrollmentsManager
        students={students}
        courses={courses}
        initialEnrollments={enrollments}
      />
    </div>
  );
}
