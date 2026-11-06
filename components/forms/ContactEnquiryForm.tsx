"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, type EnquiryInput } from "@/lib/validations/enquiry";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { getWhatsAppUrl } from "@/lib/utils";
import { CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";

interface BatchOption {
  id: string;
  batch_code: string;
  title: string;
}

interface ContactEnquiryFormProps {
  initialCourse?: string;
  initialBatchId?: string;
  availableBatches?: BatchOption[];
}

export default function ContactEnquiryForm({
  initialCourse = "2-Day Saree Blouse Master Class",
  initialBatchId = "",
  availableBatches = [],
}: ContactEnquiryFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      course_interest: initialCourse,
      preferred_mode: "in_person",
      interested_session_id: initialBatchId,
      message: "",
      bot_trap: "",
    },
  });

  const onSubmit = async (data: EnquiryInput) => {
    setServerError(null);
    try {
      const result = await submitEnquiry(data);
      if (result.success) {
        setIsSuccess(true);
        reset();
      } else {
        setServerError(result.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please contact us via WhatsApp.");
    }
  };

  const whatsappDirectUrl = getWhatsAppUrl(
    "16475019569",
    "Hi Krish Fashion Academy! I just submitted an inquiry on your website and would like to register."
  );

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 rounded-sm p-8 text-center animate-in fade-in duration-300 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h4 className="font-serif text-2xl text-emerald-950 font-medium">
          Enquiry Received
        </h4>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
          Thank you for reaching out to Krish Fashion Academy! We will contact you shortly to confirm seat availability and answer your questions.
        </p>

        <div className="pt-2">
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Or message us immediately on WhatsApp</span>
          </a>
        </div>

        <div className="pt-3">
          <button
            onClick={() => setIsSuccess(false)}
            className="text-xs uppercase tracking-widest text-emerald-800 underline hover:text-emerald-950 font-medium"
          >
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Honeypot field for anti-spam (invisible to humans) */}
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="bot_trap">Do not fill this</label>
        <input
          id="bot_trap"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("bot_trap")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Full Name *"
          id="name"
          placeholder="e.g. Priya Shanmugam"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Phone / WhatsApp Number *"
          id="phone"
          placeholder="e.g. +1 647-501-9569"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email Address (Optional)"
          id="email"
          type="email"
          placeholder="e.g. student@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
            Preferred Format
          </label>
          <select
            {...register("preferred_mode")}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="in_person">In-Person (Scarborough Studio)</option>
            <option value="online">Live Online Class</option>
          </select>
        </div>
      </div>

      {availableBatches.length > 0 && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
            Interested Batch (Optional)
          </label>
          <select
            {...register("interested_session_id")}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="">Next Available Upcoming Cohort</option>
            {availableBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.batch_code})
              </option>
            ))}
          </select>
        </div>
      )}

      <Textarea
        label="Your Message or Inquiry *"
        id="message"
        rows={3}
        placeholder="Tell us what you would like to ask regarding class dates, machine access, or registration..."
        error={errors.message?.message}
        {...register("message")}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full sm:w-auto"
          size="lg"
        >
          Submit Inquiry
        </Button>

        <span className="text-xs text-charcoal-light text-center sm:text-left">
          or message Krish on WhatsApp:{" "}
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-dark hover:text-gold font-semibold underline"
          >
            +1 647-501-9569
          </a>
        </span>
      </div>
    </form>
  );
}
