"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ParallaxBackground from "@/components/animations/ParallaxBackground";
import StitchHeadline, { type StitchSegment } from "@/components/hero/StitchHeadline";
import stitchStyles from "@/components/hero/stitch.module.css";
import { MessageCircle, ArrowDown, Check } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

const HEADLINE: StitchSegment[] = [
  { text: "Master the Art of" },
  { text: "Saree Blouse Tailoring", gold: true },
];

type RestState = "hidden" | "animate" | "instant";

interface HeroProps {
  whatsappNumber?: string;
}

export default function Hero({ whatsappNumber = "16475019569" }: HeroProps) {
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to register for the Saree Blouse Master Class."
  );
  const [rest, setRest] = useState<RestState>("hidden");
  const [jsReady, setJsReady] = useState(false);

  // JS is running, so the CSS failsafe for the hidden content is no longer needed.
  useEffect(() => setJsReady(true), []);

  const scrollToUpcoming = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("upcoming-class");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Content fade up stagger after headline stitches
  const restProps = (index: number) => {
    if (rest === "instant") return { className: "" };
    if (rest === "hidden") {
      return {
        className: `${stitchStyles.restHidden} ${jsReady ? "" : stitchStyles.restFailsafe}`,
      };
    }
    return { className: stitchStyles.restIn, style: { animationDelay: `${index * 0.12}s` } };
  };

  const p0 = restProps(0);
  const p1 = restProps(1);
  const p2 = restProps(2);
  const p3 = restProps(3);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-bg-dark text-text-on-dark">
      {/* Background Image with Dark Gradient Overlay (left/centre darker for readability) & subtle parallax */}
      <ParallaxBackground speed={0.2} className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-stitch.webp"
          alt="Krish Fashion Academy Saree Blouse Atelier in Scarborough"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        {/* Left/centre darker gradient overlay for readability (charcoal 85% -> 60%) */}
        <div className="absolute inset-0 bg-bg-dark/85 sm:bg-bg-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark-2/60 to-bg-dark/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-bg-dark/80" />
      </ParallaxBackground>

      {/* Hero Content - Vertically Centred */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-20 flex flex-col items-center my-auto">
        {/* Badge */}
        <div
          className={`inline-flex items-center space-x-2 border border-border-dark px-4 py-1.5 rounded-full bg-bg-dark-2/80 backdrop-blur-md mb-6 ${stitchStyles.badgeIn}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] text-gold-light font-medium">
            SCARBOROUGH · TORONTO · IN-PERSON &amp; ONLINE
          </span>
        </div>

        {/* Master Headline (Stitched with needle animation) */}
        <StitchHeadline
          segments={HEADLINE}
          onDone={(animated) => setRest(animated ? "animate" : "instant")}
          goldClassName="italic font-normal text-gold-light"
          className="font-serif text-[clamp(2.75rem,5.5vw,4.75rem)] font-light text-text-on-dark tracking-tight leading-[1.12] max-w-4xl"
        />

        {/* Subtext */}
        <p
          style={p0.style}
          className={`${p0.className} mt-6 text-base sm:text-lg text-text-on-dark/90 font-light max-w-[62ch] leading-[1.6] tracking-wide text-pretty`}
        >
          Beginner-friendly master classes – learn measurements, paper patterns, cutting and stitching, and finish your own blouse in just 2 days.
        </p>

        {/* Action Buttons (min-height 48px tap target) */}
        <div
          style={p1.style}
          className={`${p1.className} mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto`}
        >
          <a
            href="#upcoming-class"
            onClick={scrollToUpcoming}
            className="w-full sm:w-auto h-12 inline-flex items-center justify-center bg-gold text-bg-dark px-8 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_24px_rgba(201,162,74,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>SEE UPCOMING CLASS</span>
            <ArrowDown className="w-4 h-4 ml-2 animate-bounce" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-12 inline-flex items-center justify-center border border-gold/70 text-gold-light hover:bg-gold hover:text-bg-dark px-8 rounded-sm font-medium tracking-[0.2em] uppercase text-xs transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <span>REGISTER ON WHATSAPP</span>
          </a>
        </div>

        {/* Small Trust Row */}
        <div
          style={p2.style}
          className={`${p2.className} mt-8 pt-6 border-t border-border-dark flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs text-muted-on-dark font-light max-w-xl`}
        >
          <div className="inline-flex items-center space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>No experience needed</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-gold/60 inline-block" />

          <div className="inline-flex items-center space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>Finish your blouse in 2 days</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-gold/60 inline-block" />

          <div className="inline-flex items-center space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>Small hands-on batches</span>
          </div>
        </div>
      </div>

      {/* Subtle decorative scroll cue sits exactly 32px from bottom */}
      <div style={p3.style} className={`${p3.className} absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block z-10`}>
        <a
          href="#upcoming-class"
          onClick={scrollToUpcoming}
          className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll to upcoming master class"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light/80 mb-2">
            Explore Masterclass
          </span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-gold to-transparent" />
        </a>
      </div>
    </section>
  );
}
