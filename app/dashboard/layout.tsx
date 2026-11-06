import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <div className="flex min-h-screen bg-subtle text-heading">
      <div className="hidden md:block shrink-0">
        <DashboardSidebar userName={userName} userRole={profile?.role} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <div className="md:hidden bg-charcoal-darkest text-off-white p-4 border-b border-charcoal/60 flex items-center justify-between">
          <span className="font-serif text-lg text-gold-light">KFA Classroom</span>
          <span className="text-xs text-off-white/70">{userName}</span>
        </div>

        <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
