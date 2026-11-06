import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ServicesManager from "@/components/admin/ServicesManager";
import type { Service } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Services",
};

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  const services: Service[] = data || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Atelier Capabilities
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Services Management
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Configure custom tailoring, bridal blouses, and alterations shown on public pages.
        </p>
      </div>

      <ServicesManager initialServices={services} />
    </div>
  );
}
