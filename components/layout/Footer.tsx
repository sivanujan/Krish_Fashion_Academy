import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

interface FooterProps {
  settings?: {
    phone?: string;
    whatsapp_number?: string;
    email?: string;
    address?: string;
    facebook_url?: string | null;
    instagram_url?: string | null;
    youtube_url?: string | null;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  let phone = settings?.phone || "+1 647-501-9569";
  let whatsappNumber = settings?.whatsapp_number || "16475019569";
  const rawEmail = settings?.email?.trim();
  // Hide email if empty or if it's the unconfirmed info@ placeholder
  const hasConfirmedEmail = rawEmail && rawEmail.length > 0 && !rawEmail.includes("info@krishfashionacademy.com");
  let address = settings?.address || "Middlefield Rd & McNicoll Ave, Scarborough, ON";

  if (phone.includes("+94") || phone.includes("771234567")) {
    phone = "+1 647-501-9569";
  }
  if (whatsappNumber.startsWith("94") || whatsappNumber.includes("771234567")) {
    whatsappNumber = "16475019569";
  }
  if (address.toLowerCase().includes("sri lanka") || address.toLowerCase().includes("colombo") || address.includes("Galle Road")) {
    address = "Middlefield Rd & McNicoll Ave, Scarborough, ON";
  }

  const instagramUrl = settings?.instagram_url || "https://instagram.com/krishfashionacademy";

  return (
    <footer className="bg-bg-dark text-muted-on-dark border-t border-border-dark relative overflow-hidden">
      {/* Top subtle decorative gold line */}
      <div className="gold-divider w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Manifesto */}
          <div className="space-y-4">
            <div className="relative w-52 h-12">
              <Image
                src="/brand/KFA_logo_horizontal_transparent.png"
                alt="Krish Fashion Academy"
                width={208}
                height={48}
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs font-light text-muted-on-dark leading-relaxed">
              Beginner-friendly saree blouse tailoring classes in Scarborough, Toronto.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-border-dark flex items-center justify-center text-gold-light hover:bg-gold hover:text-bg-dark transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-border-dark flex items-center justify-center text-gold-light hover:bg-gold hover:text-bg-dark transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full border border-border-dark flex items-center justify-center text-gold-light hover:bg-gold hover:text-bg-dark transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Academy Links */}
          <div>
            <h4 className="font-serif text-lg text-gold-light tracking-wider uppercase mb-4">
              Programs
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase">
              <li>
                <Link
                  href="/#courses"
                  className="hover:text-gold transition-colors block py-0.5"
                >
                  Saree Blouse Master Class
                </Link>
              </li>
              <li>
                <Link
                  href="/#what-youll-learn"
                  className="hover:text-gold transition-colors block py-0.5"
                >
                  Curriculum (5 Steps)
                </Link>
              </li>
              <li>
                <Link
                  href="/#choose-format"
                  className="hover:text-gold transition-colors block py-0.5"
                >
                  In-Person &amp; Online
                </Link>
              </li>
              <li>
                <Link
                  href="/classes"
                  className="hover:text-gold transition-colors block py-0.5"
                >
                  Upcoming Batches
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-gold-light tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase">
              <li>
                <Link href="/#about" className="hover:text-gold transition-colors block py-0.5">
                  About Academy
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-gold transition-colors block py-0.5">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-gold transition-colors block py-0.5">
                  Studio &amp; Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold transition-colors block py-0.5">
                  Student Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-lg text-gold-light tracking-wider uppercase mb-4">
              Atelier Location
            </h4>
            <ul className="space-y-3 text-xs font-light text-muted-on-dark">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="text-text-on-dark">{address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-gold transition-colors tabular-nums lining-nums text-text-on-dark">
                  {phone}
                </a>
              </li>
              {hasConfirmedEmail && (
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <a href={`mailto:${rawEmail}`} className="hover:text-gold transition-colors text-text-on-dark">
                    {rawEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Simple Legal Pages */}
        <div className="mt-16 pt-8 border-t border-border-dark flex flex-col sm:flex-row items-center justify-between text-xs text-muted-on-dark tracking-wider">
          <p>© {currentYear} Krish Fashion Academy. All rights reserved.</p>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4 text-xs text-muted-on-dark">
            <Link href="/privacy" className="hover:text-gold-light transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gold-light transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
