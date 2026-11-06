import Image from "next/image";
import RevealText from "@/components/animations/RevealText";
import { Card } from "@/components/ui/Card";
import type { Service } from "@/types/database";
import { Scissors } from "lucide-react";

interface ServicesGridProps {
  services: Service[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-off-white text-heading relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-gold-dark mb-2">
            <Scissors className="w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Bespoke Atelier Services
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-3xl sm:text-5xl font-light text-charcoal-darkest tracking-tight"
          >
            Crafted for Distinction
          </RevealText>
          <p className="mt-4 text-xs sm:text-sm text-charcoal-light leading-relaxed">
            Beyond education, our master ateliers offer custom tailoring, heirloom bridal blouse construction, and couture fittings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="bg-surface border-charcoal/10 flex flex-col group overflow-hidden"
            >
              {service.image_url && (
                <div className="relative aspect-[16/11] overflow-hidden bg-charcoal/5">
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-charcoal-darkest group-hover:text-gold-dark transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-charcoal-light leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between text-[11px] uppercase tracking-widest text-gold-dark font-medium">
                  <span>Custom Orders Welcome</span>
                  <span className="text-gold">✦</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
