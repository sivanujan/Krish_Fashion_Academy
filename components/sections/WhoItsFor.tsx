"use client";

import RevealText from "@/components/animations/RevealText";
import { UserCheck, Sparkles, Scissors, HeartHandshake } from "lucide-react";

const AUDIENCES = [
  {
    icon: UserCheck,
    title: "Complete Beginners",
    subtitle: "No previous experience required",
    description:
      "Start with zero experience. Learn how to take accurate body measurements, use a sewing machine, and stitch your own blouse in 2 days.",
  },
  {
    icon: Scissors,
    title: "Home Sewers",
    subtitle: "Who want a perfect, gap-free fit",
    description:
      "Master drafting custom paper patterns with exact ease calculations, armhole curvature, and balanced darts tailored to your measurements.",
  },
  {
    icon: HeartHandshake,
    title: "Blouse Makers",
    subtitle: "Stitch blouses of any size with confidence",
    description:
      "Learn the core formulas, cutting methods, and step-by-step assembly so you can cut and stitch saree blouses of any size with lasting confidence.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-bg-light text-text-on-light relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-text-light mb-2">
            <Sparkles className="w-4 h-4 text-gold-text-light" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              WHO IT&apos;S FOR
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-light tracking-tight leading-tight"
          >
            Who This Master Class Is For
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-light font-light max-w-[62ch] mx-auto text-pretty">
            Krish Fashion Academy teaches beginner-friendly tailoring and saree blouse making in Scarborough, Toronto. Our hands-on master classes build confidence to cut and stitch blouses of any size.
          </p>
        </div>

        {/* 3 Cards Grid with soft shadow, hover lift 4px + gold top border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {AUDIENCES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-sm border border-border-light p-7 flex flex-col justify-between shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:border-t-2 hover:border-t-gold transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold-text-light mb-5 group-hover:bg-gold group-hover:text-bg-dark transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>

                  <h3 className="font-serif text-2xl font-light text-text-on-light group-hover:text-gold-text-light transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-wider text-gold-text-light font-medium">
                    {item.subtitle}
                  </p>

                  <p className="mt-4 text-sm text-muted-on-light font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
