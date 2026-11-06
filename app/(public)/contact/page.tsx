import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ContactSection from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact & Admissions",
  description:
    "Get in touch with Krish Fashion Academy. Inquire about course fees, class schedules, bespoke bridal tailoring, or visit our atelier in Canada.",
};

export default async function ContactPage() {
  let settings = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").single();
    settings = data;
  } catch (err) {
    console.error("Failed to fetch settings for contact page:", err);
  }

  return (
    <div className="pt-12 bg-off-white min-h-screen">
      <ContactSection settings={settings} />
    </div>
  );
}
