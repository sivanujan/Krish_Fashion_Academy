"use client";

import { useState } from "react";
import {
  upsertFaqAction,
  toggleFaqPublishAction,
  deleteFaqAction,
} from "@/lib/actions/faqs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { FAQ } from "@/types/database";
import {
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";

interface FaqsManagerClientProps {
  initialFaqs: FAQ[];
}

export default function FaqsManagerClient({
  initialFaqs,
}: FaqsManagerClientProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form fields
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setSortOrder(faqs.length + 1);
    setIsPublished(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(faq.sort_order || 0);
    setIsPublished(faq.is_published);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (faq: FAQ) => {
    const nextState = !faq.is_published;
    const res = await toggleFaqPublishAction(faq.id, nextState);
    if (res.success) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, is_published: nextState } : f))
      );
    }
  };

  const handleDelete = async (faq: FAQ) => {
    if (!confirm(`Delete FAQ "${faq.question}"?`)) return;
    const res = await deleteFaqAction(faq.id);
    if (res.success) {
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const isPendingConfirmation = answer.includes("TODO:") || answer.trim() === "";

    try {
      const res = await upsertFaqAction({
        id: editingFaq?.id,
        question,
        answer,
        sort_order: sortOrder,
        is_published: isPendingConfirmation ? false : isPublished,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to save FAQ");
        setIsSubmitting(false);
        return;
      }

      if (editingFaq) {
        setFaqs((prev) =>
          prev.map((f) =>
            f.id === editingFaq.id
              ? {
                  ...f,
                  question,
                  answer,
                  sort_order: sortOrder,
                  is_published: isPendingConfirmation ? false : isPublished,
                }
              : f
          )
        );
      } else {
        window.location.reload();
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-surface p-6 rounded-sm border border-charcoal/15 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-darkest">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            Only published FAQs with verified answers are displayed on the home page accordion and synced with JSON-LD schema.
          </p>
        </div>

        <Button onClick={openAddModal} className="text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New FAQ</span>
        </Button>
      </div>

      {/* FAQs List */}
      <div className="bg-surface rounded-sm border border-charcoal/15 shadow-sm divide-y divide-charcoal/10">
        {faqs.length === 0 ? (
          <div className="p-12 text-center text-charcoal-light text-sm">
            No FAQs recorded yet.
          </div>
        ) : (
          faqs.map((faq, index) => {
            const hasTodo = faq.answer.includes("TODO:");

            return (
              <div
                key={faq.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-subtle/40 transition-colors"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="font-serif text-lg text-charcoal-darkest font-medium">
                      {faq.question}
                    </h3>

                    {hasTodo ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Needs Client Confirmation
                      </span>
                    ) : faq.is_published ? (
                      <Badge variant="gold">Published</Badge>
                    ) : (
                      <Badge variant="neutral">Draft / Hidden</Badge>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-light leading-relaxed pl-7">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(faq)}
                    title={faq.is_published ? "Unpublish FAQ" : "Publish FAQ"}
                    className="p-2 text-charcoal-light hover:text-charcoal border border-charcoal/10 rounded-sm hover:bg-subtle transition-colors"
                  >
                    {faq.is_published ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-charcoal-light" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(faq)}
                    title="Edit FAQ"
                    className="p-2 text-charcoal-light hover:text-charcoal border border-charcoal/10 rounded-sm hover:bg-subtle transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gold-dark" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(faq)}
                    title="Delete FAQ"
                    className="p-2 text-charcoal-light hover:text-rose-600 border border-charcoal/10 rounded-sm hover:bg-subtle transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface rounded-sm border border-gold/40 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-serif text-2xl text-charcoal-darkest">
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-light hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-sm text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                  Question *
                </label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Do I need my own sewing machine?"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                  Answer *
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide the clear, student-friendly answer."
                  rows={4}
                  required
                />
                <p className="text-[10px] text-charcoal-light mt-1">
                  Note: If the answer starts with <code className="text-amber-800">TODO:</code> it will be automatically hidden from public pages until confirmed.
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-charcoal font-medium mb-1">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="faqPublishedCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-charcoal/20 text-gold focus:ring-gold"
                />
                <label
                  htmlFor="faqPublishedCheck"
                  className="text-xs text-charcoal font-medium cursor-pointer"
                >
                  Publish on public home page &amp; FAQ Schema
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-charcoal/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save FAQ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
