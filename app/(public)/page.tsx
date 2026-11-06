import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/sections/Hero";
import UpcomingMasterClass from "@/components/sections/UpcomingMasterClass";
import WhatYoullLearn from "@/components/sections/WhatYoullLearn";
import WhoItsFor from "@/components/sections/WhoItsFor";
import ChooseFormat from "@/components/sections/ChooseFormat";
import Marquee from "@/components/animations/Marquee";
import GalleryPreview from "@/components/sections/GalleryPreview";
import TestimonialsSlider, { type UnifiedTestimonial } from "@/components/sections/TestimonialsSlider";
import HowToRegister from "@/components/sections/HowToRegister";
import FaqSection from "@/components/sections/FaqSection";
import LocationSection from "@/components/sections/LocationSection";
import type { PublicSession, GalleryItem, FAQ, SiteSettings } from "@/types/database";

export const revalidate = 60; // ISR revalidation 60s

export default async function HomePage() {
  let upcomingSession: PublicSession | null = null;
  let galleryItems: GalleryItem[] = [];
  let testimonials: UnifiedTestimonial[] = [];
  let faqs: FAQ[] = [];
  let settings: SiteSettings | null = null;

  try {
    const supabase = await createClient();

    const [
      sessionRes,
      galleryRes,
      testimonialsViewRes,
      testimonialsTableRes,
      faqsRes,
      settingsRes,
    ] = await Promise.all([
      // 1. Next upcoming published session
      supabase
        .from("public_sessions")
        .select("*")
        .eq("is_published", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle(),

      // 2. Real gallery items
      supabase
        .from("gallery_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .limit(8),

      // 3. Public testimonials view (from approved feedback only)
      supabase
        .from("public_testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),

      // 4. Testimonials fallback (only real published rows from admin)
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(6),

      // 5. FAQs
      supabase
        .from("faqs")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),

      // 6. Site settings
      supabase
        .from("site_settings")
        .select("*")
        .single(),
    ]);

    upcomingSession = sessionRes.data;
    galleryItems = galleryRes.data || [];
    faqs = faqsRes.data || [];
    settings = settingsRes.data;

    // Map testimonials from real approved feedback only
    if (testimonialsViewRes.data && testimonialsViewRes.data.length > 0) {
      testimonials = testimonialsViewRes.data.map((t) => ({
        id: t.id,
        name: t.student_name,
        message: t.message,
        rating: t.rating_overall,
        batch_title: t.batch_title,
      }));
    } else if (testimonialsTableRes.data && testimonialsTableRes.data.length > 0) {
      testimonials = testimonialsTableRes.data.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        message: t.message,
        rating: t.rating,
      }));
    }
  } catch (err) {
    console.error("Home page data fetch error:", err);
  }

  // NOTE: If no real approved feedback exists, testimonials stays [] and section is completely hidden.
  // Sample testimonials are never injected into the public view.

  // Sample upcoming session fallback if remote database table is unmigrated
  if (!upcomingSession) {
    const now = new Date();
    const d1 = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    const day1 = (7 - d1.getDay()) % 7;
    d1.setDate(d1.getDate() + day1);
    const d2 = new Date(d1);
    d2.setDate(d1.getDate() + 7);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const startStr = `${d1.getFullYear()}-${pad(d1.getMonth() + 1)}-${pad(d1.getDate())}`;
    const secondStr = `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}`;

    upcomingSession = {
      id: "sample-upcoming-session",
      course_id: "a1111111-1111-1111-1111-111111111111",
      batch_code: "SBM-2026-11",
      title: "2-Day Saree Blouse Master Class",
      start_date: startStr,
      second_date: secondStr,
      class_dates: [startStr, secondStr],
      start_time: "11:00:00",
      end_time: "16:00:00",
      location: "Middlefield Rd & McNicoll Ave, Scarborough, ON",
      mode: "both",
      price_cad: 350,
      discount_percent: 30,
      discount_label: "30% OFF",
      seats_total: 12,
      seats_left: 4,
      status: "upcoming",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course_title: "2-Day Saree Blouse Master Class",
      course_slug: "saree-blouse-master-class",
    };
  }

  let phone = settings?.phone || "+1 647-501-9569";
  let whatsappNumber = settings?.whatsapp_number || "16475019569";
  let address = settings?.address || "Middlefield Rd & McNicoll Ave, Scarborough, ON";

  if (phone.includes("+94") || phone.includes("771234567")) {
    phone = "+1 647-501-9569";
  }
  if (whatsappNumber.startsWith("94") || whatsappNumber.includes("771234567")) {
    whatsappNumber = "16475019569";
  }
  if (address.toLowerCase().includes("sri lanka") || address.toLowerCase().includes("colombo")) {
    address = "Middlefield Rd & McNicoll Ave, Scarborough, ON";
  }
  let mapEmbedUrl =
    settings?.map_embed_url ||
    "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca";

  // Force clean Middlefield & McNicoll embed without default info popup
  if (mapEmbedUrl.includes("Colombo") || mapEmbedUrl.includes("!2slk") || !mapEmbedUrl.includes("Middlefield") || mapEmbedUrl.includes("!3m3!1m2")) {
    mapEmbedUrl =
      "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca";
  }

  return (
    <>
      {/* 3.1 Hero (Keep stitch animation) - Dark */}
      <Hero whatsappNumber={whatsappNumber} />

      {/* 3.2 Upcoming Master Class (data from class_sessions) - Dark-2 */}
      <UpcomingMasterClass session={upcomingSession} whatsappNumber={whatsappNumber} />

      {/* 3.3 What you'll learn – "From measurement to finished blouse" - Dark */}
      <WhatYoullLearn />

      {/* Gold stitch divider transition to Light section */}
      <div className="gold-stitch-divider" aria-hidden="true" />

      {/* 3.4 Who it's for - Light */}
      <WhoItsFor />

      {/* Gold stitch divider transition to Dark section */}
      <div className="gold-stitch-divider" aria-hidden="true" />

      {/* 3.5 Choose your format - Dark */}
      <ChooseFormat whatsappNumber={whatsappNumber} />

      {/* 3.6 Marquee strip */}
      <Marquee />

      {/* 3.7 Gallery – "Made in our classes" (hide if empty) */}
      <GalleryPreview items={galleryItems} />

      {/* 3.8 Testimonials (hide if empty) - Light */}
      {testimonials.length > 0 && (
        <>
          <div className="gold-stitch-divider" aria-hidden="true" />
          <TestimonialsSlider testimonials={testimonials} />
          <div className="gold-stitch-divider" aria-hidden="true" />
        </>
      )}

      {/* 3.9 How to register – 3 steps - Dark */}
      <HowToRegister phone={phone} whatsappNumber={whatsappNumber} />

      {/* Gold stitch divider transition to Light section */}
      <div className="gold-stitch-divider" aria-hidden="true" />

      {/* 3.10 FAQ (accordion, smooth height animation, FAQPage JSON-LD) - Light */}
      <FaqSection faqs={faqs} />

      {/* Gold stitch divider transition to Dark section */}
      <div className="gold-stitch-divider" aria-hidden="true" />

      {/* 3.11 Location (Google Maps embed + directions) - Dark */}
      <LocationSection
        address={address}
        phone={phone}
        whatsappNumber={whatsappNumber}
        mapEmbedUrl={mapEmbedUrl}
      />
    </>
  );
}
