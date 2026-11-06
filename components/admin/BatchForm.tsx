"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sessionSchema, type SessionInput } from "@/lib/validations/course";
import { upsertBatchAction } from "@/lib/actions/batches";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Course, ClassSession } from "@/types/database";
import { AlertCircle, Calendar, Plus, X } from "lucide-react";

interface BatchFormProps {
  courses: Course[];
  initialBatch?: ClassSession | null;
}

export default function BatchForm({ courses, initialBatch }: BatchFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customDates, setCustomDates] = useState<string[]>(
    initialBatch?.class_dates || (initialBatch?.start_date ? [initialBatch.start_date] : [])
  );
  const [newDateInput, setNewDateInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      course_id: initialBatch?.course_id || courses[0]?.id || "",
      batch_code: initialBatch?.batch_code || "",
      title: initialBatch?.title || "",
      start_date: initialBatch?.start_date || "",
      second_date: initialBatch?.second_date || "",
      class_dates: initialBatch?.class_dates || [],
      start_time: initialBatch?.start_time || "11:00:00",
      end_time: initialBatch?.end_time || "16:00:00",
      location: initialBatch?.location || "Middlefield Rd & McNicoll Ave, Scarborough, ON",
      mode: initialBatch?.mode || "both",
      price_cad: initialBatch?.price_cad ?? 350,
      discount_percent: initialBatch?.discount_percent ?? null,
      discount_label: initialBatch?.discount_label || "",
      seats_total: initialBatch?.seats_total ?? 12,
      seats_left: initialBatch?.seats_left ?? 12,
      online_join_url: initialBatch?.online_join_url || "",
      feedback_open: initialBatch?.feedback_open ?? false,
      status: initialBatch?.status || "upcoming",
      is_published: initialBatch?.is_published ?? true,
    },
  });

  const addDate = () => {
    if (!newDateInput || customDates.includes(newDateInput)) return;
    const updated = [...customDates, newDateInput].sort();
    setCustomDates(updated);
    setValue("class_dates", updated);
    if (!watch("start_date")) {
      setValue("start_date", updated[0]);
    }
    if (updated.length > 1) {
      setValue("second_date", updated[1]);
    }
    setNewDateInput("");
  };

  const removeDate = (d: string) => {
    const updated = customDates.filter((item) => item !== d);
    setCustomDates(updated);
    setValue("class_dates", updated);
  };

  const onSubmit = async (data: SessionInput) => {
    setErrorMsg(null);
    try {
      const datesToSubmit = customDates.length > 0 ? customDates : [data.start_date, ...(data.second_date ? [data.second_date] : [])];
      const res = await upsertBatchAction(initialBatch?.id || null, {
        ...data,
        class_dates: datesToSubmit,
      });

      if (res.success) {
        router.push("/admin/batches");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save batch");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving the batch");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-surface p-6 sm:p-8 rounded-sm border border-charcoal/15 shadow-sm">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: Course & Batch Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
            Associated Course *
          </label>
          <select
            {...register("course_id")}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.course_id && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.course_id.message}</p>
          )}
        </div>

        <Input
          label="Batch Code (Unique ID) *"
          placeholder="e.g. SBM-2026-05"
          error={errors.batch_code?.message}
          {...register("batch_code")}
        />
      </div>

      {/* Row 2: Batch Title */}
      <Input
        label="Batch Display Title *"
        placeholder="e.g. 2-Day Saree Blouse Master Class - May Cohort"
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Row 3: Class Dates Picker */}
      <div className="p-4 bg-subtle/50 rounded-sm border border-charcoal/10 space-y-3">
        <label className="block text-xs uppercase tracking-wider text-charcoal font-medium">
          Class Dates (Multi-Date Support) *
        </label>
        <p className="text-[11px] text-charcoal-light">
          Typically two Sundays (e.g. Sun May 10 and Sun May 17). Add each day below:
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={newDateInput}
            onChange={(e) => setNewDateInput(e.target.value)}
            className="bg-surface border border-charcoal/20 rounded-sm px-3 py-1.5 text-xs text-heading focus:outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={addDate}
            className="inline-flex items-center space-x-1 bg-charcoal text-off-white px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider hover:bg-charcoal-darkest transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Date</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {customDates.map((d) => (
            <span
              key={d}
              className="inline-flex items-center space-x-1.5 bg-surface border border-gold/40 text-heading text-xs px-2.5 py-1 rounded-sm shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-dark" />
              <span className="font-mono">{d}</span>
              <button
                type="button"
                onClick={() => removeDate(d)}
                className="text-rose-500 hover:text-rose-700 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            label="Primary Start Date (Required) *"
            type="date"
            error={errors.start_date?.message}
            {...register("start_date")}
          />
          <Input
            label="Second Date (Optional)"
            type="date"
            error={errors.second_date?.message}
            {...register("second_date")}
          />
        </div>
      </div>

      {/* Row 4: Class Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Class Start Time *"
          type="time"
          error={errors.start_time?.message}
          {...register("start_time")}
        />
        <Input
          label="Class End Time *"
          type="time"
          error={errors.end_time?.message}
          {...register("end_time")}
        />
      </div>

      {/* Row 5: Location & Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Studio Location *"
          placeholder="Middlefield Rd & McNicoll Ave, Scarborough, ON"
          error={errors.location?.message}
          {...register("location")}
        />

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
            Class Mode *
          </label>
          <select
            {...register("mode")}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="both">Both (In-person &amp; Online)</option>
            <option value="in_person">In-Person Only (Scarborough Studio)</option>
            <option value="online">Live Online Only</option>
          </select>
        </div>
      </div>

      {/* Row 6: Pricing, Discounts & Seats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Input
          label="Tuition (CAD $) *"
          type="number"
          step="10"
          placeholder="350"
          error={errors.price_cad?.message}
          {...register("price_cad")}
        />

        <Input
          label="Discount % (Optional)"
          type="number"
          min="0"
          max="100"
          placeholder="30"
          error={errors.discount_percent?.message}
          {...register("discount_percent")}
        />

        <Input
          label="Discount Badge Text"
          placeholder="e.g. 30% OFF"
          error={errors.discount_label?.message}
          {...register("discount_label")}
        />

        <Input
          label="Seats Total / Left *"
          type="number"
          placeholder="12"
          error={errors.seats_left?.message}
          {...register("seats_left")}
        />
      </div>

      {/* Row 7: Zoom Link & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Zoom Online Join URL (Enrolled students only)"
          placeholder="https://zoom.us/j/..."
          error={errors.online_join_url?.message}
          {...register("online_join_url")}
        />

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-medium mb-1.5">
            Batch Status *
          </label>
          <select
            {...register("status")}
            className="w-full bg-surface border border-charcoal/20 rounded-sm px-3.5 py-2.5 text-xs text-heading focus:outline-none focus:border-gold"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Row 8: Toggles */}
      <div className="pt-2 flex flex-wrap gap-8 items-center border-t border-charcoal/10">
        <label className="flex items-center space-x-2 text-xs text-heading cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-gold focus:ring-gold"
            {...register("is_published")}
          />
          <span>Published on website &amp; /classes</span>
        </label>

        <label className="flex items-center space-x-2 text-xs text-heading cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-gold focus:ring-gold"
            {...register("feedback_open")}
          />
          <span>Open for student feedback &amp; public link</span>
        </label>
      </div>

      {/* Submit / Cancel */}
      <div className="flex items-center space-x-4 pt-4 border-t border-charcoal/10">
        <Button type="submit" isLoading={isSubmitting}>
          {initialBatch ? "Update Batch" : "Create Batch"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/batches")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
