"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertGalleryItemAction, deleteGalleryItemAction } from "@/lib/actions/settings";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { GalleryItem } from "@/types/database";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Bridal");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setImageUrl("");
    setCaption("");
    setCategory("Bridal");
    setSortOrder(items.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setImageUrl(item.image_url || "");
    setCaption(item.caption || "");
    setCategory(item.category);
    setSortOrder(item.sort_order);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setErrorMsg("Please upload an image");
      return;
    }
    if (!category) {
      setErrorMsg("Please select or enter a category");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await upsertGalleryItemAction(
        editingItem?.id || null,
        imageUrl,
        caption,
        category,
        sortOrder
      );

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to save gallery item");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, cat: string) => {
    if (!confirm(`Delete ${cat} gallery item?`)) return;
    await deleteGalleryItemAction(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Atelier Showcase Items
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Add couture creations, bridal blouse photos, and student portfolio items.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Photo to Gallery</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {initialItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-surface rounded-sm border border-charcoal/15 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] bg-charcoal/5">
              <Image
                src={item.image_url || "/brand/KFA_icon_transparent.png"}
                alt={item.caption || "Gallery creation"}
                fill
                className="object-cover"
              />
              <span className="absolute top-2 left-2 bg-charcoal-darkest/90 text-gold-light text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex-grow flex flex-col justify-between">
              <p className="text-xs text-charcoal font-light line-clamp-2">
                {item.caption || "No caption"}
              </p>

              <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-center justify-between">
                <span className="text-[10px] text-charcoal-light font-mono">
                  Order: #{item.sort_order}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-charcoal-light hover:text-charcoal-darkest"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.category)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-sm border border-charcoal/20 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <h3 className="font-serif text-2xl text-charcoal-darkest">
              {editingItem ? "Edit Gallery Item" : "Add Gallery Image"}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <ImageUpload
                label="Photo Upload (Supabase Storage) *"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl("")}
                folder="gallery"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Pattern Making">Pattern Making</option>
                    <option value="Embroidery">Embroidery</option>
                    <option value="Student Creations">Student Creations</option>
                    <option value="Tailoring">Tailoring</option>
                  </select>
                </div>

                <Input
                  label="Display Order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <Input
                label="Caption / Description"
                placeholder="e.g. Handcrafted Gold Thread Aari Blouse on Crimson Silk"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={submitting}>
                  Save Photo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
