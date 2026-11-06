import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import StudentsManager from "@/components/admin/StudentsManager";
import type { Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Students",
};

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const students: Profile[] = data || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Student Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Student Directory & Accounts
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Provision student credentials, assign temporary passwords, and control portal access.
        </p>
      </div>

      <StudentsManager initialStudents={students} />
    </div>
  );
}
