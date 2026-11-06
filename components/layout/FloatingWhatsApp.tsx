"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export default function FloatingWhatsApp({
  whatsappNumber = "16475019569",
}: FloatingWhatsAppProps) {
  const url = getWhatsAppUrl(
    whatsappNumber,
    "Hi! I'd like to ask about the Saree Blouse Master Class at Krish Fashion Academy."
  );

  return (
    <aside
      aria-label="Direct messaging triggers"
      className="fixed bottom-6 right-6 z-40 flex items-center group pointer-events-auto [body.mobile-menu-active_&]:hidden"
    >
      {/* Tooltip badge */}
      <span className="hidden sm:inline-block mr-3 bg-bg-dark text-gold-light text-[11px] uppercase tracking-wider font-medium px-3 py-1.5 rounded-sm border border-border-dark shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat on WhatsApp
      </span>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300 flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
      </a>
    </aside>
  );
}
