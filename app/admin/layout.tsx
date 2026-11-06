import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-subtle text-heading">
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header */}
        <div className="lg:hidden bg-charcoal-darkest text-off-white p-4 border-b border-charcoal/60 flex items-center justify-between">
          <span className="font-serif text-lg text-gold-light">KFA Admin</span>
          <span className="text-xs uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded-sm">
            Administrator
          </span>
        </div>

        <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
