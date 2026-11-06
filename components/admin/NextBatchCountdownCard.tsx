"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatBatchDates, formatCAD } from "@/lib/utils";
import type { ClassSession } from "@/types/database";
import { Calendar, Users, Clock, ArrowRight, Sparkles } from "lucide-react";

interface NextBatchCountdownCardProps {
  batch: (ClassSession & { courses?: { title: string } }) | null;
}

export default function NextBatchCountdownCard({
  batch,
}: NextBatchCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!batch?.start_date) return;

    const calculate = () => {
      const target = new Date(`${batch.start_date}T${batch.start_time || "11:00:00"}`);
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, minutes });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [batch?.start_date, batch?.start_time]);

  if (!batch) {
    return (
      <Card className="p-6 bg-surface border-charcoal/15">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-medium">
            Next Upcoming Cohort
          </span>
          <Badge variant="neutral">No Active Batches</Badge>
        </div>
        <p className="mt-3 text-sm text-charcoal-light">
          No upcoming batches are currently scheduled.
        </p>
        <Link
          href="/admin/batches/new"
          className="mt-4 inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-gold-dark hover:text-gold font-medium"
        >
          <span>Schedule New Batch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Card>
    );
  }

  const batchDatesFormatted = formatBatchDates(
    batch.class_dates && batch.class_dates.length > 0
      ? batch.class_dates
      : [batch.start_date, batch.second_date].filter(Boolean) as string[]
  );

  return (
    <Card className="p-6 bg-gradient-to-br from-charcoal-darkest to-charcoal border-gold/40 shadow-xl text-off-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-gold/20 text-gold-light border border-gold/30 font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            Next Upcoming Batch
          </span>
          <span className="font-mono text-xs text-gold-light font-semibold">
            {batch.batch_code}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {batch.seats_left !== null && (
            <span className="text-off-white/80 font-medium">
              <strong className="text-gold-light font-bold">
                {batch.seats_left}
              </strong>{" "}
              seats remaining of {batch.seats_total || 6}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-2">
          <h3 className="font-serif text-2xl text-off-white font-normal">
            {batch.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-off-white/70">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-gold" />
              {batchDatesFormatted}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-gold" />
              {batch.start_time?.slice(0, 5) || "11:00"} – {batch.end_time?.slice(0, 5) || "16:00"}
            </span>
          </div>
        </div>

        {/* Live Countdown Grid */}
        <div className="md:col-span-5 bg-charcoal-dark/70 border border-gold/30 rounded-sm p-3.5 text-center">
          <span className="text-[10px] uppercase tracking-widest text-gold-light/80 block mb-2 font-medium">
            Time Until First Class
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-charcoal/80 p-2 rounded-xs border border-white/5">
              <span className="font-serif text-2xl text-gold-light block font-bold">
                {timeLeft.days}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-off-white/60">
                Days
              </span>
            </div>
            <div className="bg-charcoal/80 p-2 rounded-xs border border-white/5">
              <span className="font-serif text-2xl text-gold-light block font-bold">
                {timeLeft.hours}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-off-white/60">
                Hours
              </span>
            </div>
            <div className="bg-charcoal/80 p-2 rounded-xs border border-white/5">
              <span className="font-serif text-2xl text-gold-light block font-bold">
                {timeLeft.minutes}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-off-white/60">
                Mins
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-off-white/60 text-[11px]">
          Location: {batch.location || "Middlefield Rd & McNicoll Ave, Scarborough, ON"}
        </span>
        <Link
          href={`/admin/batches/${batch.id}`}
          className="inline-flex items-center space-x-1.5 text-gold-light hover:text-white font-medium uppercase tracking-wider text-[11px] transition-colors"
        >
          <span>Manage Cohort</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
