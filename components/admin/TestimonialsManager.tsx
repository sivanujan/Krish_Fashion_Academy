"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertTestimonialAction, deleteTestimonialAction } from "@/lib/actions/settings";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Testimonial } from "@/types/database";
import { Plus, Edit2, Trash2, Star, AlertCircle } from "lucide-react";

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialsManager({
  initialTestimonials,
}: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setName("");
    setRole("");
    setMessage("");
    setRating(5);
    setPhotoUrl("");
    setIsPublished(true);
    setSortOrder(testimonials.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setName(t.name);
    setRole(t.role);
    setMessage(t.message);
    setRating(t.rating);
    setPhotoUrl(t.photo_url || "");
    setIsPublished(t.is_published);
    setSortOrder(t.sort_order);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !message) {
      setErrorMsg("Name, role, and message are required");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await upsertTestimonialAction(
        editingTestimonial?.id || null,
        name,
        role,
        message,
        rating,
        photoUrl || null,
        isPublished,
        sortOrder
      );

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to save testimonial");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Delete testimonial from "${author}"?`)) return;
    await deleteTestimonialAction(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Student & Client Reviews
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Manage feedback and star ratings displayed in the homepage slider.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Testimonial</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialTestimonials.map((t) => (
          <div
            key={t.id}
            className="bg-surface rounded-sm border border-charcoal/15 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <Badge variant={t.is_published ? "success" : "neutral"}>
                  {t.is_published ? "Published" : "Draft"}
                </Badge>
              </div>

              <p className="text-xs text-charcoal font-light italic leading-relaxed line-clamp-4">
                &ldquo;{t.message}&rdquo;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {t.photo_url ? (
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-charcoal/10 shrink-0">
                    <Image src={t.photo_url} alt={t.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold/15 text-gold-dark font-serif text-sm flex items-center justify-center shrink-0">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-sm text-charcoal-darkest font-medium">
                    {t.name}
                  </h4>
                  <p className="text-[10px] text-charcoal-light uppercase tracking-wider">
                    {t.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1 text-charcoal-light hover:text-charcoal-darkest"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-darkest/75 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-sm border border-charcoal/20 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in">
            <h3 className="font-serif text-2xl text-charcoal-darkest">
              {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Student / Client Name *"
                placeholder="e.g. Nirosha Fernando"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Role / Title *"
                placeholder="e.g. Saree Blouse Student, Toronto"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <Textarea
                label="Review Message *"
                rows={3}
                placeholder="What the student said about the course..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal font-medium mb-1.5">
                    Rating (Stars)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-surface border border-charcoal/20 rounded-sm px-4 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <Input
                  label="Display Order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <ImageUpload
                label="Author Photo (Optional)"
                value={photoUrl}
                onChange={(url) => setPhotoUrl(url)}
                onRemove={() => setPhotoUrl("")}
                folder="testimonials"
              />

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="testimonial_is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-charcoal/30 text-gold focus:ring-gold"
                />
                <label
                  htmlFor="testimonial_is_published"
                  className="text-xs uppercase tracking-wider text-charcoal font-medium select-none"
                >
                  Published Live on Website
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={submitting}>
                  Save Testimonial
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
