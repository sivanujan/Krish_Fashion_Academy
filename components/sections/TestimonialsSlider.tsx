"use client";

import RevealText from "@/components/animations/RevealText";
import { Star, Quote, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Swiper core styles
import "swiper/css";
import "swiper/css/pagination";

export interface UnifiedTestimonial {
  id: string;
  name: string;
  role?: string;
  message: string;
  rating: number;
  batch_title?: string;
}

interface TestimonialsSliderProps {
  testimonials: UnifiedTestimonial[];
}

export default function TestimonialsSlider({
  testimonials,
}: TestimonialsSliderProps) {
  // Hide section completely if there is no approved real feedback
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-bg-light text-text-on-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-gold-text-light mb-2">
            <Sparkles className="w-4 h-4 text-gold-text-light" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Student Experiences
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-light tracking-tight leading-tight"
          >
            What Our Students Say
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-light max-w-[62ch] mx-auto">
            Feedback from participants who completed our 2-day master class.
          </p>
        </div>

        <div className="relative pb-6">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="!pb-12"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id} className="h-auto">
                <div className="h-full bg-white border border-border-light rounded-sm p-7 flex flex-col justify-between shadow-sm hover:border-gold hover:-translate-y-1 transition-all duration-300">
                  <div>
                    {/* Gold Star Rating */}
                    <div className="flex items-center space-x-1 text-gold mb-5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>

                    <Quote className="w-7 h-7 text-gold-text-light/40 mb-3" />

                    <p className="text-text-on-light text-sm font-light leading-relaxed italic">
                      &ldquo;{t.message}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border-light flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-bg-dark text-gold-light font-serif text-sm font-bold flex items-center justify-center shrink-0 border border-gold/40">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif text-base text-text-on-light font-medium leading-snug">
                        {t.name}
                      </h4>
                      <p className="text-[11px] uppercase tracking-wider text-muted-on-light">
                        {t.batch_title || t.role || "Saree Blouse Student"}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
