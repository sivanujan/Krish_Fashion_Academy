import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .single();
    settings = data;
  } catch (err) {
    // Graceful fallback to default values
    console.error("Failed to fetch site settings:", err);
  }

  let whatsappNumber = settings?.whatsapp_number || "16475019569";
  if (whatsappNumber.startsWith("94") || whatsappNumber.includes("771234567")) {
    whatsappNumber = "16475019569";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow pb-16 sm:pb-0">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp whatsappNumber={whatsappNumber} />
    </div>
  );
}
