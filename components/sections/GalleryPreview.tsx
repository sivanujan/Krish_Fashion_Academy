"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RevealText from "@/components/animations/RevealText";
import { Lightbox } from "@/components/ui/Lightbox";
import type { GalleryItem } from "@/types/database";
import { ArrowRight, Eye, Sparkles } from "lucide-react";

interface GalleryPreviewProps {
  items: GalleryItem[];
}

export default function GalleryPreview({ items }: GalleryPreviewProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // If empty, hide the section completely (as per Rule 3.7). Real photos only.
  if (!items || items.length === 0) return null;

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-bg-dark text-text-on-dark relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-border-dark pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-medium">
                Student Work &amp; Creations
              </span>
            </div>
            <RevealText
              tag="h2"
              className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight"
            >
              Made in Our Classes
            </RevealText>
          </div>

          {items && items.length > 8 && (
            <div className="mt-4 md:mt-0">
              <Link
                href="/gallery"
                className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-gold-light hover:text-gold transition-colors group"
              >
                <span>View full gallery</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-bg-dark-2 cursor-pointer border border-border-dark hover:border-gold/60 transition-all duration-500 shadow-md"
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.caption || "Blouse crafted in Krish Fashion Academy class"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold/30 text-xs">
                  KFA Class
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/95 via-bg-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium mb-1">
                  {item.category}
                </span>
                {item.caption && (
                  <p className="text-xs text-text-on-dark/90 line-clamp-2 font-light">
                    {item.caption}
                  </p>
                )}
                <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] text-gold-light uppercase tracking-wider">
                  <Eye className="w-3 h-3" />
                  <span>Enlarge</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        imageUrl={selectedItem?.image_url || ""}
        caption={selectedItem?.caption}
        category={selectedItem?.category}
      />
    </section>
  );
}
