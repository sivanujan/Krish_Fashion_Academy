import RevealText from "@/components/animations/RevealText";
import { MessageCircle, Phone, Sparkles, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface HowToRegisterProps {
  phone?: string;
  whatsappNumber?: string;
}

const REGISTRATION_STEPS = [
  {
    step: "01",
    title: "Message Us on WhatsApp",
    desc: "Send a quick message to +1 647-501-9569 with your name and whether you prefer in-person or live online.",
  },
  {
    step: "02",
    title: "Confirm Your Seat & Format",
    desc: "We confirm seat availability in the upcoming batch and provide your class schedule and preparation details.",
  },
  {
    step: "03",
    title: "Come to Class & Stitch",
    desc: "Arrive at our Scarborough studio (or tune in live online) and finish stitching your custom 3-dart blouse in 2 days.",
  },
];

export default function HowToRegister({
  phone = "+1 647-501-9569",
  whatsappNumber = "16475019569",
}: HowToRegisterProps) {
  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to register for the Saree Blouse Master Class."
  );

  return (
    <section className="py-16 sm:py-24 bg-bg-dark text-text-on-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Simple Enrollment
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight"
          >
            How to Register
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
            Enrolling takes under 2 minutes. No complicated forms or logins required.
          </p>
        </div>

        {/* 3 Steps Cards - Equal Height */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto mb-12 items-stretch">
          {REGISTRATION_STEPS.map((s) => (
            <div
              key={s.step}
              className="bg-bg-dark-2 rounded-sm border border-border-dark p-7 relative group hover:border-gold transition-colors shadow-lg flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-gold-light/40 group-hover:text-gold transition-colors tabular-nums lining-nums leading-none">
                    {s.step}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-light text-text-on-dark group-hover:text-gold-light transition-colors leading-snug">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm text-muted-on-dark font-light leading-relaxed line-clamp-3">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Big WhatsApp CTA + Phone Call Option */}
        <div className="text-center max-w-xl mx-auto p-8 rounded-sm bg-bg-dark-2 border border-border-dark shadow-2xl">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-12 inline-flex items-center justify-center bg-gold text-bg-dark px-8 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_24px_rgba(201,162,74,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="w-4 h-4 mr-2.5" />
            <span>Message Us on WhatsApp to Register</span>
          </a>

          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-muted-on-dark font-light">
            <span>Or call us directly at:</span>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="text-gold-light font-medium hover:text-gold transition-colors inline-flex items-center space-x-1 tabular-nums lining-nums"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-gold" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
