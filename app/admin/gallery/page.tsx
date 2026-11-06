import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GalleryManager from "@/components/admin/GalleryManager";
import type { GalleryItem } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Gallery",
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  const items: GalleryItem[] = data || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-medium block mb-1">
          Media Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-darkest">
          Atelier Portfolio & Gallery
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-light">
          Upload and categorize photos showcasing atelier garments and student creations.
        </p>
      </div>

      <GalleryManager initialItems={items} />
    </div>
  );
}
