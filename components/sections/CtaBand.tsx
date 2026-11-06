import RevealText from "@/components/animations/RevealText";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface CtaBandProps {
  whatsappNumber?: string;
}

export default function CtaBand({
  whatsappNumber = "16475019569",
}: CtaBandProps) {
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to register for the 2-Day Saree Blouse Master Class."
  );

  return (
    <section className="py-20 sm:py-24 bg-charcoal-darkest text-off-white relative overflow-hidden">
      {/* Charcoal with gold stitch border */}
      <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-gold/40 pointer-events-none rounded-sm" />
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-6">
        <span className="text-[11px] uppercase tracking-[0.3em] text-gold-light font-medium block mb-3">
          Beginner-Friendly · 2 Days · Hands-On
        </span>

        <RevealText
          tag="h2"
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-off-white tracking-tight"
        >
          Your first blouse is 2 days away.
        </RevealText>

        <p className="mt-4 text-xs sm:text-base text-off-white/80 font-light max-w-xl mx-auto leading-relaxed">
          No experience needed. Master measurements, paper patterns, cutting, and stitching with personal guidance in Scarborough or live online.
        </p>

        <div className="mt-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-gold text-charcoal-darkest px-8 py-4 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_24px_rgba(201,162,74,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="w-4 h-4 mr-2.5" />
            <span>Register on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
