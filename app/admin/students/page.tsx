import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import StudentsManager from "@/components/admin/StudentsManager";
import type { Profile, Recording, RecordingAccess } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Students",
};

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const [studentsRes, recordingsRes, accessRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false }),
    supabase
      .from("recordings")
      .select("id, title, class_date, source_type, is_published")
      .order("created_at", { ascending: false }),
    supabase.from("recording_access").select("*"),
  ]);

  const students: Profile[] = studentsRes.data || [];
  const recordings: Recording[] = (recordingsRes.data as unknown as Recording[]) || [];
  const accessList: RecordingAccess[] = accessRes.data || [];

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
          Provision student credentials, assign temporary passwords, and control portal and video recording access.
        </p>
      </div>

      <StudentsManager
        initialStudents={students}
        initialRecordings={recordings}
        initialAccessList={accessList}
      />
    </div>
  );
}
