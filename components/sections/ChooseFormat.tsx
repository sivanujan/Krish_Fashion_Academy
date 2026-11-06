import ImageWithFallback from "@/components/ui/ImageWithFallback";
import RevealText from "@/components/animations/RevealText";
import { MapPin, Video, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ChooseFormatProps {
  whatsappNumber?: string;
  studioImageUrl?: string;
  onlineImageUrl?: string;
}

export default function ChooseFormat({
  whatsappNumber = "16475019569",
  studioImageUrl,
  onlineImageUrl,
}: ChooseFormatProps) {
  const inPersonUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to register for the In-Person Saree Blouse Master Class in Scarborough."
  );

  const onlineUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi Krish Fashion Academy! Please add me to the waitlist for Live Online Saree Blouse Master Classes."
  );

  return (
    <section id="choose-format" className="py-16 sm:py-24 bg-bg-dark text-text-on-dark relative overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Flexible Learning
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight"
          >
            Choose Your Format
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
            Join hands-on machine classes at our Scarborough studio, or sign up for notifications when our live online cohorts launch.
          </p>
        </div>

        {/* Two Cards Side by Side - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* In-Person Studio Card (Primary) */}
          <div className="bg-bg-dark-2 rounded-sm border border-gold/40 overflow-hidden flex flex-col justify-between group hover:border-gold hover:-translate-y-1 transition-all duration-300 shadow-xl h-full">
            <div className="flex flex-col">
              <div className="relative aspect-[16/10] bg-bg-dark overflow-hidden">
                <ImageWithFallback
                  src={studioImageUrl || "/images/home/studio-class.webp"}
                  alt="In-person tailoring master class with personal machine guidance"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark-2 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-bg-dark/90 border border-gold/50 text-gold-light text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-sm backdrop-blur-sm">
                  IN-PERSON CLASS
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <div className="flex items-center space-x-2 text-gold-light text-xs font-mono uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>Middlefield &amp; McNicoll, Scarborough</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-light text-text-on-dark group-hover:text-gold-light transition-colors leading-snug">
                  In-Person Master Class
                </h3>

                <ul className="mt-6 space-y-3.5 text-sm text-text-on-dark/90">
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Practise hands-on on sewing machines in class</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Personal one-on-one cutting and stitching guidance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>Finish stitching your own 3-dart blouse in 2 days</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-7 sm:p-8 pt-0 mt-auto">
              <a
                href={inPersonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 inline-flex items-center justify-center bg-gold text-bg-dark px-6 rounded-sm font-semibold tracking-[0.2em] uppercase text-xs hover:bg-gold-light transition-all shadow-[0_4px_16px_rgba(201,162,74,0.3)] text-center"
              >
                <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>Register for In-Person</span>
              </a>
            </div>
          </div>

          {/* Live Online Card (Muted, Single Badge) */}
          <div className="bg-bg-dark-2/70 rounded-sm border border-border-dark overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-md relative h-full opacity-90 hover:opacity-100">
            <div className="flex flex-col">
              <div className="relative aspect-[16/10] bg-bg-dark overflow-hidden grayscale-[0.25]">
                <ImageWithFallback
                  src={onlineImageUrl || "/images/home/online-class.webp"}
                  alt="Live online saree blouse class study space"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark-2 via-transparent to-transparent" />
                {/* ONE Single Clear Coming Soon Badge Only */}
                <div className="absolute top-4 right-4 bg-bg-dark/95 border border-gold/50 text-gold-light text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md">
                  Coming Soon
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <div className="flex items-center space-x-2 text-muted-on-dark text-xs font-mono uppercase tracking-wider mb-2">
                  <Video className="w-4 h-4 text-gold/70" />
                  <span>Interactive Live Stream</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-light text-text-on-dark leading-snug">
                  Live Online Master Class
                </h3>

                <p className="mt-5 text-sm text-muted-on-dark font-light leading-relaxed">
                  Prefer learning from home? Join the waitlist and we&apos;ll let you know when online batches open.
                </p>
              </div>
            </div>

            <div className="p-7 sm:p-8 pt-0 mt-auto">
              <a
                href={onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 inline-flex items-center justify-center border border-border-dark text-gold-light hover:border-gold hover:bg-bg-dark-2 px-6 rounded-sm font-medium tracking-[0.15em] uppercase text-xs transition-all duration-300 text-center"
              >
                <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>Join the Online Waitlist</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
