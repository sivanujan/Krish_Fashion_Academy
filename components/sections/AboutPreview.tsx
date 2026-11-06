import Link from "next/link";
import Image from "next/image";
import RevealText from "@/components/animations/RevealText";
import RevealImage from "@/components/animations/RevealImage";
import Counter from "@/components/animations/Counter";
import { ArrowRight, Award, Scissors, Sparkles } from "lucide-react";

interface AboutPreviewProps {
  counters?: {
    students: number;
    years: number;
    courses: number;
  };
}

export default function AboutPreview({
  counters = { students: 1250, years: 12, courses: 15 },
}: AboutPreviewProps) {
  return (
    <section className="py-24 sm:py-32 bg-off-white text-heading relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-5 relative">
            <RevealImage className="relative rounded-sm shadow-2xl border border-gold/30 aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"
                alt="Krish Fashion Academy Studio"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-darkest/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-charcoal-darker/90 backdrop-blur-md border border-gold/40 rounded-sm">
                <p className="font-serif italic text-gold-light text-base sm:text-lg">
                  &ldquo;Perfection in tailoring is not merely a seam; it is the harmonious relationship between anatomy and cloth.&rdquo;
                </p>
                <span className="block mt-2 text-[10px] tracking-[0.2em] uppercase text-off-white/70">
                  — Master Tailor & Founder, KFA
                </span>
              </div>
            </RevealImage>
          </div>

          {/* Right Narrative Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center space-x-2 mb-3">
              <Scissors className="w-4 h-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-medium">
                Our Legacy & Discipline
              </span>
            </div>

            <RevealText
              tag="h2"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-darkest leading-tight tracking-tight"
            >
              Where Traditional Craft Meets Modern Haute Couture
            </RevealText>

            <div className="mt-6 space-y-4 text-body text-sm sm:text-base font-light leading-relaxed">
              <p>
                Krish Fashion Academy stands as Canada’s most trusted destination for precision garment engineering and bridal couture craftsmanship. We bridge time-honored artisanal methods with contemporary pattern-drafting science.
              </p>
              <p>
                Unlike generic theory courses, every student at KFA learns directly on professional industrial machines, mastering bust apex calculations, lining manipulation, and heirloom Aari needlework. Our alumni successfully run bridal studios, boutique labels, and export ateliers worldwide.
              </p>
            </div>

            {/* Counters Section */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-charcoal/10">
              <div>
                <p className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-dark font-normal">
                  <Counter end={counters.students} suffix="+" />
                </p>
                <p className="text-[11px] uppercase tracking-wider text-charcoal-light mt-1">
                  Students Graduated
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-dark font-normal">
                  <Counter end={counters.years} suffix="+" />
                </p>
                <p className="text-[11px] uppercase tracking-wider text-charcoal-light mt-1">
                  Years of Excellence
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-dark font-normal">
                  <Counter end={counters.courses} suffix="+" />
                </p>
                <p className="text-[11px] uppercase tracking-wider text-charcoal-light mt-1">
                  Couture Modules
                </p>
              </div>
            </div>

            {/* Link to full about page */}
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center text-xs uppercase tracking-[0.2em] font-medium text-charcoal hover:text-gold transition-colors group"
              >
                <span>Read Full Academy Story</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
