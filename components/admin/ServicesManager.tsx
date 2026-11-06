"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertServiceAction, deleteServiceAction } from "@/lib/actions/settings";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/types/database";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";

interface ServicesManagerProps {
  initialServices: Service[];
}

export default function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setSortOrder(services.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setTitle(s.title);
    setDescription(s.description);
    setImageUrl(s.image_url || "");
    setSortOrder(s.sort_order);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg("Title and description are required");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await upsertServiceAction(
        editingService?.id || null,
        title,
        description,
        imageUrl || null,
        sortOrder
      );

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to save service");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    await deleteServiceAction(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Atelier & Stitching Services
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Manage bespoke stitching, alterations, and custom bridal services displayed on the home page.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Service</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialServices.map((service) => (
          <div
            key={service.id}
            className="bg-surface rounded-sm border border-charcoal/15 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            {service.image_url && (
              <div className="relative aspect-[16/10] bg-charcoal/5">
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl text-charcoal-darkest">
                  {service.title}
                </h3>
                <p className="mt-2 text-xs text-charcoal-light line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between">
                <span className="text-[10px] text-charcoal-light font-mono">
                  Order: #{service.sort_order}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1 text-charcoal-light hover:text-charcoal-darkest"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
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
              {editingService ? "Edit Service" : "Add Service"}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Service Title *"
                placeholder="e.g. Bespoke Bridal Blouses"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="Service Description *"
                rows={3}
                placeholder="Brief explanation of what this atelier service offers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <ImageUpload
                label="Service Image (Supabase Storage)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl("")}
                folder="services"
              />

              <Input
                label="Display Order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
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
                  Save Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
