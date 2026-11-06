"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/ui/Lightbox";
import type { GalleryItem } from "@/types/database";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryClientProps {
  items: GalleryItem[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300",
                isSelected
                  ? "bg-gold text-charcoal-darkest shadow-md"
                  : "bg-surface border border-charcoal/15 text-charcoal hover:border-gold/60"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLightboxItem(item)}
            className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-charcoal-darker cursor-pointer border border-charcoal/20 hover:border-gold/60 shadow-sm transition-all duration-500"
          >
            <Image
              src={item.image_url || "/brand/KFA_icon_transparent.png"}
              alt={item.caption || "Krish Fashion Academy creation"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Hover details overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-darkest/90 via-charcoal-darkest/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium mb-1">
                {item.category}
              </span>
              {item.caption && (
                <p className="text-xs text-off-white line-clamp-2 font-light">
                  {item.caption}
                </p>
              )}
              <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-gold-light uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>Enlarge</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 text-charcoal-light">
          No items found in this category.
        </div>
      )}

      {/* Lightbox modal */}
      <Lightbox
        isOpen={!!activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
        imageUrl={activeLightboxItem?.image_url || ""}
        caption={activeLightboxItem?.caption}
        category={activeLightboxItem?.category}
      />
    </div>
  );
}
