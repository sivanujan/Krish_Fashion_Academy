import RevealText from "@/components/animations/RevealText";
import { MapPin, Phone, MessageCircle, Navigation, Sparkles } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface LocationSectionProps {
  address?: string;
  phone?: string;
  whatsappNumber?: string;
  mapEmbedUrl?: string;
}

export default function LocationSection({
  address = "Middlefield Rd & McNicoll Ave, Scarborough, ON",
  phone = "+1 647-501-9569",
  whatsappNumber = "16475019569",
  mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6b63897d833%3A0x6fdf94f1c7dcf9a!2sMiddlefield%20Rd%20%26%20McNicoll%20Ave%2C%20Toronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca",
}: LocationSectionProps) {
  // Ensure the map embed always shows Middlefield & McNicoll intersection in Scarborough
  let activeMapUrl = mapEmbedUrl;
  if (!activeMapUrl || activeMapUrl.includes("Colombo") || activeMapUrl.includes("!2slk") || !activeMapUrl.includes("Middlefield") || activeMapUrl.includes("!3m3!1m2")) {
    activeMapUrl =
      "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca";
  }
  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Middlefield+Rd+%26+McNicoll+Ave,+Scarborough,+ON";

  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to ask for visiting information for Krish Fashion Academy in Scarborough."
  );

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 bg-bg-dark text-text-on-dark relative overflow-hidden scroll-mt-24"
    >
      <div id="location" className="absolute -top-24 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Scarborough Atelier
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight"
          >
            Visit Our Studio
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
            Conveniently located at Middlefield Rd &amp; McNicoll Ave in Scarborough, Toronto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Address & Contact Card */}
          <div className="lg:col-span-5 bg-bg-dark-2 p-7 sm:p-9 rounded-[4px] border border-border-dark shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-gold-light font-medium block mb-3">
                Location Details
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-light text-text-on-dark leading-snug">
                Krish Fashion Academy Studio
              </h3>

              <div className="mt-6 space-y-4 text-sm text-text-on-dark/90">
                <div className="flex items-start space-x-3.5">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-text-on-dark">{address}</span>
                    <span className="block text-xs text-muted-on-dark">Scarborough, Toronto, Ontario, Canada</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="hover:text-gold transition-colors font-mono tabular-nums lining-nums text-text-on-dark"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-center space-x-3.5">
                  <MessageCircle className="w-4 h-4 text-gold shrink-0" />
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors text-text-on-dark"
                  >
                    WhatsApp: <span className="tabular-nums lining-nums">{phone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons - Same 48px height */}
            <div className="mt-8 pt-6 border-t border-border-dark flex flex-col sm:flex-row items-center gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 h-12 inline-flex items-center justify-center bg-gold text-bg-dark px-6 rounded-sm font-semibold tracking-wider uppercase text-xs hover:bg-gold-light transition-all shadow-md text-center"
              >
                <Navigation className="w-3.5 h-3.5 mr-2" />
                <span>Get Directions</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center border border-border-dark text-gold-light hover:bg-bg-dark hover:border-gold px-6 rounded-sm font-medium tracking-wider uppercase text-xs transition-colors text-center"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-2 text-gold" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Clean Google Map Embed with Dark-friendly gold frame and grayscale(0.3) */}
          <div className="lg:col-span-7 bg-bg-dark rounded-[4px] border border-border-dark overflow-hidden shadow-xl min-h-[360px] relative">
            <iframe
              src={activeMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "360px" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Krish Fashion Academy Location - Middlefield Rd & McNicoll Ave, Scarborough"
              className="w-full h-full grayscale-[0.3] contrast-[1.05]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
