"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { formatCAD, formatBatchDates, formatTime, getWhatsAppUrl } from "@/lib/utils";
import type { PublicSession } from "@/types/database";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Download,
  Users,
  Sparkles,
} from "lucide-react";

interface UpcomingMasterClassProps {
  session?: PublicSession | null;
  whatsappNumber?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDateStr: string, targetTimeStr: string = "11:00:00"): TimeRemaining {
  // Parse date and time in local time
  const [hours, minutes] = targetTimeStr.split(":").map(Number);
  const target = new Date(targetDateStr);
  target.setHours(hours || 11, minutes || 0, 0, 0);

  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const remainingMinutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours: remainingHours, minutes: remainingMinutes, seconds, isPast: false };
}

function generateIcsDataUrl(session: PublicSession): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const d = new Date(session.start_date);
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const startTimeStr = `${dateStr}T110000`;
  const endTimeStr = `${dateStr}T160000`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Krish Fashion Academy//Masterclass//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${session.title.replace(/,/g, "\\,")}`,
    `DESCRIPTION:Krish Fashion Academy - 2-Day Saree Blouse Master Class. Bring yourself and finish your blouse in 2 days!`,
    `LOCATION:${session.location.replace(/,/g, "\\,")}`,
    `DTSTART:${startTimeStr}`,
    `DTEND:${endTimeStr}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
}

export default function UpcomingMasterClass({
  session,
  whatsappNumber = "16475019569",
}: UpcomingMasterClassProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (!session?.start_date) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeRemaining(session.start_date, session.start_time));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session?.start_date, session?.start_time]);

  // Fallback state: No upcoming session published
  if (!session) {
    const notifyUrl = getWhatsAppUrl(
      whatsappNumber,
      "Hi Krish Fashion Academy! Please notify me when your next Saree Blouse Master Class batch opens in Scarborough."
    );

    return (
      <section id="courses" className="py-16 sm:py-24 bg-bg-dark-2 text-text-on-dark relative scroll-mt-24">
        <div id="upcoming-class" className="absolute -top-24 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-14 bg-bg-dark rounded-sm border border-border-dark shadow-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-light font-medium block mb-3">
              Upcoming Batches
            </span>
            <h2 className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight">
              New Batch Coming Soon
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
              We operate small, hands-on cohorts so every student receives individual guidance on machines. Register to be the first notified of our next Scarborough dates.
            </p>
            <div className="mt-8">
              <a
                href={notifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 inline-flex items-center space-x-2 bg-gold text-bg-dark px-8 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_20px_rgba(201,162,74,0.3)]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Get Notified on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const formattedDates = formatBatchDates(
    session.class_dates,
    session.start_date,
    session.second_date
  );

  const timeRange = `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`;

  const hasPrice = session.price_cad !== null && session.price_cad !== undefined;
  const originalPrice = hasPrice ? Number(session.price_cad) : 0;
  const discountPercent = session.discount_percent || 0;
  const discountedPrice = discountPercent > 0 ? Math.round(originalPrice * (1 - discountPercent / 100)) : originalPrice;

  const whatsappRegisterUrl = getWhatsAppUrl(
    whatsappNumber,
    `Hi! I'd like to register for ${session.title} (${formattedDates}).`
  );

  const icsDownloadUrl = generateIcsDataUrl(session);

  return (
    <section
      id="courses"
      className="py-16 sm:py-24 bg-bg-dark-2 text-text-on-dark relative overflow-hidden scroll-mt-24"
    >
      <div id="upcoming-class" className="absolute -top-24 pointer-events-none" />
      {/* Decorative Subtle Gold Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Next Live Intake
            </span>
          </div>
          <h2 className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight">
            Upcoming Master Class
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
            Reserve your seat for the next 2-day hands-on blouse making cohort in Scarborough or join online.
          </p>
        </div>

        {/* Large 2-Column Card with Equal Height on Desktop */}
        <div className="bg-bg-dark rounded-[4px] border border-border-dark shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative group">
          {/* Left Column: Image with absolute seal on the IMAGE corner */}
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:min-h-full bg-bg-dark overflow-hidden">
            <ImageWithFallback
              src="/images/home/masterclass-blouse.webp"
              alt={session.title}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-black/25 lg:bg-gradient-to-r lg:from-transparent lg:to-bg-dark" />

            {/* Discount Seal Ribbon - Placed directly on the IMAGE corner so it never overlaps text */}
            {session.discount_label && (
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gold text-bg-dark px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-[0_4px_16px_rgba(201,162,74,0.4)] border border-gold-light">
                  {session.discount_label}
                </div>
              </div>
            )}

            {/* Mode Badges on Image */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2">
              {(session.mode === "in_person" || session.mode === "both") && (
                <span className="bg-bg-dark/90 border border-border-dark text-gold-light text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm backdrop-blur-sm">
                  In-Person (Scarborough)
                </span>
              )}
              {(session.mode === "online" || session.mode === "both") && (
                <span className="bg-bg-dark/90 border border-border-dark text-gold-light text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm backdrop-blur-sm">
                  Live Online
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Masterclass Details */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Batch Code & Seats Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-on-dark bg-bg-dark-2 px-2.5 py-1 rounded-sm border border-border-dark">
                  Batch: {session.batch_code}
                </span>

                {typeof session.seats_left === "number" && session.seats_left > 0 && (
                  <div className="inline-flex items-center space-x-1.5 text-xs text-gold-light font-medium bg-gold/10 border border-gold/30 px-3 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    <span>Only {session.seats_left} seats left</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] font-light text-text-on-dark tracking-tight leading-snug">
                {session.title.replace(/\s*\(SAMPLE\)/i, "")}
              </h3>

              {/* Core Class Specifications */}
              <div className="mt-6 space-y-4 text-sm text-text-on-dark/90">
                {/* Date line with clean background */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-text-on-dark block leading-snug">{formattedDates}</span>
                    <span className="text-xs text-muted-on-dark">Two sessions (one week apart)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-text-on-dark block">{timeRange}</span>
                    <span className="text-xs text-muted-on-dark">2 days · 5 hours each</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-text-on-dark block">{session.location}</span>
                    <span className="text-xs text-muted-on-dark">Scarborough, ON</span>
                  </div>
                </div>
              </div>

              {/* Tuition & Pricing Ribbon */}
              <div className="mt-6 p-4 rounded-sm bg-bg-dark-2 border border-border-dark flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-muted-on-dark">
                    Master Class Tuition
                  </span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    {hasPrice ? (
                      <>
                        <span className="font-serif text-2xl sm:text-3xl text-gold-light font-medium tabular-nums lining-nums">
                          {formatCAD(discountedPrice)}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-xs text-muted-on-dark line-through tabular-nums lining-nums">
                            {formatCAD(originalPrice)}
                          </span>
                        )}
                        <span className="text-xs text-muted-on-dark">CAD per student</span>
                      </>
                    ) : (
                      <span className="font-serif text-xl text-gold-light font-medium">
                        Contact us for fees
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Countdown Timer */}
              {!timeLeft.isPast && (
                <div className="mt-6 pt-5 border-t border-border-dark">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold-light/80 font-medium block mb-2.5">
                    Registration Closes Soon · Batch Starts In:
                  </span>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
                    <div className="bg-bg-dark-2 border border-border-dark p-2 sm:p-2.5 rounded-sm text-center">
                      <span className="font-mono text-lg sm:text-2xl font-bold text-gold-light block tabular-nums lining-nums">
                        {timeLeft.days}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-on-dark">Days</span>
                    </div>
                    <div className="bg-bg-dark-2 border border-border-dark p-2 sm:p-2.5 rounded-sm text-center">
                      <span className="font-mono text-lg sm:text-2xl font-bold text-gold-light block tabular-nums lining-nums">
                        {timeLeft.hours}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-on-dark">Hours</span>
                    </div>
                    <div className="bg-bg-dark-2 border border-border-dark p-2 sm:p-2.5 rounded-sm text-center">
                      <span className="font-mono text-lg sm:text-2xl font-bold text-gold-light block tabular-nums lining-nums">
                        {timeLeft.minutes}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-on-dark">Mins</span>
                    </div>
                    <div className="bg-bg-dark-2 border border-border-dark p-2 sm:p-2.5 rounded-sm text-center">
                      <span className="font-mono text-lg sm:text-2xl font-bold text-gold block tabular-nums lining-nums">
                        {timeLeft.seconds}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-on-dark">Secs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Equal 48px height */}
            <div className="mt-8 pt-6 border-t border-border-dark flex flex-col sm:flex-row items-center gap-3.5">
              <a
                href={whatsappRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 h-12 inline-flex items-center justify-center bg-gold text-bg-dark px-6 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_20px_rgba(201,162,74,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>Register on WhatsApp</span>
              </a>

              <a
                href={icsDownloadUrl}
                download={`${session.batch_code || "KFA-Batch"}.ics`}
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center border border-border-dark text-gold-light hover:bg-bg-dark-2 hover:border-gold px-5 rounded-sm font-medium tracking-[0.15em] uppercase text-xs transition-colors text-center"
                title="Save dates to Apple Calendar, Google Calendar or Outlook"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                <span>Add to Calendar</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
