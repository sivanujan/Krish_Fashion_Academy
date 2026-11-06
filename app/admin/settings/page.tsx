import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import type { SiteSettings } from "@/types/database";

export const metadata: Metadata = {
  title: "Site Settings",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  const settings: SiteSettings | null = data;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Global Configuration
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Academy & Website Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Update floating WhatsApp number, contact info, social accounts, and animated counter statistics.
        </p>
      </div>

      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}
