import ContactEnquiryForm from "@/components/forms/ContactEnquiryForm";
import RevealText from "@/components/animations/RevealText";
import { Phone, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ContactSectionProps {
  settings?: {
    phone?: string;
    whatsapp_number?: string;
    email?: string;
    address?: string;
    map_embed_url?: string | null;
  } | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  let phone = settings?.phone || "+1 647-501-9569";
  let whatsapp = settings?.whatsapp_number || "16475019569";
  const email = settings?.email;
  const hasEmail = email && email.trim().length > 0 && !email.includes("info@krishfashionacademy.com");
  let address = settings?.address || "Middlefield Rd & McNicoll Ave, Scarborough, ON";

  if (phone.includes("+94") || phone.includes("771234567")) {
    phone = "+1 647-501-9569";
  }
  if (whatsapp.startsWith("94") || whatsapp.includes("771234567")) {
    whatsapp = "16475019569";
  }
  if (address.toLowerCase().includes("sri lanka") || address.toLowerCase().includes("colombo")) {
    address = "Middlefield Rd & McNicoll Ave, Scarborough, ON";
  }
  const mapUrl =
    settings?.map_embed_url ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.5833215582236!2d-79.26388482346914!3d43.82298647109472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6b63897d833%3A0x6fdf94f1c7dcf9a!2sMiddlefield%20Rd%20%26%20McNicoll%20Ave%2C%20Toronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1714000000000!5m2!1sen!2sca";

  const whatsappDirect = getWhatsAppUrl(
    whatsapp,
    "Hi! I'd like to ask about the Saree Blouse Master Class at Krish Fashion Academy."
  );

  return (
    <section id="contact" className="py-24 sm:py-32 bg-off-white text-heading relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-medium block mb-2">
            Get In Touch
          </span>
          <RevealText
            tag="h2"
            className="font-serif text-3xl sm:text-5xl font-light text-charcoal-darkest tracking-tight"
          >
            Admissions & Atelier Inquiries
          </RevealText>
          <p className="mt-4 text-xs sm:text-sm text-charcoal-light leading-relaxed">
            Have questions about fees, flexible weekend batches, or personalized stitching? We welcome you to message us or visit our atelier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-surface p-8 sm:p-10 rounded-sm border border-charcoal/10 shadow-sm">
            <h3 className="font-serif text-2xl text-charcoal-darkest mb-6">
              Send us an Enquiry
            </h3>
            <ContactEnquiryForm />
          </div>

          {/* Right Column: Direct Info & Google Map */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Contact Details Card */}
            <div className="bg-surface p-8 rounded-sm border border-charcoal/10 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl text-charcoal-darkest mb-2">
                Atelier Coordinates
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-charcoal-light font-light">
                <div className="flex items-start space-x-3.5">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-heading uppercase tracking-wider text-[11px]">
                      Location
                    </span>
                    <span>{address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-heading uppercase tracking-wider text-[11px]">
                      Call Desk
                    </span>
                    <a href={`tel:${phone}`} className="hover:text-gold transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-heading uppercase tracking-wider text-[11px]">
                      WhatsApp Direct
                    </span>
                    <a
                      href={whatsappDirect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                    >
                      {whatsapp} (Click to Chat)
                    </a>
                  </div>
                </div>

                {hasEmail && (
                  <div className="flex items-start space-x-3.5">
                    <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-heading uppercase tracking-wider text-[11px]">
                        Email
                      </span>
                      <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3.5 pt-2 border-t border-charcoal/10">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-heading uppercase tracking-wider text-[11px]">
                      Hours of Instruction
                    </span>
                    <span>Tuesday – Sunday: 9:00 AM – 6:00 PM (Monday Closed)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-sm overflow-hidden border border-charcoal/10 shadow-sm relative bg-charcoal/5">
              <iframe
                title="Krish Fashion Academy Location Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
