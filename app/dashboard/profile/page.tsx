import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentProfileForm from "@/components/forms/StudentProfileForm";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Student Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Manage your personal information and sign-in credentials.
        </p>
      </div>

      <StudentProfileForm
        initialName={profile?.full_name || ""}
        initialPhone={profile?.phone || ""}
        email={user.email || ""}
      />
    </div>
  );
}
