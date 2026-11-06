import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import UpcomingMasterClass from "@/components/sections/UpcomingMasterClass";
import RevealText from "@/components/animations/RevealText";
import { formatCAD, formatBatchDates, formatTime, getWhatsAppUrl } from "@/lib/utils";
import type { PublicSession } from "@/types/database";
import { Calendar, Clock, MapPin, Users, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Upcoming Batches & Classes in Scarborough | Krish Fashion Academy",
  description:
    "Explore upcoming 2-Day Saree Blouse Master Class batches in Scarborough, Toronto. In-person and online cohorts available. Reserve your seat on WhatsApp.",
};

export const revalidate = 60;

export default async function ClassesPage() {
  let sessions: PublicSession[] = [];
  let whatsappNumber = "16475019569";

  try {
    const supabase = await createClient();
    const [sessionsRes, settingsRes] = await Promise.all([
      supabase
        .from("public_sessions")
        .select("*")
        .eq("is_published", true)
        .order("start_date", { ascending: true }),
      supabase.from("site_settings").select("whatsapp_number").single(),
    ]);

    sessions = (sessionsRes.data || []) as PublicSession[];
    if (settingsRes.data?.whatsapp_number) {
      whatsappNumber = settingsRes.data.whatsapp_number;
    }
  } catch (err) {
    console.error("Classes page fetch error:", err);
  }

  // Fallback if DB empty
  if (sessions.length === 0) {
    sessions = [
      {
        id: "sample-1",
        course_id: "a1111111-1111-1111-1111-111111111111",
        batch_code: "SBM-2026-11",
        title: "2-Day Saree Blouse Master Class",
        start_date: "2026-11-22",
        second_date: "2026-11-29",
        class_dates: ["2026-11-22", "2026-11-29"],
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
      },
    ];
  }

  const nextSession = sessions[0];

  return (
    <div className="pt-28 pb-24 bg-off-white min-h-screen">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-gold-dark mb-2">
            <Sparkles className="w-4 h-4 text-gold-dark" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Scarborough &amp; Live Online
            </span>
          </div>
          <RevealText
            tag="h1"
            className="font-serif text-4xl sm:text-6xl font-light text-charcoal-darkest tracking-tight"
          >
            Upcoming Master Class Batches
          </RevealText>
          <p className="mt-4 text-xs sm:text-base text-charcoal-light font-light leading-relaxed">
            All classes are beginner-friendly with small, hands-on batches. You learn measurements, paper patterns, cutting, and stitching—finishing your own blouse in just 2 days.
          </p>
        </div>
      </div>

      {/* Featured Next Upcoming Batch Card */}
      {nextSession && (
        <div className="mb-20">
          <UpcomingMasterClass session={nextSession} whatsappNumber={whatsappNumber} />
        </div>
      )}

      {/* All Upcoming Cohorts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-darkest mb-8 border-b border-charcoal/10 pb-4">
          All Scheduled Cohorts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const formattedDates = formatBatchDates(s.class_dates, s.start_date, s.second_date);
            const timeRange = `${formatTime(s.start_time)} – ${formatTime(s.end_time)}`;
            const whatsappUrl = getWhatsAppUrl(
              whatsappNumber,
              `Hi! I'd like to register for ${s.title} (${formattedDates}).`
            );

            return (
              <Card
                key={s.id}
                className="bg-surface border-charcoal/15 flex flex-col justify-between group p-6 sm:p-7 shadow-sm hover:border-gold hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gold-dark bg-gold/10 px-2.5 py-1 rounded-sm">
                      {s.batch_code}
                    </span>
                    {s.discount_label && (
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        {s.discount_label}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-charcoal-darkest group-hover:text-gold-dark transition-colors leading-snug">
                    <Link href={`/classes/${s.batch_code}`}>{s.title}</Link>
                  </h3>

                  <div className="mt-4 space-y-2.5 text-xs text-charcoal">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gold-dark shrink-0" />
                      <span className="font-medium">{formattedDates}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gold-dark shrink-0" />
                      <span>{timeRange}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gold-dark shrink-0" />
                      <span className="line-clamp-1">{s.location}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-charcoal/10">
                      <Users className="w-4 h-4 text-gold-dark shrink-0" />
                      <span>
                        Seats: <strong>{s.seats_left}</strong> left / {s.seats_total} total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-charcoal-light">
                      Tuition
                    </span>
                    <span className="font-serif text-lg font-bold text-gold-dark tabular-nums lining-nums">
                      {s.price_cad ? formatCAD(s.price_cad) : "Contact us for fees"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/classes/${s.batch_code}`}
                      className="inline-flex items-center space-x-1 text-xs uppercase tracking-wider text-charcoal hover:text-gold font-semibold px-3 py-2"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-gold text-charcoal-darkest px-3.5 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-gold-light transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Register</span>
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
