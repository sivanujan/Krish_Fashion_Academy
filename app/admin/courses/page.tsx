import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CoursesTable from "@/components/admin/CoursesTable";
import type { Course } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Courses",
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true });

  const courses: Course[] = data || [];

  return (
    <div className="space-y-6">
      <CoursesTable courses={courses} />
    </div>
  );
}
